const request = require('h2-request');
const argv = require('minimist')(process.argv.slice(2));
const Bottleneck = require('bottleneck');
const jsonfile = require('jsonfile');
const async = require('async');
const gzipSize = require('gzip-size');
const createChart = require('./plotly.js');

var limiter = new Bottleneck({
    maxConcurrent: 1,
    // minTime: 10,
    // reservoir: 2, // initial value
    // reservoirRefreshAmount: 2,
    // reservoirRefreshInterval: 1 * 1000 // must be divisible by 250
});

let runs = argv['runs'] || 10;
let test = argv['test'] || 'libsyn';
let urlListFile = 'tests/' + test + '.json';
let reqOptions = {
    time: true,
}

if (argv['http2']) {
    console.log('Using HTTP/2');
} else {
    console.log('Using HTTP/1.1');
}

jsonfile.readFile(urlListFile, function (err, testSettings) {
    if (err) console.error(err);

    let testResults = {
        label: testSettings.label,
        runs,
        file: testSettings.file,
        results: []
    };

    async.eachLimit(testSettings.tests, 1, (url, eachCallback) => {
        console.log('Testing',url.label);
        url.runResults = [];
        if (argv['http2']) url.runResultsHttp2 = [];
        if (argv['gzip']) url.runResultsGzip = [];

        async.timesLimit(runs, 1, (index, timesCallback) => {
            // setTimeout(() => {
                request(url.url, { ...reqOptions, disableHttp2: true }, (error, response, body) => {
                    // console.log(response.timingPhases.total);
                    url.runResults.push(Math.round(response.timingPhases.total));
                    // url.average = Math.round(average(url.runResults));
                    // url.median = median(url.runResults);
                    if (index === 0 ) {
                        url.bytes = body.length;
                    }
                    
                    if (argv['gzip']) {
                        request(url.url, { ...reqOptions, disableHttp2: true, gzip: true }, (error, response, body) => {
                            if (index === 0 ) {
                                url.bytesGzip = response.headers['content-length'] || gzipSize.sync(body);
                                url.label = `${url.label}<br>(${Math.round(url.bytes / 1024 * 10) / 10} KB / ${Math.round(url.bytesGzip / 1024 * 10) / 10} KB)`;
                            }        
                            if (error) {
                                // console.log(error);
                                // timesCallback(error);
                                url.runResultsGzip.push(0);
                                timesCallback();
                            } else {
                                url.runResultsGzip.push(Math.round(response.timingPhases.total));
                                timesCallback();
                            }
                        });    
                    } else if (argv['http2']) {
                        request(url.url, { ...reqOptions }, (error, response, body) => {
                            if (error) {
                                // console.log(error);
                                // timesCallback(error);
                                url.runResultsHttp2.push(0);
                                timesCallback();
                            } else {
                                url.runResultsHttp2.push(Math.round(response.timingPhases.total));
                                timesCallback();
                            }
                        });    
                    } else {
                        timesCallback();
                    }
                });                
            // }, 1000);
        }, function (error) {
            if (error) {
                console.log('timesCallback error:', error);
                eachCallback();
            } else {
                url.average = Math.round(average(url.runResults));
                url.median = median(url.runResults);
                if (argv['gzip']) {
                    url.averageGzip = Math.round(average(url.runResultsGzip));
                    url.medianGzip = median(url.runResultsGzip);
                }
                if (argv['http2']) {
                    url.averageHttp2 = Math.round(average(url.runResultsHttp2));
                    url.medianHttp2 = median(url.runResultsHttp2);
                }
                testResults.results.push(url);
                console.log(url);
                eachCallback();
            }
        });
    }, function (error) {
        if (error) {
            console.log('eachCallback error:', error);
        } else {
            console.log('Finished each');
            benchmark(testResults)
                .then( (benchmarkResults) => { 
                    if (argv['chart']) {
                        createChart(testResults, benchmarkResults);
                    }
                })
                .catch( error => console.log(error));
        }
    });
});

function benchmark(testResults) {
    return new Promise( (resolve, reject) => {
        let benchmarkResults = {
            gzipMedians: [],
            medians: []
        };

        let benchmarkTest = testResults.results[testResults.results.length - 1];

        for (const result of testResults.results) {
            benchmarkResults.medians.push(Math.round(result.median / benchmarkTest.median * 100));
            if (argv['gzip']) {
                benchmarkResults.gzipMedians.push(Math.round(result.medianGzip / benchmarkTest.medianGzip * 100));
            }
        }
        resolve(benchmarkResults);

    });
}

function median(values) {
    if (values.length === 0) return 0;
  
    values.sort(function(a,b){
      return a-b;
    });
  
    var half = Math.floor(values.length / 2);
  
    if (values.length % 2) return values[half];
  
    return (values[half - 1] + values[half]) / 2.0;
}  

function average(values) {
  if (values.length === 0) return 0;

  let average = values.reduce((a, b) => a + b) / values.length;

  return average;
}