var TelegramBot = require('node-telegram-bot-api');
var bot = null;

module.exports = {

    /**
     * Starts telegram bot listener
     * Redirects all incoming messages to handler callback
     * 
     * @param  {String}   token   Telegram bot token
     * @param  {Function} handler Callback handler function, called on new telegram messsage is received
     */
    start: function(token, handler) {

        // Create connection
        bot = new TelegramBot(token, {
            polling: true
        });

        console.log("[telegram] started server");

        // On message received
        bot.on('text', function(msg) {
            var self = this;
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
    }
};