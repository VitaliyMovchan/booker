require('dotenv-safe').load();

var express = require('express');
var expressRoutes = require('./routes');
var telegram = require('./modules/telegram');
var salesforce = require('./modules/salesforce');
var app = express();
var automation = require('./modules/automation');

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

  automation(message, function(err, allMessagesString) {
    message.text = allMessagesString;
    salesforce.onMessage(err, message);
  });

});

expressRoutes.telegram(app, process.env.TELEGRAM_TOKEN);
expressRoutes(app, process.env.BASE_HOST);

// Start http server
var server = app.listen(process.env.HTTP_PORT, function() {
  console.log('[Express] HTTP server started at port: %s', server.address().port);
});
