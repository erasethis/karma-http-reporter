//var SSE = require('sse'), http = require('http');
var instantly = require('instantly');

var fs = require('fs');
var express = require('express');
var eventsource = require('express-eventsource');
//var instantly = fs.readFileSync('../instantly.min.js'); // Yes. Sync.
var app = express();
var router = express.Router();
var sse = eventsource({
    connections: 2
});
var broadcast = sse.sender('message');

app.set('view engine', 'ejs');
app.set('views', __dirname);

// Enable CORS
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

router.use(sse.middleware());
/*
setInterval(function() {
    broadcast({ time: new Date() });
}, 100);
*/
app.use('/sse', router);

app.get('/', function(req, res) {
    res.send('###### GET received')
});

app.listen(8080, function() {
    console.log('Running on http://localhost:8080');
});

var HttpReporter = function (baseReporterDecorator, config, logger, helper, formatError) {
    var httpConfig = config.httpReporter || {};

    baseReporterDecorator(this);

    this.adapters = [function (msg) {
        process.stdout.write.bind(process.stdout)(msg + '\r\n');
    }];

    this.onRunStart = function(browsers) {
        broadcast('Hello World');
    };

    this.onBrowserStart = function(browser) {
        broadcast('Hello ' + browser.name);
    };

    this.specSuccess = function(browser, result) {
        broadcast('+');

    }

    this.specFailure = function(browser, result) {
        broadcast('-');
    };

    this.onSpecComplete = function(browser, result) {
        if (result.skipped) {
            this.specSkipped(browser, result);
        } else if (result.success) {
            this.specSuccess(browser, result);
        } else {
            this.specFailure(browser, result);
        }
        broadcast(result.description);
    }

    this.onRunComplete = function(browsersCollection, results) {
        broadcast('GoodBye World');
    };
/*
    var server = http.createServer(function(req, res) {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('okay');
    });

    server.listen(8080, '127.0.0.1', function() {
        console.log('[http-reporter] listening on localhost:8080');
        var sse = new SSE(server);
        sse.on('connection', function (client) {
            console.log('[http-reporter] connected');
            client.send('hi there from SSE!');
        });
    });
    */



};

HttpReporter.$inject = ['baseReporterDecorator', 'config', 'logger', 'helper', 'formatError'];

module.exports = {
    'reporter:http': ['type', HttpReporter]
};
