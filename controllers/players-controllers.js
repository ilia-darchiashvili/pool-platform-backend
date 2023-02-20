const { validationResult } = require('express-validator');

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

exports.getPlayerById = getPlayerById;
exports.getPlayers = getPlayers;
exports.createPlayer = createPlayer;