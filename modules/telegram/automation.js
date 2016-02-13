// Session.js
function Session(userId) {
    this.userId = userId;
    this.createdAt = new Date;
    this.questions = [];

    this.getLastQuestion = function() {
        return this.questions[this.questions.lenght - 1];
    }
}

var activeSessions = {};

function getSession(userId, callback) {
    if (!activeSessions.hasOwnProperty(userId)) {
        activeSessions[userId] = new Session(userId);
    }

    return callback(activeSessions[userId]);
}


// var foo = new Question('Where wold you like to eat?');
// foo.validAnswers[0] = new Answer('Nearby');
// foo.validAnswers[0].question = new QuestionLocation('Share your location, please.');
// foo.validAnswers[0].question.nextQuestion = new Question('Share your location, please.');



// foo.validAnswers[1] = new Answer('Choose specific location');
// foo.validAnswers[1].question = new QuestionLocation('Please, provide us preferable location or area.');


function Question() {
    this.validAnswers = ['Nearby', 'Choose specific location', 'Choose specific place'];
    this.answer = 'Nearby';
    this.text = 'Where wold you like to eat?'

    this.validate = function(userTextAnswer) {
        // find `userTextAnswer` in `answers` array
        // return BOOL
    };

    this.saveAnswer = function(userTextAnswer) {
        this.answer = userTextAnswer;
    };
}

function auto(msg, callback) {

    getSession(msg.id, function(session) {

    	// Check if text provided by user is valid answer for the last question
        if (session.getLastQuestion().validate(text)) {
        	// If answer is valid, save text to the Question object
            session.getLastQuestion().saveAnswer(msg.text);
            // Create next question and send it to the user
            messenger.send(session.createNextQuestion().text, session.userId);
        } else {
        	// If answer is invalid, send the last question again
            messenger.send(session.getLastQuestion().text, session.userId);
        }

    });

}

module.exports = auto;


var foo = {
    question: 'How can we help you?',
    type: 'select',
    answers: [{
        text: 'Book a restaurant',
        next: {
            question: 'Where wold you like to eat?',
            type: 'select',
            answers: [{
                text: 'Nearby',
                next: {
                    question: 'Share your location, please.',
                    type: 'location',
                    next: {
                        question: 'What kind of cuisine do you prefer?',
                        type: 'select-plain',
                        answers: ['Caribian', 'Ukrainian'],
                        next: {
                            type: 'plain',
                            question: 'What is your ideal time and date?',
                            next: {
                                type: 'final',
                                question: 'One of our operators will get in touch with you shortly to confirm booking.'
                            }
                        }
                    }
                }
            }, {
                text: 'Provide preferable area',
                next: {
                    question: 'Please, provide us preferable location or area.',
                    type: 'location',
                    next: {
                        question: 'What kind of cuisine do you prefer?',
                        type: 'select-plain',
                        answers: ['Caribian', 'Ukrainian'],
                        next: {
                            type: 'plain',
                            question: 'What is your ideal time and date?',
                            next: {
                                type: 'final',
                                question: 'One of our operators will get in touch with you shortly to confirm booking.'
                            }
                        }
                    }
                }
            }, {
                text: 'Provide specific place',
                next: {
                    type: 'plain',
                    question: 'Please tell us name and location of your the place.',
                    next: {
                        type: 'final',
                        question: 'Thank you for your booking request. One of our ninjas will get in touch with you shortly to confirm booking.'
                    }
                }
            }]
        }
    }]
};
