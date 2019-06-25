const request = require('h2-request');
const argv = require('minimist')(process.argv.slice(2));
const jsonfile = require('jsonfile');
const async = require('async');
const gzipSize = require('gzip-size');

let reqOptions = {
    time: true,
}

function runTest(testOptions) {
    return new Promise( async (resolve, reject) => {
        if ( testOptions.location ) {
            var addLabel = true;
            var labelAppend = '<br>' + argv['label'];
        }
    
        if (testOptions.jsonTest) {
            let urlListFile = 'sample-tests/' + testOptions.jsonTest + '.json';
            let jsonTest = await jsonfile.readFile(urlListFile);
            testOptions.title = jsonTest.title;
            testOptions.tests = jsonTest.tests;
            testOptions.file = jsonTest.file;
        }

        let testResults = {
            title: testOptions.title,
            runs: testOptions.runs,
            // file: jsonTest.file,
            results: []
        };
        
        async.timesLimit(testOptions.tests.length, 1, (test, eachCallback) => {
            let url = testOptions.tests[test];
            console.log('Testing',url.label,url.url,'...');
            url.runResults = [];
            if (testOptions.http2) url.runResultsHttp2 = [];
            if (testOptions.gzip) url.runResultsGzip = [];
        
            async.timesLimit(testOptions.runs, 1, (index, timesCallback) => {
                request(url.url, { ...reqOptions, disableHttp2: true }, (error, response, body) => {
                    url.runResults.push(Math.round(response.timingPhases.total));
                    if (testOptions.verbose) console.log(Math.round(response.timingPhases.total));
                    // url.average = Math.round(average(url.runResults));
                    // url.median = median(url.runResults);
                    if (index === 0 ) {
                        url.bytes = body.length;
                        // if (addLabel) url.label += labelAppend;
                        // if (! gzip) {
                        //     url.label += `<br>(${Math.round(url.bytes / 1024 * 10) / 10} KB)`;
                        // }
                        // if ()
                        if ( test === 0 ) {
                            testResults.sourceBytes = url.bytes;
                        }
                    }
                    
                    if (testOptions.gzip) {
                        request(url.url, { ...reqOptions, disableHttp2: true, gzip: true }, (error, response, body) => {
                            if (testOptions.verbose) console.log(Math.round(response.timingPhases.total));
                            if (index === 0 ) {
                                url.bytesGzip = Number(response.headers['content-length']) || gzipSize.sync(body);
                                // url.label += `<br>(${Math.round(url.bytes / 1024 * 10) / 10} KB / ${Math.round(url.bytesGzip / 1024 * 10) / 10} KB)`;
                                // if (addLabel) url.label += labelAppend;
                                if ( test === 0 ) {
                                    testResults.sourceBytesGzip = Number(url.bytesGzip);
                                }        
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
                    } else if (testOptions.http2) {
                        request(url.url, { ...reqOptions }, (error, response, body) => {
                            if (testOptions.verbose) console.log(Math.round(response.timingPhases.total));
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
            }, function (error) {
                if (error) {
                    console.log('timesCallback error:', error);
                    eachCallback();
                } else {
                    url.average = Math.round(calcAverage(url.runResults));
                    url.median = calcMedian(url.runResults);
                    if (testOptions.gzip) {
                        url.averageGzip = Math.round(calcAverage(url.runResultsGzip));
                        url.medianGzip = calcMedian(url.runResultsGzip);
                    }
                    if (testOptions.http2) {
                        url.averageHttp2 = Math.round(calcAverage(url.runResultsHttp2));
                        url.medianHttp2 = calcMedian(url.runResultsHttp2);
                    }
                    testResults.results.push(url);
                    if (testOptions.verbose) console.log(url);
                    eachCallback();
                }
            });
        }, async function (error) {
            if (error) {
                console.log('eachCallback error:', error);
            } else {
                if (testOptions.benchmark) {
                    finalResults = await calcBenchmark(testResults);
                } else {
                    finalResults = testResults;
                }
                resolve(finalResults);
            }
        });
    });
}




function calcBenchmark(testResults) {
    return new Promise( (resolve, reject) => {

        let benchmarkTest = testResults.results[testResults.results.length - 1];

        for (const result of testResults.results) {
            result.benchmarkMedian = result.median / benchmarkTest.median;

            if (result.medianGzip) {
                result.benchmarkMedianGzip = result.medianGzip / benchmarkTest.medianGzip;
            }
        }
        resolve(testResults);

    });
}

function calcMedian(values) {
    if (values.length === 0) return 0;
  
    values.sort(function(a,b){
      return a-b;
    });
  
    var half = Math.floor(values.length / 2);
  
    if (values.length % 2) return values[half];
  
    return Math.round((values[half - 1] + values[half]) / 2.0);
}  

function calcAverage(values) {
  if (values.length === 0) return 0;

  let average = values.reduce((a, b) => a + b) / values.length;

  return Math.round(average);
}

module.exports = runTest;