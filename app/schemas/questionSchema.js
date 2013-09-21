var mongoose = require('mongoose');

var questionSchema = new mongoose.Schema({
    title: String,
    question: String,
    parameter: String,
    answer: String
});

module.exports = mongoose.model('questions', questionSchema);