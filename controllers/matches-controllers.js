const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const Match = require('../models/match');
const Player = require('../models/player');

const getAllMatches = async (req, res, next) => {
  let matches;
  try {
    matches = await Match.find({});
  } catch (err) {
    const error = new HttpError(
      'Fetching matches failed, please try again later.',
      500
    );
    return next(error);
  }

  res.json({ matches: matches.sort((a, b) => new Date(b.date) - new Date(a.date)).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(match => match.toObject({ getters: true })) });
}

const getMatches = async (req, res, next) => {
  const player1Id = req.params.player1Id;
  const player2Id = req.params.player2Id;

  let matches;
  if (player1Id && player2Id) {
    try {
      matches = await Match.find({$or: [{$and: [{player1Id: player1Id}, {player2Id: player2Id}]}, {$and: [{player1Id: player2Id}, {player2Id: player1Id}]}]});
    } catch (err) {
      const error = new HttpError(
        'Fetching matches failed, please try again later.',
        500
      );
      return next(error);
    }
  }

  res.json({ matches: matches.sort((a, b) => new Date(b.date) - new Date(a.date)).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(match => match.toObject({ getters: true })) });
};

const createMatch = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const {
    tournamentName,
    player1Id,
    player2Id,
    player1,
    player2,
    date,
    stage,
    player1Racks,
    player2Racks,
    player1Place,
    player2Place,
    player1RankingPoints,
    player2RankingPoints,
    isRankingEvent,
    player1Walkover,
    player2Walkover,
    isPlayer1Female,
    isPlayer2Female,
    created_at
  } = req.body;

  const createdMatch = new Match({
    tournamentName,
    player1Id,
    player2Id,
    player1,
    player2,
    date,
    stage,
    player1Racks,
    player2Racks,
    player1Place,
    player2Place,
    player1RankingPoints,
    player2RankingPoints,
    isRankingEvent,
    player1Walkover,
    player2Walkover,
    isPlayer1Female,
    isPlayer2Female,
    created_at
  });

  let playerOne, playerTwo;
  try {
    playerOne = await Player.findById(player1Id);
    playerTwo = await Player.findById(player2Id);
  } catch (err) {
    const error = new HttpError(
      'Update player stats failed, please try again.',
      500
    );
    return next(error);
  }

  if (!playerOne || !playerTwo) {
    const error = new HttpError('Could not find player.', 404);
    return next(error);
  }
  
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();

    playerOne.totalMatches++;
    playerTwo.totalMatches++;

    if (player1Racks > player2Racks || player1Walkover) {
      playerOne.matchesWon++;
    } else {
      playerTwo.matchesWon++;
    }

    if (player1Racks && player2Racks) {
      playerOne.totalRacks += player1Racks + player2Racks;
      playerTwo.totalRacks += player1Racks + player2Racks;
      playerOne.racksWon += player1Racks;
      playerTwo.racksWon += player2Racks;
    }

    if (player1RankingPoints) {
      playerOne.rankingPoints = playerOne.rankingPoints ? (playerOne.rankingPoints + player1RankingPoints) : player1RankingPoints;
    }

    if (player2RankingPoints) {
      playerTwo.rankingPoints = playerTwo.rankingPoints ? (playerTwo.rankingPoints + player2RankingPoints) : player2RankingPoints;
    }

    if (player1Place && (player1Place < playerOne.highestPlace || !playerOne.highestPlace)) {
      playerOne.highestPlace = player1Place;
    }

    if (player2Place && (player2Place < playerTwo.highestPlace || !playerTwo.highestPlace)) {
      playerTwo.highestPlace = player2Place;
    }

    await createdMatch.save();
    await playerOne.save({ session: sess });
    await playerTwo.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not save match.',
      500
    );
    return next(error);
  }

  res.status(201).json({ match: createdMatch });
};

exports.getAllMatches = getAllMatches;
exports.getMatches = getMatches;
exports.createMatch = createMatch;