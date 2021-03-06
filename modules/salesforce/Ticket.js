var sessionManager = require('../automation/sessionManager');
var automation = require('../automation/index');

/**
 * Ticket object construcor
 * @constructor
 * @param {Object} conn Connection to SF
 * @param {Object} data Data record in database
 */
function Ticket(conn, data) {
    this.id       = null;
    this.isFresh  = false;
    this.open     = true;
    this.contact  = null;
    this.case_id  = null;
    this.conn     = conn;
    this.body     = "";
    this.comments = [];
    this.origin   = "";

    if (data) {
        this.id       = data._id;
        this.contact  = data.contact;
        this.case_id  = data.case_id;
        this.body     = data.body;
        this.comments = data.comments;
        this.origin   = data.origin;
    }
};

/**
 * Adds new case into SF
 * If opened case already exists: tries to write inside opened one
 * 
 * @param {Object}   message  Wrapped message object
 * @param {Function} callback Callback function
 * @param {Object}   tickets  Tickets object controller reference
 * @param {Object}   contacts Contacts object controller reference
 */
Ticket.prototype.add = function(message, callback, tickets, contacts) {
    var self = this;

    // Set default body text
    if (!self.body || self.body.length < 1) {
        self.body = message.text;
    }

    // If it's fresh token, we'll try to create case
    // Else we'll try to add info to existing one
    if (this.isFresh) {
        this.isFresh = false;

        // Create title
        var title = this.body.substring(0, 24);

        // Create case with description
        this.conn.sobject("Case").create({
            ContactId: self.contact.Id,
            Subject: title,
            Origin: self.origin,
            Description: self.body,
        }, function(err, ret) {

            // Check if contact has been deleted
            if (err && err.errorCode === "ENTITY_IS_DELETED") {

                contacts.refresh(message, function(err, contact) {

                    // Recursive call find or create and add message
                    tickets.findOrCreate(contact, function(err, newTicket) {
                        newTicket.add( message, callback, tickets, contacts );
                    });
                });

                return;
            }

            if (err || !ret.success) {
                return callback(err, 'failed');
            }

            // Save current case id to db
            self.setCaseId(ret.id);

            // Return 
            callback(null, 'success', self);
        });
    } else {

        // Add new text to old one
        self.updateBody( message );

        var errorHandle = function(err) {

            // If ticket was deleted, but we dont't know about it
            if (err && (err.errorCode === "ENTITY_IS_DELETED" || err.message === "Record id is not found in record.")) {

                // Close ticket and save
                self.open = false;
                tickets.save( self );

                // delete opened user session after ticket is DELETED
                // and resend message
                sessionManager.removeSession( self.contact.telegram_id__c );
                automation(message, function() {});

                // Recursive call find or create and add message
                // tickets.findOrCreate(self.contact, function(err, newTicket) {
                //     newTicket.add( message, callback, tickets, contacts );
                // });

                return;
            }

            if (err) {
                return callback(err, 'failed');
            }
        }

        try {
            // Update description, status
            this.conn.sobject("Case").update({
                Id: self.case_id,
                Description: self.body
            }, function(err, ret) {
                if (err) {
                    errorHandle(err);
                } else {
                    callback(null, 'success', self);
                }
            });

        } catch (err) {
            errorHandle(err);
        }

    }
};

/**
 * Update body for ticket
 * @private
 * @param {Object} message Wrapped message object
 */
Ticket.prototype.updateBody = function(message) {

    // Convert message date from timestamp
    var date = new Date(message.date * 1000);
    
    // Create structure for update
    var prebuilt = [
        this.body,
        "\r\n",
        "\r\n",
        "[UPDATE FROM ", date.toString(), "]",
        "\r\n",
        message.text
    ];

    // Concatenate predefined data
    this.body = prebuilt.join('');
};

/**
 * Set case id
 * @param {String} id Case ID in SF
 */
Ticket.prototype.setCaseId = function(id) {
    this.case_id = id;
};

module.exports = Ticket;
