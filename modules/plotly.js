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
let chart = argv['chart'];
if ( chart == 'average' || chart == 'averages' || chart == true ) var chartAverage = true;
if ( chart == 'median' || chart == 'medians' || chart == true ) var chartMedian = true;

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
    let chartData = new Array;

    if ( chartAverage ) {
        var averages = {
            x: data.labels,
            y: data.averages,
            marker: {color: "rgb(50,100,150)"},
            name: "Average",
            type: "bar"
        };
        chartData.push(averages);
    }
    if ( chartMedian ) {
        var medians = {
            x: data.labels,
            y: data.medians,
            marker: {color: "rgb(75,125,175)"},
            name: "Median",
            type: "bar"
        };
        var bMedian = {
            x: data.labels,
            y: benchmarkResults.medians,
            marker: {color: "rgb(100,150,200)"},
            name: "% of Median Benchmark",
            yaxis: "y2",
            type: "line"
        };
        chartData.push(medians, bMedian);
    }

    if (gzip) {
        if ( chartAverage ) {
            var averagesGzip = {
                x: data.labels,
                y: data.averagesGzip,
                marker: {color: "rgb(200,75,0)"},
                name: "Gzip Average",
                type: "bar"
            };
            chartData.push(averagesGzip);
        }
        if ( chartMedian ) {
            var mediansGzip = {
                x: data.labels,
                y: data.mediansGzip,
                marker: {color: "rgb(225,100,25)"},
                name: "Gzip Median",
                type: "bar"
            };
            var bMedianGzip = {
                x: data.labels,
                y: benchmarkResults.gzipMedians,
                marker: {color: "rgb(250,125,50)"},
                name: "% of Gzip Median Benchmark",
                yaxis: "y2",
                type: "line"
            };        
            chartData.push(mediansGzip, bMedianGzip);
        }
    }

    if (http2) {
        if ( chartAverage ) {
            var averagesHttp2 = {
                x: data.labels,
                y: data.averagesHttp2,
                marker: {color: "rgb(100,0,0)"},
                name: "HTTP/2 Average",
                type: "bar"
            };
            chartData.push(averagesHttp2);
        }
        if ( chartMedian ) {
            var mediansHttp2 = {
                x: data.labels,
                y: data.mediansHttp2,
                marker: {color: "rgb(150,0,0)"},
                name: "HTTP/2 Median",
                type: "bar"
            };
            chartData.push(mediansHttp2);
        }
    }


    let testKb = Math.round(testResults.bytes / 1024 * 10) / 10;
    let testKbGzip = Math.round(testResults.bytesGzip / 1024 * 10) / 10;

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
        title: `${testResults.title} feed loading time (${runs} runs)<br>Source: ${testKb} KB uncompressed`,
        barmode: "group",
        xaxis: {
            title: 'Feed host',
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

    if (gzip) layout.title +=  ` / ${testKbGzip} KB Gzip`;

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