const express = require('express');
const app = express();
const argv = require('minimist')(process.argv.slice(2));
const runTest = require('./run-test.js');

app.set('views', __dirname + '/');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
// app.use(express.static('public'));

var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/', (req,res) => {
    res.render('../public/form.ejs');
});

app.post('/chart', (req, res) => {
    const query = req.body;
    // if (testOptions.verbose) console.log(req.body);
    let feeds = query.feeds.split(/\r\n/);
    let testOptions = {
        title: query.title,
        jsonTest: query.test,
        tests: new Array,
        runs: query.runs || argv['runs'] || 10,
        verbose: Boolean(query.verbose) || argv['v'] || argv['verbose'],
        gzip: Boolean(query.gzip) || argv['gzip'] || argv['compression'],
        http2: Boolean(query.http2) || argv['http2'],
        location: query.location || argv['location'],
    };
    for (const feed of feeds) {
        let test = feed.split(/,\s?/);
        testOptions.tests.push({
            label: test[0],
            url: test[1]
        });
    }
    if (testOptions.verbose) console.log(testOptions);
    

    // const testResults = await runTest(testOptions);
    runTest(testOptions)
        .then( testResults => createChart(testOptions, testResults))
        .then( chart => {
            res.render('../public/chart.ejs', {chartData: chart.data, chartOptions: chart.options, pageData: chart.pageData} );
            console.log('Chart complete!');
        });
    

});


const port = 4000;
app.listen(port, () => console.log(`Generate chart at http://localhost:${port} and replace localhost with a server IP`));

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
        width: '100%',
        height: 600,
        chartArea: {
            width: '85%',
            height: '80%',
            // left:10,
            // top:100,
        },
        colors: [
            'rgb(50,100,150)',
            'rgb(75,125,175)',
            'rgb(100,150,200)',
            'rgb(200,75,0)',
            'rgb(225,100,25)',
            'rgb(250,125,50)',
        ],
        seriesType: 'bars',
        vAxis: {
            title: 'Loading time (ms)',
        },
        // hAxis: {title: 'Feed host'},
        legend: {
            maxLines: 2,
        },
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
