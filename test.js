const argv = require('minimist')(process.argv.slice(2));

// console.log(Object.keys(argv).length);

if (Object.keys(argv).length <= 1 || argv['mode'] == 'browser' ) { // Browser mode
    console.log('Performing test in browser mode ...')
    require('./modules/browser-test.js');
} else { // Command-line mode
    console.log('Performing test in command-line mode ...');
    require('./modules/command-line.js');
}