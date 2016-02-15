module.exports = {
    question: 'How can we help you?',
    oneTimeKeyboard: false,
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
                        answers: ['Caribbean', 'Chinese', 'Ukrainian', 'French', 'German', 'Greek', 'Indian', 'International', 'Italian'],
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
                        answers: ['Caribbean', 'Chinese', 'Ukrainian', 'French', 'German', 'Greek', 'Indian', 'International', 'Italian'],
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
