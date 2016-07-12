var Datastore = require('nedb'),
    async     = require('async'),
    Ticket    = require('./Ticket');

var sessionManager = require('../automation/sessionManager');

// SF Connection cache
var conn = null;

// Ticket database handler
var db = new Datastore({ 
    filename: "data/tickets" + process.env.TELEGRAM_TOKEN.split(':')[0],
    autoload: true 
});

// Auto-compress database every hour (miliseconds)
db.persistence.setAutocompactionInterval( 
    process.env.DB_CLEANUP_INTERVAL || 3600000 
);

var tickets = {

    /**
     * Use connection for external SF requests
     * @param {Object} conn SF connection
     */
    use: function(connection) {
        conn = connection;
    },

    /**
     * Tries to find existing ticket, or creates new one
     * Based on contact object
     * 
     * @param {Object}   contact  Contact object
     * @param {Function} callback Callback function
     */
    findOrCreate: function(contact, callback) {
        var self = this;

        // Look through opened tickets
        db.find({
            "contact.Id": contact.Id,
            "contact.telegram_id__c": contact.telegram_id__c,
            open: true
        }, function(err, tickets) {
            if (err) { return callback(err); }

            // Check for open ticket
            if (tickets.length < 1) {
                
                // Create ticket record
                db.insert({
                    contact: contact,
                    open: true,
                    body: "",
                    origin: "Telegram",
                    comments: [],
                    case_id: null
                }, function(err, data) {
                    if (err) { return callback(err); }

                    // Create object, put data
                    var ticket = new Ticket(conn, data);
                    ticket.isFresh = true;

                    // Send to callback
                    callback( null, ticket );
                });

            } else {
                // Use one that is opened
                callback( null, new Ticket(conn, tickets[0]) );
            }
        });
    },

    /**
     * Find single ticket that corresponds to given query
     * @param {Object}   query    Search query
     * @param {Function} callback Callback function
     */
    find: function(query, callback) {
        var self = this;

        db.find(query, function(err, data) {
            if (err || data.length < 1) { return callback(err, 'failed'); }

            callback(null, new Ticket(conn, data[0]) );
        });  
    },

    /**
     * Find a muliple tickets that are corresponding to given query 
     * @param {Object}   query    Search query
     * @param {Function} callback Callback function
     */
    findAll: function(query, callback) {
        var self = this;

        db.find(query, function(err, data) {
            if (err) { return callback(err); }

            var tickets = [];

            for (var i = 0; i < data.length; i++) {
                tickets.push( new Ticket(conn, data[i]) );
            }

            callback(null, tickets);
        });
    },

    /**
     * Request ticket statuses and comments from SF server
     * @param {Array}    ticketArray Array of ticket objects
     * @param {Function} callback    Callback function
     */
    requestUpdates: function(ticketArray, callback) {
        var self = this;
        var ids  = [];

        // Iterate over array of Tickets
        for (var i = 0; i < ticketArray.length; i++) {
            var ticket = ticketArray[i];
            // Push to array
            ids.push(ticket.case_id);
        };

        // Create queries
        var concid = ids.join("','");
        var query1 = "SELECT Id, ParentId, CommentBody FROM CaseComment WHERE ParentId IN ('%1')".replace("%1", concid);
        var query2 = "SELECT Id, Status FROM Case WHERE Id IN ('%1')".replace("%1", concid);

        // Run them sequentially
        // And return after they both have ended
        async.series({
            comments: function(callback) {
                conn.query(query1, callback);
            },
            statuses: function(callback) {
                conn.query(query2, callback);
            }
        }, callback);
    },

    /**
     * Apply requested updates to local db, and create messages
     * @param {Array}    updates  Array of updates
     * @param {Function} callback Callback function
     */
    applyUpdates: function(updates, callback) {
        var self = this;

        // Create messages array
        var messages = [];

        // Iterate over comments
        async.eachSeries(updates.comments.records, function(comment, callback) {
            // Find token corresponding to comment
            self.find({ case_id: comment.ParentId }, function(err, ticket) {            
                if (err) { return callback(err); }

                // Default value
                if (!ticket.comments) {
                    ticket.comments = [];
                }

                // If comment is new
                if (ticket.comments.indexOf(comment.Id) === -1) {
                    // Add to "sent"
                    ticket.comments.push(comment.Id);
                    // Save it
                    self.save(ticket);

                    // Create message
                    messages.push({
                        chatId: ticket.contact.telegram_id__c,
                        text: comment.CommentBody
                    });
                }

                // Prevent from stack overflow
                async.setImmediate(function() {
                    callback();
                });
            });
        }, function(err) {
            // Return to main callee
            callback(null, messages);
        });

        // if status changed to closed - update ticket, save, (optional form message for TG)
        async.eachSeries(updates.statuses.records, function(exticket, callback) {
            // Find token corresponding to comment
            self.find({ case_id: exticket.Id }, function(err, ticket) {
                if (err) { return callback(err); }

                // If case is closed - update ticket
                if (exticket.Status === "Closed") {
                    ticket.open = false;
                    self.save(ticket);

                    // delete opened user session after ticket is closed
                    sessionManager.removeSession( ticket.contact.telegram_id__c );
                }

                // Prevent from stack overflow
                async.setImmediate(function() {
                    callback();
                });
            });      
        });
    },

    /**
     * Save ticket to database
     * @param {Ticket} Ticket object to save
     */
    save: function(ticket, callback) {
        var self = this;

        db.update({ _id: ticket.id }, { $set: {
            case_id: ticket.case_id,
            open: ticket.open,
            comments: ticket.comments,
            body: ticket.body
        }}, function(err) {
            if (err) return console.log('[salesforce] error during saving ticket: ', ticket);
            if (callback) callback();
        });
    },
}

module.exports = tickets;
