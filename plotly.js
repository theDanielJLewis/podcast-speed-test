const argv = require('minimist')(process.argv.slice(2));
const jsonFile = require('jsonfile');

let runs = argv['runs'] || 10;
let test = argv['test'] || 'demo';

if ( argv['v'] || argv['verbose'] ) var verbose = true;
if ( argv['http2'] ) var http2 = true;
if ( argv['gzip'] || argv['compression'] ) var gzip = true;
if ( argv['append'] ) {
    var fileopt = 'extend';
} else {
    var fileopt = 'overwrite';
}


async function createChart(testResults, benchmarkResults) {
    try {
        const plotlyCreds = await jsonFile.readFile('./plotly-creds.json');
        plotlyUsername = plotlyCreds.username;
        plotlyApi = plotlyCreds.api;        
    } catch (error) {
        plotlyUsername = process.env.plotlyUsername;
        plotlyApi = process.env.plotlyApi;                
    }
    const plotly = require('plotly')(plotlyUsername, plotlyApi);
    
    console.log('Preparing chart ...');
    let data = {
        labels: new Array,
        averages: new Array,
        medians: new Array,
    }
    if (http2) {
        data.averagesHttp2 = new Array;
        data.mediansHttp2 = new Array;
    }
    if (gzip) {
        data.averagesGzip = new Array;
        data.mediansGzip = new Array;
    }

    for (const result of testResults.results) {
        data.labels.push(result.label);
        data.averages.push(result.average);
        data.medians.push(result.median);
        if (http2) {
            data.averagesHttp2.push(result.averageHttp2);
            data.mediansHttp2.push(result.medianHttp2);
        }
        if (gzip) {
            data.averagesGzip.push(result.averageGzip);
            data.mediansGzip.push(result.medianGzip);
        }
    }

    if (verbose) console.log(data);

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
    if (http2) {
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
    } else if (gzip) {
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
        title: `${testResults.title} feed loading time (${runs} runs)`,
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
    var graphOptions = {layout: layout, filename: testResults.file || test, fileopt};
    plotly.plot(chartData, graphOptions, function (err, msg) {
        if (err) console.log(err.body);

        if (verbose) {
            console.log(msg);
        }
        console.log('Chart ready at',msg.url);
    });

}

module.exports = createChart;