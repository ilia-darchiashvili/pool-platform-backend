const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const nextEventSchema = new Schema({
    name: { type: String, required: true },
    dateTime: { type: Date, required: true }
});

module.exports = mongoose.model('NextEvent', nextEventSchema);
