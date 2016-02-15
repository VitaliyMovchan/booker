'use strict';

var Question = require('./Question');
var Answer = require('./Answer');

function buildQuestionTree(element) {

    var questionObject = new Question(element.question, element.type);

    questionObject.oneTimeKeyboard = element.oneTimeKeyboard || true;

    switch (questionObject.type) {
        case 'select':

            for (let answer of element.answers) {
                var answerObject = new Answer(answer.text);
                answerObject.setNext(buildQuestionTree(answer.next));
                questionObject.addAnswer(answerObject);
            }

            break;

        case 'location':

            questionObject.setNext(buildQuestionTree(element.next));

            break;

        case 'select-plain':

            for (let answer of element.answers) {
                questionObject.addAnswer(answer);
            }

            questionObject.setNext(buildQuestionTree(element.next));

            break;

        case 'plain':

            questionObject.setNext(buildQuestionTree(element.next));

            break;

        case 'final':

            questionObject.setNext(null);

            break;
    }

    return questionObject;
}

module.exports = buildQuestionTree;
