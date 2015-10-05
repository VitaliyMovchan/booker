// Load .env file
require('dotenv').load();

var express     = require('express'),
    request     = require('request'),
    telegram    = require('./modules/telegram'),
    salesforce  = require('./modules/salesforce');

var app = express();

// Start salesforce server
salesforce.start(
    process.env.SF_LOGIN,
    process.env.SF_PASSWORD,
    process.env.SF_SECURTY_TOKEN,
    process.env.SF_POLLING_INTERVAL
);

// Start telegram server
telegram.start(process.env.TELEGRAM_TOKEN, function() {
    // Use telegram for sending
    salesforce.use(telegram);
});

// Redirect incoming messages to SF
telegram.onMessage(function(err, message) {
    salesforce.onMessage(err, message);
});

// Bind routes
app.get('/:type(photo|video|voice|contact|document|sticker)/:id', function (req, res) {
    var file = 'https://api.telegram.org/file/bot' + process.env.TELEGRAM_TOKEN;
    var url  = 'https://api.telegram.org/bot' + process.env.TELEGRAM_TOKEN + '/getFile?file_id=' + req.params.id;

    var generateFileUrl = function(result) {
        var file_url = file + '/' + result.file_path;
        res.redirect(file_url);
    };

    request(url, function(err, response, body) {
        if (!err && response.statusCode == 200) {
            var data = JSON.parse(body);

            if (data.ok) {
                generateFileUrl(data.result)
            }
        } else {
            res.send(400);
        }
    })
});

app.get('/location/:latitude/:longitude', function (req, res) {
    var googleMapsUrl  = 'http://maps.google.de/maps?q=loc:' + req.params.latitude + ',' + req.params.longitude
    res.redirect(googleMapsUrl);
});

app.get("*", function(req, res) {
    res.redirect(process.env.BASE_HOST);
});

// Start http server
var server = app.listen(process.env.HTTP_PORT, function () {
    console.log('[http] server started at port: %s', process.env.HTTP_PORT);
});
