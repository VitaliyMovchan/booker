// Load .env file
require('dotenv').load();

var telegram    = require('./modules/telegram'),
    salesforce  = require('./modules/salesforce');


// Start salesforce server
salesforce.start(
    process.env.SF_LOGIN,
    process.env.SF_PASSWORD,
    process.env.SF_SECURTY_TOKEN,
    process.env.SF_POLLING_INTERVAL
);


// Start telegram server
var tg_token = process.env.TELEGRAM_TOKEN;

telegram.start(tg_token, function(err, obj) {
    if (err) {
        return console.log("[telegram] error:", err);
    }

    salesforce.onMessage(obj);
});






// var TelegramBot = require('node-telegram-bot-api');
// var jsforce = require('jsforce');


// // TELEGRAMM PART
// var token = '117553939:AAEfoVs549_WC_j6qOMVdodZu51eAzMlXM0';

// // Setup polling way
// var bot = new TelegramBot(token, {
//     polling: true
// });

// bot.on('text', function(msg) {
//     console.log(msg);
//     var chatId = msg.chat.id;
//     // photo can be: a file path, a stream or a Telegram file_id
//     //var photo = 'cats.png';
//     //bot.sendPhoto(chatId, photo, {caption: 'Lovely kittens'});

//     bot.sendMessage(chatId, "Your message was saved");
// });




// // SALESFORCE PART
// var conn = new jsforce.Connection();
// var password = '3kw8ev.oWc6mfNDYsG7HXuFq';
// var sec_token = 'jeH0F2Nsu6ruyccnw5xFZ7fYm';


// // Login
// conn.login('vladgritsenko+test1@gmail.com', password + sec_token, function(err, res) {
//     if (err) {
//         return console.error(err);
//     }

//     console.log("logined");

//     // conn.query('SELECT Id, Name FROM Account', function(err, res) {
//     //     if (err) {
//     //         return console.error(err);
//     //     }
//     //     console.log(res);
//     // });

//     // Get 3 contacts
//     conn.query('SELECT Id, Name From Contact Limit 3', function(err, res) {
//         console.log(err);
//         console.log(res);
//     });

//     // Create contact
//     conn.sobject("Contact").create({
//         FirstName: 'nam2',
//         LastName: 'lst2',
//         MobilePhone: 123124124
//     }, function(err, ret) {
//         if (err || !ret.success) {
//             return console.error(err, ret);
//         }
//         console.log("Created record id : " + ret.id, ret);


//         // Create Case object
//         conn.sobject("Case").create({
//             ContactId: ret.id,
//             Description: 'asdasdasd ad asd asd sad as dasdasdasd as das dsd',

//         }, function(err, ret) {
//             if (err || !ret.success) {
//                 return console.error(err, ret);
//             }
//             console.log("Created record id : " + ret.id, ret);
//             // ...
//         });
//     });
// });