const express = require('express');
const { check } = require('express-validator');

const nextEventControllers = require('../controllers/next-event-controllers');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.get('/', nextEventControllers.getNextEvent);

router.use(checkAuth);

router.post(
  '/',
  [
    check('name')
      .not()
      .isEmpty(),
    check('dateTime')
      .not()
      .isEmpty(),
  ],
  nextEventControllers.createNextEvent
);


module.exports = router;
