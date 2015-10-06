var TelegramBot = require('node-telegram-bot-api');
var bot = null;

var http = require('http');
var https = require('https');
var request = require('request');
var fileType = require('file-type');

var urlRegex = require('url-regex');

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
                '[telegram] incoming photo @' + msg.chat.username + ':', url
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

        bot.on('video', function(msg) {
            var chatId = msg.chat.id;
            var url = process.env.EXTERNAL_HOST + "/video/" + msg.video.file_id;

            console.log(
                '[telegram] incoming video @' + msg.chat.username + ':', url
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

        bot.on('contact', function(msg) {
            var chatId = msg.chat.id;
            var finalMessage = '';

            if (msg.contact.phone_number !== undefined) {
                finalMessage += msg.contact.phone_number;
            }

            if (msg.contact.first_name !== undefined) {
                finalMessage = finalMessage + ' ' + msg.contact.first_name;
            }

            if (msg.contact.last_name !== undefined) {
                finalMessage = finalMessage + ' ' + msg.contact.last_name;
            }

            console.log(
                '[telegram] incoming contact @' + msg.chat.username + ':', finalMessage
            );

            // Trigger callback
            handler(null, {
                chat: bot,
                id: msg.chat.id,
                text: finalMessage,
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

        bot.on('location', function(msg) {
            var chatId = msg.chat.id;
            var url = process.env.EXTERNAL_HOST + '/location/' + msg.location.latitude + '/' + msg.location.longitude;

            console.log(
                '[telegram] incoming location @' + msg.chat.username + ':', url
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

        bot.on('document', function(msg) {
            var chatId = msg.chat.id;
            var url = process.env.EXTERNAL_HOST + '/document/' + msg.document.file_id;

            console.log(
                '[telegram] incoming document @' + msg.chat.username + ':', url
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

        bot.on('voice', function(msg) {
            var chatId = msg.chat.id;
            var url = process.env.EXTERNAL_HOST + '/voice/' + msg.voice.file_id;

            console.log(
                '[telegram] incoming voice @' + msg.chat.username + ':', url
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

        bot.on('sticker', function(msg) {
            var chatId = msg.chat.id;
            var url = process.env.EXTERNAL_HOST + '/sticker/' + msg.sticker.file_id;

            console.log(
                '[telegram] incoming sticker @' + msg.chat.username + ':', url
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

        var getMessageType = function(typeObject) {
            if (typeObject.ext == 'mp3' && typeObject.mime.indexOf("audio") > -1) {
                return 'audio';
            } else if (typeObject.mime.indexOf("image") > -1) {
                return 'photo';
            }
            // else if (typeObject.ext == 'mp4' && typeObject.mime.indexOf("video") > -1) {
            //     return 'video';
            // } else if (typeObject.ext == 'ogg' && typeObject.mime.indexOf("audio") > -1) {
            //     return 'voice';
            // }
        };

        var getFileTypeFromURL = function(url, callback) {

            var handleData = function(response) {
                response.once('data', function(chunk) {
                    response.destroy();
                    callback(null, fileType(chunk));
                });
            }

            if (url.indexOf("http://") > -1) {
                http.get(url, function(response) {
                    handleData(response);
                });
            } else if (url.indexOf("https://") > -1) {
                https.get(url, function(response) {
                    handleData(response);
                });
            }

        };

        var isFileUrl = function(text) {
            return urlRegex({
                exact: true
            }).test(text);
        };

        var sendMessageByType = function(currentMessegeType) {
            switch (currentMessegeType) {
                case 'photo':
                    bot.sendPhoto(message.chatId, request(url));
                    break;
                case 'audio':
                    bot.sendAudio(message.chatId, request(url));
                    break;
                // case 'video':
                //     bot.sendVideo(message.chatId, request(url));
                //     break;
                // case 'voice':
                //     bot.sendVoice(message.chatId, request(url));
                //     break;
                default:
                    bot.sendMessage(message.chatId, message.text);
                    break;
            }
        };

        if (isFileUrl(message.text)) {
            var url = message.text;

            getFileTypeFromURL(url, function(err, currentFileType) {
                if (currentFileType !== null) {
                    var currentMessegeType = getMessageType(currentFileType);

                    sendMessageByType(currentMessegeType)
                } else {
                    bot.sendMessage(message.chatId, message.text);
                }
            });
        } else {
            bot.sendMessage(message.chatId, message.text);
        }

    }
};
