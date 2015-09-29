var Datastore = require('nedb'),
    Ticket    = require('./Ticket');

// SF Connection cache
var conn = null;

// Database handler
var db = new Datastore({ 
    filename: "data/tickets", 
    autoload: true 
});

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
     * 
     * @param {Object}   contact  Contact object
     * @param {Function} callback Callback function
     */
    find: function(contact, callback) {
        var self = this;

        // Look through opened tickets
        db.find({ 
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
     * Save ticket to database
     * @param {Ticket} Ticket object to save
     */
    save: function(ticket) {
        var self = this;

        db.update({ _id: ticket.id }, { $set: {
            case_id: ticket.case_id,
            open: ticket.open,
            body: ticket.body
        }}, function(err) {
            if (err) console.log('[salesforce] error during saving ticket: ', ticket);
        });
    },
}

module.exports = tickets;