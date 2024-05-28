const express = require('express');
const router = express.Router();
const { TimeAvailability } = require('../models/timeAvailability/timeAvailabilityModel')

router.post("/typesOfServices", async (req, res) => {
    try {
    const timeAvailability = new TimeAvailability(req.body)

    await timeAvailability.save();
    res.status(201).send(timeAvailability);
    } catch (error) {
    res.status(400).send(error);
    }
}) 

module.exports = router;
