const express = require("express");
const router = express.Router();
const { Appointment } = require("../models/appointment/appointmentModel");
const { Professional } = require("../models/professional/professionalModel");
const { TypeOfService } = require("../models/typeOfService/typeOfServiceModel");

//post
router.post("/appointments", async (req, res) => {
  try {
    //prof?
    const professional = await Professional.findById(req.body.professional);
    if (!professional) {
      return res.status(404).send({ error: "Professional not found" });
    }

    //typeof?
    const typeOfService = await TypeOfService.findById(req.body.typeOfService);
    if (!typeOfService) {
      return res.status(404).send({ error: "Type of Service not found" });
    }

    // dia y hs de date
    const dateString = req.body.date;
    const date = new Date(dateString);
    const dayOfWeek = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday"
    ][date.getUTCDay()];
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();

    //disponibilidad?
    const availability = professional.timeAvailabilities[dayOfWeek];
    if (!availability) {
      return res.status(400).send({ error: "No availability for this day" });
    }

    // Convertir horas de disponibilidad a minutos para comparación (god)
    const availabilityStart = parseInt(availability.initialHour.split(':')[0]) * 60 + parseInt(availability.initialHour.split(':')[1]);
    const availabilityEnd = parseInt(availability.finalHour.split(':')[0]) * 60 + parseInt(availability.finalHour.split(':')[1]);
    const availabilitySecondStart = parseInt(availability.secondInitialHour.split(':')[0]) * 60 + parseInt(availability.secondInitialHour.split(':')[1]);
    const availabilitySecondEnd = parseInt(availability.secondFinalHour.split(':')[0]) * 60 + parseInt(availability.secondFinalHour.split(':')[1]);

    const appointmentTime = hours * 60 + minutes;

    // Verificar que la hora del turno esté dentro del rango de disponibilidad
    const isAvailable = (appointmentTime >= availabilityStart && appointmentTime <= availabilityEnd) || (appointmentTime >= availabilitySecondStart && appointmentTime <= availabilitySecondEnd);
    if (!isAvailable) {
      return res.status(400).send({ error: "Appointment time is outside of professional's availability" });
    }

    // Buscar turnos existentes para el mismo profesional en el mismo día
    const startOfDay = new Date(date.setUTCHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setUTCHours(23, 59, 59, 999));
    const appointmentsOfDay = await Appointment.find({
      professional: professional._id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    // turno al mismo date
    const existingAppointment = appointmentsOfDay.find(appt => appt.date.getTime() === new Date(dateString).getTime());
    if (existingAppointment) {
      return res.status(400).send({ error: "Appointment already exists for this professional at the specified date and time" });
    }

    const appointment = new Appointment(req.body);
    await appointment.save();

    res.status(201).send(appointment);
  } catch (error) {
    console.error(error);
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
