const argv = require('minimist')(process.argv.slice(2));
const jsonFile = require('jsonfile');

let runs = argv['runs'] || 10;
let test = argv['test'];

async function createChart(testResults, benchmarkResults) {
    const plotlyCreds = await jsonFile.readFile('./plotly-creds.json');
    const plotlyUsername = process.env.plotlyUsername || plotlyCreds.username;
    const plotlyApi = process.env.plotlyApi || plotlyCreds.api;
    const plotly = require('plotly')(plotlyUsername, plotlyApi);
    
    console.log('Preparing chart...');
    let data = {
        labels: new Array,
        averages: new Array,
        medians: new Array,
    }
    if (argv['http2']) {
        data.averagesHttp2 = new Array;
        data.mediansHttp2 = new Array;
    }
    if (argv['gzip']) {
        data.averagesGzip = new Array;
        data.mediansGzip = new Array;
    }

    for (const result of testResults.results) {
        data.labels.push(result.label);
        data.averages.push(result.average);
        data.medians.push(result.median);
        if (argv['http2']) {
            data.averagesHttp2.push(result.averageHttp2);
            data.mediansHttp2.push(result.medianHttp2);
        }
        if (argv['gzip']) {
            data.averagesGzip.push(result.averageGzip);
            data.mediansGzip.push(result.medianGzip);
        }
    }

    console.log(data);
    
    var averages = {
        x: data.labels,
        y: data.averages,
        name: "Average",
        type: "bar"
    };
    var medians = {
        x: data.labels,
        y: data.medians,
        name: "Median",
        type: "bar"
    };
    var bMedian = {
        x: data.labels,
        y: benchmarkResults.medians,
        name: "% of Median Benchmark",
        yaxis: "y2",
        type: "line"
    };
    if (argv['http2']) {
        var averagesHttp2 = {
            x: data.labels,
            y: data.averagesHttp2,
            name: "HTTP/2 Average",
            type: "bar"
        };
        var mediansHttp2 = {
            x: data.labels,
            y: data.mediansHttp2,
            name: "HTTP/2 Median",
            type: "bar"
        };
        var chartData = [averages, medians, averagesHttp2, mediansHttp2];
    } else if (argv['gzip']) {
            var averagesGzip = {
                x: data.labels,
                y: data.averagesGzip,
                name: "Gzip Average",
                type: "bar"
            };
            var mediansGzip = {
                x: data.labels,
                y: data.mediansGzip,
                name: "Gzip Median",
                type: "bar"
            };
            var bMedianGzip = {
                x: data.labels,
                y: benchmarkResults.gzipMedians,
                name: "% of Gzip Median Benchmark",
                yaxis: "y2",
                type: "line"
            };        
            var chartData = [averages, medians, averagesGzip, mediansGzip, bMedian,bMedianGzip];
    } else {
        var chartData = [averages, medians, bMedian];
    }
    
    var layout = {
        autosize: true,
        // autosize: false,
        // width: 1000,
        // height: 500,
        // margin: {
        // //   l: 200,
        // //   r: 200,
        // //   b: 100,
        // //   t: 100,
        //   pad: 0
        // },      
        title: `${testResults.label} feed loading time (${runs} runs)`,
        barmode: "group",
        xaxis: {
            title: 'Feed source',
        },
        yaxis: {
            title: "Loading time (ms)",
        },
        yaxis2: {
            // title: "Percent of benchmark",
            overlaying: "y",
            // side: "right",
            autorange: true,
            rangemode: "tozero",
            showgrid: false,
            zeroline: false,
            showline: false,
            autotick: true,
            ticks: "",
            showticklabels: false        
        }
    };
    var graphOptions = {layout: layout, filename: testResults.file || test, fileopt: "overwrite"};
    plotly.plot(chartData, graphOptions, function (err, msg) {
        if (err) console.log(err.body);

        console.log(msg);
    });

}

module.exports = createChart;