const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const Player = require('../models/player');
const Match = require('../models/match');

const getPlayers = async (req, res, next) => {
  let players;
  try {
    players = await Player.find({});
  } catch (err) {
    const error = new HttpError(
      'Fetching players failed, please try again later.',
      500
    );
    return next(error);
  }

  res.json({
    players: players.sort((a, b) => {
      if (a.lastName !== b.lastName) {
        return a.lastName.localeCompare(b.lastName)
      }

      return a.firstName.localeCompare(b.firstName)
    }).map(player => player.toObject({ getters: true }))
  });
};

const getPlayerById = async (req, res, next) => {
  const playerId = req.params.playerId;

  let player, playerMatches;
  try {
    player = await Player.findById(playerId);
    playerMatches = await Match.find({$or: [{player1Id: playerId}, {player2Id: playerId}]});
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find a player.',
      500
    );
    return next(error);
  }

  if (!player) {
    const error = new HttpError(
      'Could not find player for the provided id.',
      404
    );
    return next(error);
  }

  res.json({
    player: player.toObject({ getters: true }),
    matches: playerMatches.sort((a, b) => new Date(b.date) - new Date(a.date)).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(match => match.toObject({ getters: true }))
  });
};

const createPlayer = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const {
    firstName,
    lastName,
    totalMatches,
    matchesWon,
    totalRacks,
    racksWon,
    highestPlace,
    rankingPoints,
    isFemale
  } = req.body;

  try {
    const existingPlayer = await Player.find({$and: [{firstName: firstName}, {lastName: lastName}]});
    if (existingPlayer?.length) {
      throw new Error('Creating player failed - player with same first name and last name already exists!');
    }
  } catch (err) {
    return next(err);
  }

  const createdPlayer = new Player({
    firstName,
    lastName,
    totalMatches,
    matchesWon,
    totalRacks,
    racksWon,
    highestPlace,
    rankingPoints,
    // image: req.file?.path,
    isFemale
  });

  try {
    await createdPlayer.save();
  } catch (err) {
    const error = new HttpError(
      'Creating player failed, please try again.',
      500
    );
    return next(error);
  }

  res.status(201).json({ player: createdPlayer });
};

const deletePlayer = async (req, res, next) => {
  const playerId = req.params.playerId;

  let player;
  try {
    player = await Player.findById(playerId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find a player.',
      500
    );
    return next(error);
  }

  if (!player) {
    const error = new HttpError(
      'Could not find player for the provided id.',
      404
    );
    return next(error);
  }

  try {
    await player.remove();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete player.',
      500
    );
    return next(error);
  }

  res.status(200).json({ message: 'player deleted.' });
}

const updatePlayer = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const {
    firstName,
    lastName,
    totalMatches,
    matchesWon,
    totalRacks,
    racksWon,
    highestPlace,
    rankingPoints,
    isFemale
  } = req.body;

  const playerId = req.params.playerId;

  let player;
  try {
    player = await Player.findById(playerId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update player.',
      500
    );
    return next(error);
  }

  player.firstName = firstName;
  player.lastName = lastName;
  player.totalMatches = totalMatches;
  player.matchesWon = matchesWon;
  player.totalRacks = totalRacks;
  player.racksWon = racksWon;
  player.highestPlace = highestPlace;
  player.rankingPoints = rankingPoints;
  player.isFemale = isFemale;

  // if (req.file?.path) {
  //   player.image = req.file.path;
  // }

  let playerMatches;
  try {
    playerMatches = await Match.find({$or: [{player1Id: playerId}, {player2Id: playerId}]});
  } catch (err) {
    const error = new HttpError(
      'Retrieve player matches failed, please try again.',
      500
    );
    return next(error);
  }

  try {
    const updatedFullname = player.lastName + ' ' + player.firstName;
    playerMatches?.map(async match => {
      if (match.player1Id === playerId) {
        match.player1 = updatedFullname;
        match.isPlayer1Female = player.isFemale;
      }
      if (match.player2Id === playerId) {
        match.player2 = updatedFullname;
        match.isPlayer2Female = player.isFemale;
      }
      const sess = await mongoose.startSession();
      sess.startTransaction();
      await match.save({ session: sess });
      await sess.commitTransaction();
    });
    await player.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update player.',
      500
    );
    return next(error);
  }

  res.status(200).json({ player: player.toObject({ getters: true }) });
};

exports.getPlayerById = getPlayerById;
exports.getPlayers = getPlayers;
exports.createPlayer = createPlayer;
exports.deletePlayer = deletePlayer;
exports.updatePlayer = updatePlayer;