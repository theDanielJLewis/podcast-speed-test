const express = require('express');
const app = express();
const argv = require('minimist')(process.argv.slice(2));
const runTest = require('./run-test.js');

app.set('views', __dirname + '/');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static('public'));

app.get('/', async (req, res) => {
    const query = req.query;
    
    let testOptions = {
        test: query.test || argv['test'] || 'demo',
        runs: query.runs || argv['runs'] || 10,
        verbose: argv['v'] || argv['verbose'],
        gzip: Boolean(query.gzip) || argv['gzip'] || argv['compression'],
        http2: Boolean(query.http2) || argv['http2'],
        location: query.location || argv['location'],
    };

    const testResults = await runTest(testOptions);
    const chart = await createChart(testOptions, testResults);
    console.log('Chart complete!');
    if (testOptions.verbose) console.dir(testResults, { depth: null });
    
    res.render('../public/chart.ejs', {chartData: chart.data, chartOptions: chart.options, pageData: chart.pageData} );

});

// console.log(argv['test']);

const port = 4000;
app.listen(port, () => console.log(`Generate chart at http://localhost:${port}`));

function createChart(testOptions, testResults) {

    // let testKb = Math.round(testResults.bytes / 1024 * 10) / 10;
    // let testKbGzip = Math.round(testResults.bytesGzip / 1024 * 10) / 10;

    // if (gzip) layout.title +=  ` / ${testKbGzip} KB Gzip`;

    chartColumns = [
        'Feed host',
        'Avg.',
        'Median',
        '× Median Benchmark',
    ];
    
    if (testOptions.gzip) {
        chartColumns.push(
            'Gzip Avg.',
            'Gzip Median',
            '× Gzip Median Benchmark',
        );
    }

    let chartRows = new Array;

    for (const result of testResults.results) {
        // console.log(result.label);
        if (testOptions.gzip) {
            chartRows.push([
                result.label,
                result.average,
                result.median,
                result.benchmarkMedian,
                result.averageGzip,
                result.medianGzip,
                result.benchmarkMedianGzip,
            ]);
        } else {
            chartRows.push([
                result.label,
                result.average,
                result.median,
                result.benchmarkMedian,
            ]);
        }
    }

    let chart = new Object;
    
    chart.pageData = {
        title: 'Feed performance',
        subtitle: '',
    }
    
    chart.data = [
        chartColumns,
        ...chartRows,
    ];

    chart.options = {
        width: 'auto',
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
                title: '× Benchmark',
                baseline: 0,
                gridlines: { count: 0 },
                format: '##.##×'
            }
        }
    }
    return new Promise( (resolve, reject) => {
        resolve(chart);
    });
    
}   
