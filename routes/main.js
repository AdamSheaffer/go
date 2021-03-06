const { catchErrors } = require('../handlers/errorHandlers');
const ticketsController = require('../controllers/ticketController');
const tripsController = require('../controllers/tripsController');
const parkController = require('../controllers/parkController');
const badgeController = require('../controllers/badgeController');
const passport = require('passport');
const express = require('express');
const router = express.Router();

const requireAuth = passport.authenticate('jwt', { session: false });

router.get('/tickets', catchErrors(ticketsController.getEvents));
router.get('/tickets/:park', catchErrors(ticketsController.getTicketsForPark));
router.get('/range', catchErrors(ticketsController.getEventsInRadius));
router.post('/trips',
    requireAuth,
    tripsController.upload,
    catchErrors(tripsController.resize),
    catchErrors(tripsController.postNewTrip),
    catchErrors(tripsController.checkBadges));
router.get('/trips',
    requireAuth,
    catchErrors(tripsController.getUserTrips));
router.get('/trips/:id',
    requireAuth,
    catchErrors(tripsController.getUserTrip));
router.delete('/trips/:id',
    requireAuth,
    catchErrors(tripsController.deleteTrip));
router.put('/trips',
    requireAuth,
    tripsController.upload,
    catchErrors(tripsController.resize),
    tripsController.parseTrip,
    tripsController.validateTrip,
    catchErrors(tripsController.updateTrip));

router.get('/badges/:userId', catchErrors(badgeController.getBadges));

router.get('/parks', catchErrors(parkController.getParks));
router.get('/parks/:team', catchErrors(parkController.getParkByTeam));

module.exports = router;