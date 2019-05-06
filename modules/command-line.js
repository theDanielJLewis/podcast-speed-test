const argv = require('minimist')(process.argv.slice(2));
const runTest = require('./run-test.js');

let testOptions = {
    test: argv['test'] || 'demo',
    runs: argv['runs'] || 10,
    mode: argv['mode'] || 'browser',
    verbose: argv['v'] || argv['verbose'],
    gzip: argv['gzip'] || argv['compression'],
    http2: argv['http2'],
    location: argv['location'],
};

(async () => {
    // console.log(testOptions);
    const testResults = await runTest(testOptions);
    console.dir(testResults, { depth: null });
})();
    