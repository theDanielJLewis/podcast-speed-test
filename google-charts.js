const express = require('express');
const app = express();
// var engine = require('consolidate');

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

app.set('views', __dirname + '/');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

function createChart(testResults) {
    console.log(testResults);

    console.log('Preparing chart ...');
    // let data = {
    //     labels: new Array,
    //     averages: new Array,
    //     medians: new Array,
    // }
    // if (http2) {
    //     data.averagesHttp2 = new Array;
    //     data.mediansHttp2 = new Array;
    // }
    // if (gzip) {
    //     data.averagesGzip = new Array;
    //     data.mediansGzip = new Array;
    // }

    // for (const result of testResults.results) {
    //     data.labels.push(result.label);
    //     data.averages.push(result.average);
    //     data.medians.push(result.median);
    //     if (http2) {
    //         data.averagesHttp2.push(result.averageHttp2);
    //         data.mediansHttp2.push(result.medianHttp2);
    //     }
    //     if (gzip) {
    //         data.averagesGzip.push(result.averageGzip);
    //         data.mediansGzip.push(result.medianGzip);
    //     }
    // }

    // if (verbose) console.log(data);
    // let chartData = new Array;

    // if ( chartAverage ) {
    //     var averages = {
    //         x: data.labels,
    //         y: data.averages,
    //         marker: {color: "rgb(50,100,150)"},
    //         name: "Average",
    //         type: "bar"
    //     };
    //     chartData.push(averages);
    // }
    // if ( chartMedian ) {
    //     var medians = {
    //         x: data.labels,
    //         y: data.medians,
    //         marker: {color: "rgb(75,125,175)"},
    //         name: "Median",
    //         type: "bar"
    //     };
    //     var bMedian = {
    //         x: data.labels,
    //         y: benchmarkResults.medians,
    //         marker: {color: "rgb(100,150,200)"},
    //         name: "% of Median Benchmark",
    //         yaxis: "y2",
    //         type: "line"
    //     };
    //     chartData.push(medians, bMedian);
    // }

    // if (gzip) {
    //     if ( chartAverage ) {
    //         var averagesGzip = {
    //             x: data.labels,
    //             y: data.averagesGzip,
    //             marker: {color: "rgb(200,75,0)"},
    //             name: "Gzip Average",
    //             type: "bar"
    //         };
    //         chartData.push(averagesGzip);
    //     }
    //     if ( chartMedian ) {
    //         var mediansGzip = {
    //             x: data.labels,
    //             y: data.mediansGzip,
    //             marker: {color: "rgb(225,100,25)"},
    //             name: "Gzip Median",
    //             type: "bar"
    //         };
    //         var bMedianGzip = {
    //             x: data.labels,
    //             y: benchmarkResults.gzipMedians,
    //             marker: {color: "rgb(250,125,50)"},
    //             name: "% of Gzip Median Benchmark",
    //             yaxis: "y2",
    //             type: "line"
    //         };        
    //         chartData.push(mediansGzip, bMedianGzip);
    //     }
    // }

    // if (http2) {
    //     if ( chartAverage ) {
    //         var averagesHttp2 = {
    //             x: data.labels,
    //             y: data.averagesHttp2,
    //             marker: {color: "rgb(100,0,0)"},
    //             name: "HTTP/2 Average",
    //             type: "bar"
    //         };
    //         chartData.push(averagesHttp2);
    //     }
    //     if ( chartMedian ) {
    //         var mediansHttp2 = {
    //             x: data.labels,
    //             y: data.mediansHttp2,
    //             marker: {color: "rgb(150,0,0)"},
    //             name: "HTTP/2 Median",
    //             type: "bar"
    //         };
    //         chartData.push(mediansHttp2);
    //     }
    // }


    // let testKb = Math.round(testResults.bytes / 1024 * 10) / 10;
    // let testKbGzip = Math.round(testResults.bytesGzip / 1024 * 10) / 10;

    // if (gzip) layout.title +=  ` / ${testKbGzip} KB Gzip`;

    chartColumns = [
        'Feed host',
        'Avg.',
        'Median',
        '% of Median Benchmark',
        'Gzip Avg.',
        'Gzip Median',
        '% of Gzip Median Benchmark',
    ];

    let chartRows = new Array;

    for (const result of testResults.results) {
        // console.log(result.label);
        chartRows.push([
            result.label,
            result.average,
            result.median,
            result.bMedian,
            result.averageGzip,
            result.medianGzip,
            result.bMedianGzip,
        ]);
    }
    console.log(chartRows);
    
    app.get('/', (req, res) => {
        
        let chartData = [
            chartColumns,
            ...chartRows,
        //     ['Copper', 8.94, '#b87333'],            // RGB value
        //     ['Silver', 10.49, 'silver'],            // English color name
        //     ['Gold', 19.30, 'gold'],
    
        //   ['Platinum', 21.45, 'color: #e5e4e2' ], // CSS-style declaration
         ];

         let chartOptions = {
            width: '100%',
            height: 600,
            colors: [
                'rgb(50,100,150)',
                'rgb(75,125,175)',
                'rgb(100,150,200)',
                'rgb(200,75,0)',
                'rgb(225,100,25)',
                'rgb(250,125,50)',
            ],
            seriesType: 'bars',
            vAxis: {title: 'Loading time (ms)'},
            hAxis: {title: 'Feed host'},
            series: {
                2: {
                    type: 'line',
                    targetAxisIndex: 1,
                    lineWidth: 4,
                },
                5: {
                    type: 'line',
                    targetAxisIndex: 1,
                    lineWidth: 4,
                }
            },
            vAxes: {
                0: {
                    baseline: 0,
                },
                1: {
                    title: '% compared to benchmark',
                    baseline: 0,
                    gridlines: { count: 0 },
                }
            }
         }

         console.log('DATA:',chartData);
    
        res.render('chart.ejs', {chartData, chartOptions} );
    });
    
    app.listen(4000, () => console.log('Listening on port 4000 ...'));
}   

module.exports = createChart;