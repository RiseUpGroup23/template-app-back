const express = require('express');
const router = express.Router();
const { Appointment } =  require('../models/appointment/appointmentModel')

//post
router.post("/appointments", async (req, res) => {
  try {
    //verificacion para ver si el cliente existe (buscar por telefono)
    //crear en el caso de que no (req.body.customer)

    //customerid 

    const appointment = new Appointment(
req.body
    );
    await appointment.save();
    res.status(201).send(appointment);
  } catch (error) {
    res.status(400).send(error);
  }
});

//get
router.get("/appointments", async (req, res) => {
  try {
    const appointments = await Appointment.find().populate('customer');
    res.status(200).send(appointments);
  } catch (error) {
    res.status(500).send(error);
console.log(error);
}
});

//ID
router.get("/appointments/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).send();
    }
    res.status(200).send(appointment);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Actualizar
router.put("/appointments/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!appointment) {
      return res.status(404).send();
    }
    res.status(200).send(appointment);
  } catch (error) {
    res.status(400).send(error);
  }
});

//delete
router.delete("/appointments/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).send();
    }
    res.status(200).send(appointment);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;