// TODO: for scaling purposes in-memory cache should be
// in external process (any key-value store e.g. memcached)
var sf_cache = {};
var conn = null;

module.exports = {

    /**
     * Use connection for external SF requests
     * @param {Object} conn SF connection
     */
    use: function(connection) {
        conn = connection;
    },

    /**
     * Tries to find contact in cache, salesforce
     * Recursive, if object is not found, it will call create one, and pass itself as callback
     *
     * @param {Object}   message  Wrapped message object
     * @param {Function} callback Callback function
     */
    findOrCreate: function(message, callback) {
        var self = this;

        // Try to load from in-memory cache
        if (message.id in sf_cache) {
            return callback(null, sf_cache[message.id])
        }

        // Else - external request
        // Find by telegram id, select fields: id, fname, lname, telegram_id
        conn.sobject("Contact")
            .find({
                telegram_id__c: message.id.toString()
            }, {
                Id: true,
                FirstName: true,
                LastName: true,
                telegram_id__c: true
            })
            .execute(function(err, records) {
                if (err) {
                    message.send("We are sorry. There is an error occured. Please, try again later! :)");
                    return console.log("[salesforce] error getting contacts: ", err);
                }

                // Check for contacts that already in system
                if (records.length < 1) {

                    // Create contact, and call recursive search
                    self.create(message, function(err) {
                        self.findOrCreate(message, callback);
                    });

                } else {

                    // Save into in-memory cache
                    sf_cache[message.id] = records[0];

                    // Contact exists, use one
                    callback(null, records[0]);
                }
            });
    },

    /**
     * Creates contact object in SalesForce
     * 
     * @param {Object}   message  Wrapped message object
     * @param {Function} callback Callback function
     */
    create: function(message, callback) {
        var self = this;

        // No contact exists - so create one
        conn.sobject("Contact").create({
            FirstName: message.user.first_name,
            LastName: message.user.last_name,
            telegram_id__c: message.id.toString(),
            telegram_username__c: message.user.username
        }, function(err, ret) {

            if (err) {
                message.send("We are sorry. There is an error occured. Please, try again later! :)");
                return console.log("[salesforce] error creating contact: ", err);
            }

            // Success
            callback(null);
        });
    },

};