var mongoose = require('mongoose');

var questionSchema = new mongoose.Schema({
    question: String,
    answer: String,
    title: String
});

module.exports = mongoose.model('questions', questionSchema);