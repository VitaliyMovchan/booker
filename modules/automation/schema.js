module.exports = {
    question: 'How can we help you?',
    oneTimeKeyboard: false,
    type: 'select',
    answers: [{
        text: 'Book a restaurant 🍴',
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
    }, {
        text: 'Book a hotel 🏡',
        next: {
            type: 'location',
            question: 'I’ll try to get the best quality/ price option for you! I search through Expedia, Booking, etc. We’ll do our best to get you good price!\n\nCan you please confirm your current location through sharing? name, share your location, please.',
            next: {
                type: 'plain',
                question: 'What’s your desired hotel name, and/ or city or star-rating ?',
                next: {
                    type: 'plain',
                    question: 'What’s travel budget per night?',
                    next: {
                        type: 'plain',
                        question: 'Noted! What are your travel dates, or/ and how many nights you would like to stay?',
                        next: {
                            type: 'plain',
                            question: 'Any special requirements (earlier check-in/ check-out, special menu etc.)?',
                            next: {
                                type: 'final',
                                question: 'Cool! Our Booker Ninja will get in touch with you shortly with options and confirmation! 😉'
                            }
                        }
                    }
                }
            }
        }
    }, {
        text: 'Get a taxi 🚖',
        next: {
            type: 'location',
            question: 'We’ll try to get the best quality/ price option for you! Share your location, please.',
            next: {
                type: 'plain',
                question: 'Where would you like to go?',
                next: {
                    type: 'select-plain',
                    question: 'Any car class preference?',
                    answers: ['Whatever is faster', 'Cheapest', 'Min. Comfort', 'Lux', 'Special'],
                    next: {
                        type: 'select-plain',
                        question: 'Nice! When would you like to leave?',
                        answers: ['Now', 'Provide specific time'],
                        next: {
                            type: 'plain',
                            question: 'What is your ideal time and date?',
                            next: {
                                type: 'final',
                                question: 'Cool! Our Booker Ninja will get in touch with you shortly with options and confirmation! 😉'
                            }
                        }
                    }
                }
            }
        }
    }, {
        text: 'Order a gift 🎁',
        next: {
            type: 'plain',
            question: 'Do you have anything in mind or you need some gift ideas?',
            next: {
                type: 'final',
                question: 'Cool! Our Booker Ninja will get in touch with you shortly with options! 😉'
            }
        }
    }]
};
