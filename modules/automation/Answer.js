'use strict';

function Answer(text) {
    this.text = text;
    this.next = null;

    this.setNext = function(next) {
        this.next = next;
    }
}

module.exports = Answer;
