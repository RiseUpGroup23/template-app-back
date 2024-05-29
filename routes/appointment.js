const express = require('express');
const router = express.Router();
const { Appointment } =  require('../models/appointment/appointmentModel');
const { Customer } = require('../models/customers/customerModel');
const { Professional } = require('../models/professional/professionalModel');
const { TypeOfService } = require('../models/typeOfService/typeOfServiceModel');

//post
router.post("/appointments", async (req, res) => {
  try {
    const professional = await Professional.findById(req.body.professional);

    const typeOfService = await TypeOfService.findById(req.body.typeOfService);

    const customer = await Customer.findById(req.body.customer);
    if (!customer) {
      const newCustomer = new Customer(req.body.customer);
      await newCustomer.save();
    }

    








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
    const appointments = await Appointment.find().populate('customer');// faltan dos populate o con coma dentro del parentesis
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