var request = require('request');

module.exports = function(app, telegramToken) {
    app.get('/:type(photo|video|voice|contact|document|sticker)/:id', function(req, res) {
        var url = 'https://api.telegram.org/bot' + telegramToken + '/getFile?file_id=' + req.params.id;

        request(url, function(err, response, body) {
            if (err || response.statusCode !== 200 || typeof body === 'undefined' || JSON.parse(body).ok === undefined) return res.send(400);
            var file_url = 'https://api.telegram.org/file/bot' + telegramToken + '/' + JSON.parse(body).result.file_path;
            res.redirect(file_url);
        });
    });

    app.get('/location/:latitude/:longitude', function(req, res) {
        var googleMapsUrl = 'http://maps.google.de/maps?q=loc:' + req.params.latitude + ',' + req.params.longitude
        res.redirect(googleMapsUrl);
    });
};
