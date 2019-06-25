const express = require('express');
const app = express();
const argv = require('minimist')(process.argv.slice(2));
const runTest = require('./run-test.js');
const testFolder = './sample-tests/';
const fs = require('fs');
var Time = require('time-diff');
var time = new Time();
const os = require('os');

const hostname = os.hostname;

app.set('views', __dirname + '/');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
// app.use(express.static('public'));

var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/', (req,res) => {
    fs.readdir(testFolder, (err, sampleTests) => {
        res.render('../public/form.ejs', {sampleTests, hostname});
      });
});

app.post('/chart', (req, res) => {
    time.start('timer');
    req.setTimeout((120*60*1000));
    const query = req.body;
    let testOptions = {
        title: query.title,
        jsonTest: query.test,
        tests: new Array,
        runs: query.runs || argv['runs'] || 10,
        verbose: Boolean(query.verbose) || argv['v'] || argv['verbose'],
        gzip: Boolean(query.gzip) || argv['gzip'] || argv['compression'],
        http2: Boolean(query.http2) || argv['http2'],
        benchmark: Boolean(query.benchmark) || argv['benchmark'],
        location: query.location || argv['location'],
        image: Boolean(query.image),
        table: Boolean(query.table),
        showNumbers: query.showNumbers,
    };
    
    // if (testOptions.verbose) console.log('Form data', req.body);

    for (let index = 0; index < query.urls.length; index++) {
        const label = query.labels[index];
        const url = query.urls[index];
        // console.log(label,url);
        if ( label && url ) {
            testOptions.tests.push({
                label,
                url
            });
        } else if ( ! label && url ) {
            testOptions.tests.push({
                label: url,
                url
            });
        }  
    }

    if (testOptions.verbose) console.log(testOptions);

    runTest(testOptions)
        .then( testResults => createChart(testOptions, testResults))
        .then( chart => {
            res.render('../public/chart.ejs', {chartData: chart.data, chartOptions: chart.options, pageOptions: chart.pageOptions} );
            console.log(`Chart complete in ${time.end('timer')}`);
        });

});


const port = 4000;
app.listen(port, () => console.log(`Generate chart at http://localhost:${port} and replace localhost with a server IP`));

function createChart(testOptions, testResults) {
    if (testOptions.verbose) console.log(testResults);

    let testKb = Math.round(testResults.sourceBytes / 1024 * 10) / 10;
    let subtitle = `Source: ${testKb} KB uncompressed`;

    if (testOptions.gzip) {
        let testKbGzip = Math.round(testResults.sourceBytesGzip / 1024 * 10) / 10;
        subtitle +=  ` / ${testKbGzip} KB Gzip`;
    }

    chartColumns = [
        'Feed host',
        'Avg.',
        'Median',
    ];
    if (testOptions.benchmark) chartColumns.push('× Median Benchmark')
    
    if (testOptions.gzip) {
        chartColumns.push(
            'Gzip Avg.',
            'Gzip Median',
        );
        if (testOptions.benchmark) chartColumns.push('× Gzip Median Benchmark')
    }

    if (testOptions.runs > 1) {
        runsLabel = 'runs';
    } else {
        runsLabel = 'run';
    }

    let chartRows = new Array;

    for (const result of testResults.results) {
        // console.log(result.label);
        let pushToChart = [
            result.label,
            result.average,
            result.median,
        ];
        if (testOptions.benchmark) pushToChart.push(result.benchmarkMedian);
        
        if (testOptions.gzip) {
            pushToChart.push(
                result.averageGzip,
                result.medianGzip,
            );
            if (testOptions.benchmark) pushToChart.push(result.benchmarkMedianGzip);
        }

        chartRows.push(pushToChart);
    }

    
    let chart = new Object;
    
    chart.pageOptions = {
        // title: testOptions.title + ' feed performance',
        // subtitle: '',
        hostname,
        image: testOptions.image,
        table: testOptions.table,
        ...testOptions
    }
    
    chart.data = [
        chartColumns,
        ...chartRows,
    ];
    if (testOptions.verbose) console.log(chart.data);
    
    chart.options = {
        width: '100%',
        height: 700,
        title: `${testOptions.title} performance (${testOptions.runs} ${runsLabel})`,
        titleTextStyle: {
            fontSize: 24,
            bold: false,
        },
        chartArea: {
            width: '85%',
            height: '70%',
            // left:10,
            // top:100,
            bottom: 150,
        },
        colors: [
            'rgb(50,100,150)',
            'rgb(75,125,175)',
            'rgb(200,75,0)',
            'rgb(225,100,25)',
        ],
        seriesType: 'bars',
        vAxis: {
            title: 'Loading time (ms)',
        },
        hAxis: {
            title: subtitle,
            // slantedTextAngle: 90,
            maxTextLines: 2,
        },
        legend: {
            maxLines: 2,
            position: 'top',
            alignment: 'center',
        },
        vAxes: {
            0: {
                baseline: 0,
            },
        }
    }

    if (testOptions.benchmark) {
        chart.options.colors = [
            'rgb(50,100,150)',
            'rgb(75,125,175)',
            'rgb(100,150,200)',
            'rgb(200,75,0)',
            'rgb(225,100,25)',
            'rgb(250,125,50)',
        ];
        chart.options.series = {
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
        }
        chart.options.vAxes[1] = {
            title: '× Benchmark',
            baseline: 0,
            gridlines: { count: 0 },
            format: '##.##×'
        }
    }
    return new Promise( (resolve, reject) => {
        resolve(chart);
    });
    
}   
