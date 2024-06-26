const express = require("express");
const router = express.Router();
const { Appointment } = require("../models/appointment/appointmentModel");
const { Professional } = require("../models/professional/professionalModel");
const { TypeOfService } = require("../models/typeOfService/typeOfServiceModel");

// post
router.post("/appointments", async (req, res) => {
  try {
    // Obtener el profesional
    const professional = await Professional.findById(req.body.professional);
    if (!professional) {
      return res.status(404).send({ error: "Professional not found" });
    }

    // Obtener el tipo de servicio
    const typeOfService = await TypeOfService.findById(req.body.typeOfService);
    if (!typeOfService) {
      return res.status(404).send({ error: "Type of Service not found" });
    }

    // Extraer y analizar la fecha de la solicitud
    const dateString = req.body.date;
    const date = new Date(dateString);
    const dayOfWeek = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ][date.getUTCDay()];
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();

    // Verificar disponibilidad para el día
    const availability = professional.timeAvailabilities[dayOfWeek];
    if (!availability) {
      return res.status(400).send({ error: "No availability" });
    }

    // Convertir las horas de disponibilidad a minutos
    const availabilityStart =
      parseInt(availability.initialHour.split(":")[0]) * 60 +
      parseInt(availability.initialHour.split(":")[1]);
    const availabilityEnd =
      parseInt(availability.finalHour.split(":")[0]) * 60 +
      parseInt(availability.finalHour.split(":")[1]);
    const availabilitySecondStart =
      parseInt(availability.secondInitialHour.split(":")[0]) * 60 +
      parseInt(availability.secondInitialHour.split(":")[1]);
    const availabilitySecondEnd =
      parseInt(availability.secondFinalHour.split(":")[0]) * 60 +
      parseInt(availability.secondFinalHour.split(":")[1]);

    const appointmentTime = hours * 60 + minutes;

    // Verificar que la hora del turno esté dentro del rango de disponibilidad
    const isAvailable =
      (appointmentTime >= availabilityStart &&
        appointmentTime <= availabilityEnd) ||
      (appointmentTime >= availabilitySecondStart &&
        appointmentTime <= availabilitySecondEnd);
    if (!isAvailable) {
      return res.status(400).send({
        error: "Appointment time is outside of professional's availability",
      });
    }

    // Verificar que la hora del turno esté en el intervalo correcto
    const interval = professional.appointmentInterval;
    const isWithinInterval =
      (appointmentTime - availabilityStart) % interval === 0 ||
      (appointmentTime - availabilitySecondStart) % interval === 0;
    if (!isWithinInterval) {
      return res.status(400).send({
        error: "is out of range",
      });
    }

    // Calcular el startTime y endTime basado en la duración del servicio
    const startTime = new Date(dateString);
    const endTime = new Date(
      startTime.getTime() + typeOfService.duration * 60000
    ); // Convertir duración a milisegundos

    // Buscar turnos existentes para el mismo profesional en el mismo día
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const appointmentsOfDay = await Appointment.find({
      professional: professional._id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    // Verificar si ya existe una cita a la misma hora
    const existingAppointment = appointmentsOfDay.find(
      (appt) => appt.date.getTime() === new Date(dateString).getTime()
    );
    if (existingAppointment) {
      return res.status(400).send({
        error:
          "Appointment already exists for this professional at the specified date and time",
      });
    }

    // Verificar solapamiento de citas
    const overlappingAppointment = appointmentsOfDay.find((appt) => {
      const existingStartTime = appt.startTime.getTime();
      const existingEndTime = appt.endTime.getTime();
      return startTime < existingEndTime && endTime > existingStartTime;
    });

    if (overlappingAppointment) {
      return res
        .status(400)
        .send({ error: "Appointment overlaps with an existing appointment" });
    }

    // Crear y guardar la nueva cita
    const appointment = new Appointment({
      ...req.body,
      startTime: startTime,
      endTime: endTime,
    });
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
      .populate("professional")
      .populate("typeOfService");
    res.status(200).send(appointments);
  } catch (error) {
    res.status(500).send(error);
    console.log(error);
  }
});

//get x id
router.get("/appointments/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
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

//get x dia
router.get("/appointments/day/:date", async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      date: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate("professional")
      .populate("typeOfService");

    res.status(200).send(appointments);
  } catch (error) {
    res.status(500).send(error);
  }
});

//get x mes
router.get("/appointments/month/:year/:month", async (req, res) => {
  try {
    const { year, month } = req.params;
    const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
    const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const appointments = await Appointment.find({
      date: { $gte: startOfMonth, $lte: endOfMonth },
    })
      .populate("professional")
      .populate("typeOfService");

    res.status(200).send(appointments);
  } catch (error) {
    res.status(500).send(error);
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
