const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const playerSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  totalMatches: { type: Number, required: false },
  matchesWon: { type: Number, required: false },
  totalRacks: { type: Number, required: false },
  racksWon: { type: Number, required: false },
  highestPlace: { type: Number, required: false },
  rankingPoints: { type: Number, required: false },
  isFemale: { type: Boolean, required: true },
});

module.exports = mongoose.model('Player', playerSchema);
