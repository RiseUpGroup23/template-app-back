const express = require("express");
const router = express.Router();
const { TypeOfService } = require("../models/typeOfService/typeOfServiceModel");
const { ConfigModel } = require("../models/config/configModel");
const { Appointment } = require("../models/appointment/appointmentModel");

router.post("/typesOfServices", async (req, res) => {
  try {
    const typeOfService = new TypeOfService({
      name: req.body.name,
      duration: req.body.duration,
      image: req.body.image,
      price: req.body.price,
    });

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

const verifyAndHandleServiceAppointments = async (req, res, next) => {
  try {
    const fecha = new Date(new Date().getTime() + (-3 * 60 * 60 * 1000) - (30 * 60 * 1000));
    const appointments = await Appointment.find({
      typeOfService: req.params.id,
      disabled: false,
      date: { $gte: fecha }
    }).populate('typeOfService');

    if (appointments.length > 0) {
      const action = req.query.action;

      if (action === "cancel") {
        const appointmentIds = appointments.map(appointment => appointment._id);
        await Appointment.updateMany(
          { _id: { $in: appointmentIds } },
          { $set: { disabled: true } }
        );
        return next();
      } else if (action === "skip") {
        return next();
      } else {
        return res.status(400).send({
          conflicts: appointments,
          length: appointments.length
        });
      }
    } else {
      next();
    }
  } catch (error) {
    res.status(500).send({ error: "Error al verificar los turnos" });
  }
};


//delete
router.delete("/typesOfServices/:id", verifyAndHandleServiceAppointments, async (req, res) => {
  try {
    const typeOfService = await TypeOfService.findByIdAndUpdate(
      req.params.id,
      { disabled: true },
      { new: true }
    );
    if (!typeOfService) {
      return res.status(404).send();
    }
    res.status(200).send(typeOfService);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
