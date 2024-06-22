const express = require("express");
const router = express.Router();
const { Professional } = require("../models/professional/professionalModel");

router.post("/professionals", async (req, res) => {
  try {
    const professional = new Professional(req.body);

    await professional.save();
    res.status(201).send(professional);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/professionals", async (req, res) => {
  try {
    const professional = await Professional.find().populate("typesOfServices");

    res.status(200).send(professional);
  } catch (error) {
    res.status(500).send(error);
  }
});

//ID
router.get("/professionals/:id", async (req, res) => {
  try {
    const professional = await Professional.findById(req.params.id);
    if (!professional) {
      return res.status(404).send();
    }
    res.status(200).send(professional);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Actualizar
router.put("/professionals/:id", async (req, res) => {
  try {
    const professional = await Professional.findByIdAndUpdate(
      req.params.id,
      req.body,
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

//delete
router.delete("/professionals/:id", async (req, res) => {
  try {
    const professional = await Professional.findByIdAndDelete(
      req.params.id
    )
    res.status(200).send(professional);
  } catch (error) {
    res.status(500).send(error);
  }
});

//agregar typeofser
router.put("/professionals&services/:id", async (req, res) => {
  const serviceId = req.body.serviceId;

  try {
    const service = await TypeOfService.findById(serviceId);
    if (!service) {
      return res.status(404).send(error);
    }

    const professional = await Professional.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { typesOfServices: serviceId } },
      { new: true, runValidators: true }
    );

    res.status(200).send(professional);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
