const express = require('express');
const router = express.Router();
const { Professional} = require('../models/professional/professionalModel')

router.post("/professionals", async (req, res) => {
    try {
    const professional = new Professional(req.body)
    
    await professional.save();
    res.status(201).send(professional);
    } catch (error) {
    res.status(400).send(error);
    }
}) 

router.get("/professionals", async (req, res) => {
    try {
    const professional = await Professional.find()

    res.status(200).send(professional);
    } catch (error) {
    res.status(500).send(error);
    }
}) 

module.exports = router;
