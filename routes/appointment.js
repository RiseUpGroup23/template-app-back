const express = require("express");
const router = express.Router();
const { Appointment } = require("../models/appointment/appointmentModel");
const { Customer } = require("../models/customers/customerModel");
const { Professional } = require("../models/professional/professionalModel");
const { TypeOfService } = require("../models/typeOfService/typeOfServiceModel");

//post
router.post("/appointments", async (req, res) => {
  try {
    const professional = await Professional.findById(req.body.professional);
    if (!professional) {
      return res.status(404).send(error);
    }

    // sacar disponibilidad , y turnos del dia (buscar todos los turnos que tengan como id de ese profesional ordenados por hora) 

    const typeOfService = await TypeOfService.findById(req.body.typeOfService);
    if (!typeOfService) {
      return res.status(404).send(error);
    }

    //duracion del tipo de servicio sumarlas a la hora (tiempo en minutos)

    let customer = await Customer.findById(req.body.customer);
    if (!customer) {
      const newCustomer = new Customer(req.body.customer);
      customer = await newCustomer.save();
    }

    //no puede pasar misma date y profesional

    const appointment = new Appointment({
      date: req.body.date,
      professional: req.body.professional,
      typeOfService: req.body.typeOfService,
      customer: req.body.customer || customer._id ,
    });

    await appointment.save();
    res.status(201).send(appointment);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

//get
router.get("/appointments", async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("customer")
      .populate("professional")
      .populate("typeOfService");
    res.status(200).send(appointments);
  } catch (error) {
    res.status(500).send(error);
    console.log(error);
  }
});

//ID
router.get("/appointments/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("customer")
      .populate("professional")
      .populate("typeOfService");
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

    const date = req.body.date; // "YYYY-MM-DD"
    const time = req.body.time; //  "HH:MM"
    const dateAndTime = date + "T" + time + ":00"; // Formato: "YYYY-MM-DDTHH:MM:SS"
    const dateGMT3 = new Date(dateAndTime + "-03:00");

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { date: dateGMT3 }, //que se pueda modificar todo
      { new: true, runValidators: true }
    );
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
