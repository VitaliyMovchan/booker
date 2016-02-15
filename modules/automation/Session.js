'use strict';

var schema = require('./schema');
var buildQuestionTree = require('./buildQuestionTree');

function Session(userId) {
    this.userId = userId;
    this.createdAt = new Date;
    this.questions = [];

    this.base = buildQuestionTree(schema);
    this.question = this.base;

    this.getLastQuestion = function() {
        return this.question;
    }

    this.getNextQuestion = function() {
        this.question = this.question.getNext();
        return this.question;
    };

    this.toString = function(obj) {
        let question = obj || this.base;
        let text = question.text;

        switch (question.type) {
            case 'select':

                text += ' – ' + question.answer.text + '\n';
                if (question.answer && question.answer.next) {
                    text += this.toString(question.answer.next);
                }

                break;

            case 'plain':
            case 'location':
            case 'select-plain':

                text += ' – ' + question.answer + '\n';
                text += this.toString(question.next);

                break;

            case 'final':

                text += question.answer;

                break;
        }

        return text;
    };
}

module.exports = Session;
