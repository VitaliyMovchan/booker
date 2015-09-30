var jsforce   = require('jsforce'),
    async     = require('async'),

    contacts  = require('./contacts'),
    tickets   = require('./tickets');


var SF = {
    conn: null,
    _handler: null,
    telegram: null,

    /**
     * Creates connection with salesforce server
     * 
     * @param  {String} login            Salesforce account name
     * @param  {String} password         Salesforce account password
     * @param  {String} secure_token     Salesforce account secure token
     * @param  {Number} polling_interval Salesforce polling interval (time beetween selects)
     */
    start: function(login, password, secure_token, polling_interval) {
        var self = SF;

        // Preparing
        var login  = login || null;
        var secret = password + secure_token;

        // Create connection, and try to log in
        conn = new jsforce.Connection();
        conn.login(login, secret, function(err, res) {

            if (err) {
                return console.log('[salesforce] error during login:', err);
            }

            contacts.use(conn);
            tickets.use(conn);

            // Start ticker
            self._handler = setInterval(function() {
                self.onTick();
            }, polling_interval);

            // Run first tick
            self.onTick();

            console.log("[salesforce] started server");
        });
    },

    /**
     * Use telegram handler to send messages later
     * @param {Object} tgHandle Telegram handler
     */
    use: function(tgHandle) {
        SF.telegram = tgHandle;
    },

    /**
     * Handles incoming messages from telegram
     * @param {Error}  err     Possible error
     * @param {Object} message Wrapped incoming message + send handler
     */
    onMessage: function(err, message) {
        var self = SF;

        async.waterfall([
            function(callback) {
                contacts.find(message, callback);
            },
            function(contact, callback) {
                tickets.findOrCreate(contact, callback);
            },
            function(ticket, callback) {
                ticket.add(message, callback);
            }
        ], function (err, result, ticket) {
            if (err || result === 'failed') {
                if (err.errorCode === "ENTITY_IS_DELETED") {
                    tickets.findOrCreate(contact, function(ticket) {
                        ticket.open = false;
                        tickets.save(ticket, function() {
                            tickets.findOrCreate(contact, function(ticket) {
                                ticket.add(message, function() {});
                            });
                        });
                    });
                } else {
                    console.log('[salesforce] message handling error:', err);
                }
            }

            if (result === 'success') {
                tickets.save(ticket);
                console.log('[salesforce] message succesfuly handled');
            }
        });
    },

    /**
     * Every "polling_iterval" seconds selects actual data
     */
    onTick: function() {
        var self = this;

        // Pring api info (usage)
        if (conn.limitInfo.apiUsage && conn.limitInfo.apiUsage.limit) {
            console.log("[salesforce] API calls used/available: ", 
                conn.limitInfo.apiUsage.used + "/" + conn.limitInfo.apiUsage.limit
            );
        }

        async.waterfall([
            function(callback) {
                // Find all opened tickets
                tickets.findAll({ open: true }, callback);
            },
            function(ticketArray, callback) {
                // Request updates from SF server
                tickets.requestUpdates(ticketArray, callback);
            },
            function(updates, callback) {
                // Apply updates to local db
                tickets.applyUpdates(updates, callback);
            },
            function(messages, callback) {
                if (messages.length > 0 ) { console.log(messages); }
                // Iterate over each message
                async.eachSeries(messages, function(message, callback) {
                    // Send message with update
                    self.telegram.send(message);

                    // Prevent from stack overflow
                    async.setImmediate(function () {
                        callback();
                    });
                }, function(err) {
                    // Finish and return
                    callback(null, 'success');
                });
            }
        ], function(err, result) {
            if (err || result === 'failed') {
                console.log('[salesforce] update handling error:', err);
            }
        });

    },
};

module.exports = {
    start: SF.start,
    use: SF.use,
    onMessage: SF.onMessage
};