/**
 * Ticket object construcor
 * @constructor
 * @param {Object} conn Connection to SF
 * @param {Object} data Data record in database
 */
function Ticket(conn, data) {
    this.id      = null;
    this.isFresh = false;
    this.open    = true;
    this.contact = null;
    this.case_id = null;
    this.conn    = conn;
    this.body    = "";

    if (data) {
        this.id = data._id;
        this.contact = data.contact;
        this.case_id = data.case_id;
        this.body    = data.body;
    }
};

/**
 * Adds new case into SF
 * If opened case already exists: tries to write inside opened one
 * 
 * @param {Object}   message  Wrapped message object
 * @param {Function} callback Callback function
 */
Ticket.prototype.add = function(message, callback) {
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
            Subject: self.title,
            Description: self.body,
        }, function(err, ret) {
            if (err || !ret.success) {
                callback(err, 'failed');
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
            if (err || !ret.success) {
                callback(err, 'failed');
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
    var date = new Date(message.date * 1000);
    var prebuilt = [
        this.body,
        "\r\n",
        "\r\n",
        "[UPDATE FROM ", date.toString(), "]",
        "\n\r",
        message.text
    ];

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