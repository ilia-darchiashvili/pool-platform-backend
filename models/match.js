const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const matchSchema = new Schema({
  tournamentName: { type: String, required: true },
  player1Id: { type: String, required: true },
  player2Id: { type: String, required: true },
  player1: { type: String, required: true },
  player2: { type: String, required: true },
  date: { type: Date, required: true },
  created_at: { type: Date, required: true },
  stage: { type: String, required: false },
  player1Racks: { type: Number, required: false },
  player2Racks: { type: Number, required: false },
  player1Place: { type: Number, required: false },
  player2Place: { type: Number, required: false },
  player1RankingPoints: { type: Number, required: false },
  player2RankingPoints: { type: Number, required: false },
  isRankingEvent: { type: Boolean, required: false },
  player1Walkover: { type: Boolean, required: false },
  player2Walkover: { type: Boolean, required: false },
  isPlayer1Female: { type: Boolean, required: false },
  isPlayer2Female: { type: Boolean, required: false }
});

module.exports = mongoose.model('Match', matchSchema);
