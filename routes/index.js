var routesTelegram = require('./telegram');

function routes(app, host) {
    app.get("*", function(req, res) {
        res.redirect(host);
    });
}

routes.telegram = function(app, telegramToken) {
	routesTelegram(app, telegramToken);
};

module.exports = routes;
