var TelegramBot = require('node-telegram-bot-api');
var bot = null;

module.exports = {

    /**
     * Starts telegram bot listener
     * @param {String} token Telegram bot token
     */
    start: function(token, callback) {

        // Create connection
        bot = new TelegramBot(token, {
            polling: true
        });

        console.log("[telegram] started server");
        callback();
    },

    /**
     * Redirects all incoming messages to handler callback
     * @param {Function} handler Callback handler function, called on new telegram messsage is received
     */
    onMessage: function(handler) {
        var self = this;

        // On message received
        bot.on('text', function(msg) {
            var chatId = msg.chat.id;

            console.log(
                '[telegram] incoming message @' + msg.chat.username + ':', msg.text
            );            

            // Trigger callback
            handler(null, {
                chat: bot,
                id: msg.chat.id,
                text: msg.text,
                date: msg.date,
                user: {
                    first_name: msg.chat.first_name,
                    last_name: msg.chat.last_name,
                    username: msg.chat.username
                },
                send: function(text) {
                    return bot.sendMessage(chatId, text);
                }
            });
        });

        // On image received
        // http://tg.api.booker.im/photo/AgADAgADq6cxG7XjyQbwS6ZL-963C8WLhCoABFeFv-DVNVM16SoAAgI -> (EXPRESS: /photo/:id -> API_URL/id -> imageurl) -> imageurl
        bot.on('photo', function(msg) {
            var chatId = msg.chat.id;

            var biggest_photo = msg.photo[msg.photo.length - 1];
            var url = process.env.EXTERNAL_HOST + "/photo/" + biggest_photo.file_id;

            console.log(
                '[telegram] incoming photo @' + msg.chat.username + ':'
            );      

            // Trigger callback
            handler(null, {
                chat: bot,
                id: msg.chat.id,
                text: url,
                date: msg.date,
                user: {
                    first_name: msg.chat.first_name,
                    last_name: msg.chat.last_name,
                    username: msg.chat.username
                },
                send: function(text) {
                    return bot.sendMessage(chatId, text);
                }
            });
        });

    },

    send: function(message) {
        bot.sendMessage(message.chatId, message.text);
    }
};