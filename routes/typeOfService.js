const express = require("express");
const router = express.Router();
const { TypeOfService } = require("../models/typeOfService/typeOfServiceModel");

router.post("/typesOfServices", async (req, res) => {
  try {
    const typeOfService = new TypeOfService(req.body);

    await typeOfService.save();
    res.status(201).send(typeOfService);
  } catch (error) {
    res.status(400).send(error);
  }
});

//get
router.get("/typesOfServices", async (req, res) => {
  try {
    const typeOfService = await TypeOfService.find();
    res.status(200).send(typeOfService);
  } catch (error) {
    res.status(500).send(error);
    console.log(error);
  }
});

//ID
router.get("/typesOfServices/:id", async (req, res) => {
  try {
    const typeOfService = await TypeOfService.findById(req.params.id);
    if (!typeOfService) {
      return res.status(404).send();
    }
    res.status(200).send(typeOfService);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Actualizar
router.put("/typesOfServices/:id", async (req, res) => {
  try {
    const typeOfService = await TypeOfService.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!typeOfService) {
      return res.status(404).send();
    }
    res.status(200).send(typeOfService);
  } catch (error) {
    res.status(400).send(error);
  }
});

//delete
router.delete("/typesOfServices/:id", async (req, res) => {
  try {
    const typeOfService = await TypeOfService.findByIdAndDelete(req.params.id);
    if (!typeOfService) {
      return res.status(404).send();
    }
    res.status(200).send(typeOfService);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
