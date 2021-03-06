'use strict';

var sessionManager = require('./sessionManager');

function automation(msg, callback) {

    if (msg.text === '/restart') {
        sessionManager.removeSession(msg.id);
    }

    sessionManager.getSession(msg.id, function(session) {

        // If session has been finished – just proxy incoming message straight to SF 
        if (session.isFinished()) {
            return callback(null, msg.text);
        }

        // Check if text provided by user is valid answer for the last question
        if (session.getLastQuestion().validate(msg.text) && !session.justOpened()) {

            // If answer is valid, save text to the Question object
            session.getLastQuestion().saveAnswer(msg.text);
            // Create next question and send it to the user

            msg.sendCustom(
                session.getNextQuestion().getMessage()
            );

            // getNextQuestion rewrites last question to next
            // so call to getLastQuestion in this case is equal to getNextQuestion
            if (session.getLastQuestion().isFinal()) {
                // handle ending of the session
                //:TODO send data to operators send ->
                callback(null, session.getMessage());
                
                /* old session removing code
                // and delete session
                sessionmanager.removesession(msg.id);
                automation(msg, callback);
                */

                // set state state to 'finished'
                // all new messages will be transfered directly to SF
                session.setFinished(true);
            }
        } else {
            // first-time run check
            session.setJustOpened(false);
            session.addTempdata(msg.text);

            // If answer is invalid, send the last question again
            msg.sendCustom(
                session.getLastQuestion().getMessage()
            );
        }

    });

}

module.exports = automation;
