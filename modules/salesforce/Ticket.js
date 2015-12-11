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
 */
Ticket.prototype.add = function(message, callback, tickets) {
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

        // Update description, status
        this.conn.sobject("Case").update({
            Id: self.case_id,
            Description: self.body,
            Status: "escalated"
        }, function(err, ret) {

            // If ticket was deleted, but we dont't know about it
            if (err && err.errorCode === "ENTITY_IS_DELETED") {

                // Close ticket and save
                self.open = false;
                tickets.save( self );

                // Recursive call find or create and add message
                tickets.findOrCreate(self.contact, function(err, newTicket) {
                    newTicket.add( message, callback );
                });

                return;
            }

            if (err || !ret.success) {
                return callback(err, 'failed');
            }

            // Return 
            callback(null, 'success', self);
        }); 

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