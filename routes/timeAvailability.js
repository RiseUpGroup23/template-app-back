const express = require("express");
const router = express.Router();
const { Professional } = require("../models/professional/professionalModel");

//time tiene valores default asi que solo creo put
router.put("/timeAvailabilities/:id", async (req, res) => {
  try {
    const professional = await Professional.findByIdAndUpdate(
      req.params.id,
      { timeAvailabilities: req.body.timeAvailabilities },
      { new: true, runValidators: true }
    );
    if (!professional) {
      return res.status(404).send();
    }
    res.status(200).send(professional);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
