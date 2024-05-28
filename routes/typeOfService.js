const express = require('express');
const router = express.Router();
const { TypeOfService} = require('../models/typeOfService/typeOfServiceModel')

router.post("/typesOfServices", async (req, res) => {
    try {
    const typeOfService = new TypeOfService(req.body)

    await typeOfService.save();
    res.status(201).send(typeOfService);
    } catch (error) {
    res.status(400).send(error);
    }
}) 

module.exports = router;
