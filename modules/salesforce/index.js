var jsforce   = require('jsforce'),
    async     = require('async'),

    contacts  = require('./contacts'),
    tickets   = require('./tickets');


var SF = {
    conn: null,
    _handler: null,

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
     * Handles incoming messages from telegram
     * @param  {Object} message Wrapped incoming message + send handler
     */
    onMessage: function(message) {
        var self = SF;

        //message.send("You sent: " + message.text);

        async.waterfall([
            function(callback) {
                contacts.find(message, callback);
            },
            function(contact, callback) {
                tickets.find(contact, callback);
            },
            function(ticket, callback) {
                ticket.add(message, callback);
            }
        ], function (err, result, ticket) {
            if (err || result === 'failed') {
                console.log('[salesforce] message handling error:', err);
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
        // Pring api info (usage)
        if (conn.limitInfo.apiUsage && conn.limitInfo.apiUsage.limit) {
            console.log("[salesforce] API calls used/available: ", 
                conn.limitInfo.apiUsage.used + "/" + conn.limitInfo.apiUsage.limit
            );
        }

        // conn.query("SELECT Id, ContactId FROM Case WHERE Status LIKE 'New' ", function(err, res) {
            
        //     if (err) {
        //         return console.log("[salesforce] tick-request error:", err);
        //     }

        //     console.log(res);
        // });
    },
};

module.exports = {
    start: SF.start,
    onMessage: SF.onMessage
};