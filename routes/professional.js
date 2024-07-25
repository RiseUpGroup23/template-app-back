const express = require("express");
const router = express.Router();
const { Professional } = require("../models/professional/professionalModel");
const { Appointment } = require("../models/appointment/appointmentModel");

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
    const professional = await Professional.findByIdAndDelete(req.params.id);
    res.status(200).send(professional);
  } catch (error) {
    res.status(500).send(error);
  }
});

//agregar typeofser
router.put("/professionalsAndServices/:id", async (req, res) => {
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

//get all&unavailable timeA x dia
router.get("/professionalsAndTimeAvailable/:profId/:day", async (req, res) => {
  try {
    const { day, profId } = req.params;
    if (!day) {
      return res.status(400).send("Day is required");
    }

    const professional = await Professional.findById(profId);
    if (!professional) {
      return res.status(404).send("Professional not found");
    }

    const getDayOfWeek = (dateString) => {
      const date = new Date(dateString);
      const dayOfWeek = date.getUTCDay(); //0 (domingo), 6 (sábado)

      const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

      return days[dayOfWeek];
    };

    const dayOfWeek = getDayOfWeek(day);

    //appo x dia x profesional
    const startOfDay = new Date(day);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(day);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const appointmentsConfirmed = await Appointment.find({
      professional: professional._id,
      date: { $gte: startOfDay, $lte: endOfDay },
      disabled: false
    });

    // Preparar los horarios disponibles y no disponibles
    const timeAvailabilitiesOfDay = professional.timeAvailabilities[dayOfWeek];
    console.log(dayOfWeek);

    if (!timeAvailabilitiesOfDay) {
      return res.status(400).send("No availability");
    }

    const { initialHour, finalHour, secondInitialHour, secondFinalHour } = timeAvailabilitiesOfDay;
    const appointmentInterval = professional.appointmentInterval;

    const generateTimeSlots = (start, end, interval) => {
      const startTime = new Date(`1970-01-01T${start}:00Z`);
      const endTime = new Date(`1970-01-01T${end}:00Z`);
      const slots = [];

      while (startTime < endTime) {
        slots.push(startTime.toISOString().substring(11, 16));
        startTime.setMinutes(startTime.getMinutes() + interval);
      }

      return slots;
    };

    const allSchedules = [
      ...generateTimeSlots(initialHour, finalHour, appointmentInterval),
      ...generateTimeSlots(secondInitialHour, secondFinalHour, appointmentInterval)
    ];

    const unavailableSchedules = appointmentsConfirmed.flatMap(appt => {
      const startTime = new Date(appt.startTime);
      const endTime = new Date(appt.endTime);
      const slots = [];

      while (startTime < endTime) {
        slots.push(startTime.toISOString().substring(11, 16));
        startTime.setMinutes(startTime.getMinutes() + appointmentInterval);
      }

      return slots;
    });

    const timeAvailableAndtimeUnavailable = {
      unavailableSchedules,
      allSchedules,
    };

    res.status(200).send(timeAvailableAndtimeUnavailable);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});


module.exports = router;
