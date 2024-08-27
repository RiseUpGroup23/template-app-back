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

const verifyNoAppointmentsForTypeOfService = async (req, res, next) => {
  try {
    const { changeAppointment } = req.body; 

    const appointments = await Appointment.find({
      typeOfService: req.params.id,
      disabled: false
    });

    if (appointments.length === 0) {
      return next(); 
    }

    if (changeAppointment === "skip") {
      return res.status(400).send({
        message: "El tipo de servicio no fue eliminado debido a que tiene turnos pendientes.",
        appointments
      });
    }

    if (changeAppointment === "cancel") {
      const objectIds = appointments.map(apo => apo._id);
      await Appointment.updateMany(
        { _id: { $in: objectIds } },
        { $set: { disabled: true } }
      );
      return next(); 
    }

    if (changeAppointment === "reprogram") {
      return res.status(400).send({
        message: "Hay turnos pendientes que necesitan ser reprogramados",
        appointments
      });
    }

    return res.status(400).send({
      message: "El tipo de servicio tiene turnos pendientes y no puede ser eliminado",
      appointments
    });
  } catch (error) {
    res.status(500).send({ error: "Error al verificar las turnos" });
  }
};


//delete
router.delete("/typesOfServices/:id", verifyNoAppointmentsForTypeOfService, async (req, res) => {
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
