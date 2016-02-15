'use strict';

var activeSessions = {};
var Session = require('./Session');

function getSession(userId, callback) {
    if (!activeSessions.hasOwnProperty(userId)) {
        activeSessions[userId] = new Session(userId);
    }

    return callback(activeSessions[userId]);
}

function removeSession(userId) {
    delete activeSessions[userId];
}

module.exports = {
    getSession: getSession,
    removeSession: removeSession
        // , getActiveSessions: getActiveSessions
};



// // Remove session after 10 mins pass
// function getActiveSessions(userId, callback) {
//     return activeSessions;
// }
// let minute = 60;
// setInterval(function(){
//     for (let session of sessionManager.getActiveSessions()) {
//         if (new Date - session.createdAt > 10 * minute) {
//             callback(null, session.toString());
//             sessionManager.removeSession(session.userId);
//         }
//     }
// }, minute);
