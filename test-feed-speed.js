const request = require('h2-request');
const argv = require('minimist')(process.argv.slice(2));
const jsonfile = require('jsonfile');
const async = require('async');
const gzipSize = require('gzip-size');
const createChart = require('./plotly.js');

let runs = argv['runs'] || 10;
let test = argv['test'] || 'demo';
let urlListFile = 'tests/' + test + '.json';
let reqOptions = {
    time: true,
}

if ( argv['v'] || argv['verbose'] ) var verbose = true;
if ( argv['http2'] ) var http2 = true;
if ( argv['gzip'] || argv['compression'] ) var gzip = true;
if ( argv['label'] ) {
    var addLabel = true;
    var labelAppend = '<br>' + argv['label'];
}

jsonfile.readFile(urlListFile, function (err, testSettings) {
    if (err) console.error(err);

    let testResults = {
        title: testSettings.title,
        runs,
        file: testSettings.file,
        results: []
    };

    async.eachLimit(testSettings.tests, 1, (url, eachCallback) => {
        console.log('Testing',url.label,'...');
        url.runResults = [];
        if (http2) url.runResultsHttp2 = [];
        if (gzip) url.runResultsGzip = [];

        async.timesLimit(runs, 1, (index, timesCallback) => {
            // setTimeout(() => {
                request(url.url, { ...reqOptions, disableHttp2: true }, (error, response, body) => {
                    // console.log(response.timingPhases.total);
                    url.runResults.push(Math.round(response.timingPhases.total));
                    // url.average = Math.round(average(url.runResults));
                    // url.median = median(url.runResults);
                    if (index === 0 ) {
                        url.bytes = body.length;
                        url.label += `<br>(${Math.round(url.bytes / 1024 * 10) / 10} KB)`;
                        if (addLabel) url.label += labelAppend;
                    }
                    
                    if (gzip) {
                        request(url.url, { ...reqOptions, disableHttp2: true, gzip: true }, (error, response, body) => {
                            if (index === 0 ) {
                                url.bytesGzip = response.headers['content-length'] || gzipSize.sync(body);
                                url.label += `<br>(${Math.round(url.bytes / 1024 * 10) / 10} KB / ${Math.round(url.bytesGzip / 1024 * 10) / 10} KB)`;
                                if (addLabel) url.label += labelAppend;
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
                    } else if (http2) {
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
                if (gzip) {
                    url.averageGzip = Math.round(average(url.runResultsGzip));
                    url.medianGzip = median(url.runResultsGzip);
                }
                if (http2) {
                    url.averageHttp2 = Math.round(average(url.runResultsHttp2));
                    url.medianHttp2 = median(url.runResultsHttp2);
                }
                testResults.results.push(url);
                if (verbose) console.log(url);
                eachCallback();
            }
        });
    }, function (error) {
        if (error) {
            console.log('eachCallback error:', error);
        } else {
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
            if (gzip) {
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