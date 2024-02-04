const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const NextEvent = require('../models/nextEvent');

const getNextEvent = async (req, res, next) => {
  let nextEvent;
  try {
    nextEvent = await NextEvent.find({});
  } catch (err) {
    const error = new HttpError(
      'Fetching next event failed, please try again later.',
      500
    );
    return next(error);
  }

  res.json({ nextEvent: nextEvent?.[0] });
};

const createNextEvent = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        new HttpError('Invalid inputs passed, please check your data.', 422)
      );
    }
  
    const { name, dateTime } = req.body;

    try {
      const existingNextEvent = await NextEvent.find({});
      if (existingNextEvent?.length) {
        await existingNextEvent[0].remove();
      }
    } catch (err) {
      return next(err);
    }
  
    const createdNextEvent = new NextEvent({ name, dateTime });
  
    try {
      await createdNextEvent.save();
    } catch (err) {
      const error = new HttpError(
        'Creating next event failed, please try again.',
        500
      );
      return next(error);
    }
  
    res.status(201).json({ nextEvent: createdNextEvent });
};

exports.createNextEvent = createNextEvent;
exports.getNextEvent = getNextEvent;
