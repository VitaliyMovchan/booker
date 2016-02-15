'use strict';

var Answer = require('./Answer');

function Question(text, type) {
    this.validAnswers = [];
    this.answer = '';
    this.text = text;
    this.type = type;

    this.addAnswer = function(answerObject) {
        this.validAnswers.push(answerObject)
    };

    this.validate = function(userTextAnswer) {
        switch (this.type) {

            case 'select':
            case 'select-plain':
                for (let answer of this.validAnswers) {
                    if (
                        (answer instanceof Answer && answer.text == userTextAnswer) ||
                        (answer == userTextAnswer)
                    ) {
                        return true;
                    }
                }

                break;

            case 'location':

                //:TODO validation for location
                // return this.messager == 'telegram' ? validateLocation(this.text) : true;
                return true;
                break;

            case 'plain':
                return true;
                break;
        }

        return false;
    };

    this.getMessage = function() {
        let customMessage = [this.text, {}];

        let keyboard = [];

        if (this.type === 'select') {
            for (let answer of this.validAnswers) {
                keyboard.push([answer.text]);
            }
        } else if (this.type == 'select-plain') {
            for (let answer of this.validAnswers) {
                keyboard.push([answer]);
            }
        }

        customMessage[1] = {
            reply_markup: JSON.stringify({ keyboard: keyboard, one_time_keyboard: true })
        };

        return customMessage;
    };

    this.saveAnswer = function(userTextAnswer) {
        if (this.type == 'select') {
            for (let answer of this.validAnswers) {
                if (answer instanceof Answer && answer.text == userTextAnswer) {
                    this.answer = answer;
                }
            }
        } else {
            this.answer = userTextAnswer;
        }
    };

    this.setNext = function(next) {
        this.next = next;
    };

    this.getNext = function() {
        if (this.type === 'select') {
            return this.answer.next;
        } else {
            return this.next;
        }
    }

    this.isFinal = function() {
        return this.type == 'final';
    }
};

module.exports = Question;
