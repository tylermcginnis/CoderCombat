var mongoose = require('mongoose');

var questionSchema = new mongoose.Schema({
    answer: String,
    parameter: String,
    question: String,
    title: String
});

module.exports = mongoose.model('questions', questionSchema);