const express = require("express");
const router = express.Router();
const moment = require("moment");
const { Professional } = require("../models/professional/professionalModel");
const { TypeOfService } = require("../models/typeOfService/typeOfServiceModel");
const { Appointment } = require("../models/appointment/appointmentModel");
const { ConfigModel } = require("../models/config/configModel");
const { ObjectId } = require("mongodb");

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
const verifyTimeAvailability = async (req, res, next) => {
  try {
    const professional = await Professional.findById(req.params.id);
    if (!professional) {
      return res.status(404).send("Professional not found");
    }

    const timeAvailabilities = professional.timeAvailabilities;
    const newTimeAvailabities = req.body.timeAvailabilities;

    const config = await ConfigModel.findOne({});
    const changeAppointment = req.body.changeAppointment;

    const dayOfWeek = Object.keys(timeAvailabilities);
    const difDays = [];

    function timeToMinutes(timeStr) {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    }

    for (let index = 0; index < dayOfWeek.length; index++) {
      const dayTimeA = timeAvailabilities[dayOfWeek[index]];
      const dayTimeNewA = newTimeAvailabities[dayOfWeek[index]];

      if (!dayTimeNewA.active && dayTimeA.active) {
        const indexote = index === 6 ? 0 : index + 1;
        newTimeAvailabities[dayOfWeek[index]] = {
          active: false,
          initialHour: "00:00",
          finalHour: "00:00",
          secondInitialHour: "00:00",
          secondFinalHour: "00:00",
        }
        difDays.push(indexote);
        continue;
      }

      // Convertir las horas a minutos
      const initialHourA = timeToMinutes(dayTimeA.initialHour);
      const finalHourA = timeToMinutes(dayTimeA.finalHour);
      const initialHourNewA = timeToMinutes(dayTimeNewA.initialHour);
      const finalHourNewA = timeToMinutes(dayTimeNewA.finalHour);

      const secondInitialHourA = timeToMinutes(dayTimeA.secondInitialHour);
      const secondFinalHourA = timeToMinutes(dayTimeA.secondFinalHour);
      const secondInitialHourNewA = timeToMinutes(
        dayTimeNewA.secondInitialHour
      );
      const secondFinalHourNewA = timeToMinutes(dayTimeNewA.secondFinalHour);

      if (
        initialHourNewA > initialHourA || // Nueva hora inicial mayor que la actual
        finalHourNewA < finalHourA || // Nueva hora final menor que la actual
        secondInitialHourNewA > secondInitialHourA || // Nueva segunda hora inicial mayor que la actual
        secondFinalHourNewA < secondFinalHourA // Nueva segunda hora final menor que la actual
      ) {
        const indexote = index === 6 ? 0 : index + 1;
        difDays.push(indexote);
      }
    }


    if (difDays.length === 0 || changeAppointment === "skip") {
      if (changeAppointment === "skip") {
        req.body.timeAvailabilities = timeAvailabilities;
      }
      return next();
    }

    // Función para obtener todos los días específicos en un rango de fechas
    const getSpecificDaysInRange = (startDate, endDate, daysOfWeek) => {
      const specificDays = [];
      let current = moment(startDate);

      while (current <= endDate) {
        if (daysOfWeek.includes(current.isoWeekday())) {
          specificDays.push(current.clone());
        }
        current.add(1, "days");
      }

      return specificDays;
    };

    // Función para buscar turnos en días específicos dentro de 12 meses
    const nextMonths = config.appointment.nextMonths;
//
    const findAppointmentsOnSpecificDays = async (daysOfWeek) => {
      try {
        const today = moment();
        const startDate = today.add(1, "days").startOf("day").toDate();
        const endDate = today.add(nextMonths, "months").endOf("day").toDate();

        const specificDays = getSpecificDaysInRange(
          startDate,
          endDate,
          daysOfWeek
        );
        const appointments = [];

        const convertToDate = (timeString, date) =>
          moment(date)
            .set({
              hour: parseInt(timeString.split(":")[0]),
              minute: parseInt(timeString.split(":")[1]),
              second: 0,
              millisecond: 0,
            })
            .toDate();

        for (const day of specificDays) {
          const startOfDay = day.startOf("day").toDate();
          const endOfDay = day.endOf("day").toDate();

          const availability =
            newTimeAvailabities[day.format("dddd").toLowerCase()];
          const firstRangeStart = convertToDate(
            availability.initialHour,
            startOfDay
          );
          const firstRangeEnd = convertToDate(
            availability.finalHour,
            startOfDay
          );
          const secondRangeStart = convertToDate(
            availability.secondInitialHour,
            startOfDay
          );
          const secondRangeEnd = convertToDate(
            availability.secondFinalHour,
            startOfDay
          );

          const result = await Appointment.find({
            professional: req.params.id,
            date: {
              $gte: startOfDay,
              $lte: endOfDay,
            },
            disabled: false,
            $or: [
              {
                // Citas que empiezan o terminan antes del primer rango de disponibilidad
                startTime: { $lt: firstRangeStart }, // Empieza antes del primer rango
              },
              {
                // Citas que empiezan o terminan después del segundo rango de disponibilidad
                endTime: { $gt: secondRangeEnd }, // Termina después del segundo rango (¡Esto es lo que faltaba corregir!)
              },
              {
                // Citas que caen entre el final del primer rango y el inicio del segundo rango de disponibilidad
                $and: [
                  {
                    startTime: { $gte: firstRangeEnd }, // Empieza después del primer rango
                  },
                  {
                    endTime: { $lt: secondRangeStart }, // Termina antes del segundo rango
                  },
                ],
              },
            ],
          }).populate("typeOfService");
          

          appointments.push(...result);
        }

        return appointments;
      } catch (error) {
        console.error("Error finding appointments:", error);
        throw error;
      }
    };
//
    const appointments = await findAppointmentsOnSpecificDays(difDays);

    if (changeAppointment === "cancel") {
      const objectIds = appointments.map((apo) => apo._id);
      await Appointment.updateMany(
        { _id: { $in: objectIds } },
        { $set: { disabled: true } }
      );
      return next();
    }

    if (appointments.length === 0) {
      return next();
    } else {
      return res
        .status(400)
        .send({ conflicts: appointments, length: appointments.length });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ error });
  }
};

router.put("/professionals/:id", verifyTimeAvailability, async (req, res) => {
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

const verifyAndHandleAppointments = async (req, res, next) => {
  try {
    const fecha = new Date(new Date().getTime() + (-3 * 60 * 60 * 1000) - (30 * 60 * 1000));
    const appointments = await Appointment.find({
      professional: req.params.id,
      disabled: false,
      date: { $gte: fecha }
    }).populate("typeOfService");

    if (appointments.length > 0) {
      const changeAppointment = req.query.action;

      if (changeAppointment === "cancel") {
        const appointmentIds = appointments.map(
          (appointment) => appointment._id
        );
        await Appointment.updateMany(
          { _id: { $in: appointmentIds } },
          { $set: { disabled: true } }
        );
        return next();
      } else if (changeAppointment === "skip") {
        return next();
      } else {
        return res.status(400).send({
          conflicts: appointments,
          length: appointments.length,
        });
      }
    } else {
      next();
    }
  } catch (error) {
    res.status(500).send({ error: "Error al verificar las citas" });
  }
};

//delete
router.delete(
  "/professionals/:id",
  verifyAndHandleAppointments,
  async (req, res) => {
    try {
      const professional = await Professional.findByIdAndUpdate(
        req.params.id,
        { disabled: true },
        { new: true }
      );
      res.status(200).send(professional);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

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
router.get(
  "/professionalsAndTimeAvailable/:profId/:day/:serviceId",
  async (req, res) => {
    try {
      const { day, profId, serviceId } = req.params;
      if (!day) {
        return res.status(400).send("Day is required");
      }

      const professional = await Professional.findById(profId);
      if (!professional) {
        return res.status(404).send("Professional not found");
      }

      // Función para obtener el nombre del día de la semana
      const getDayOfWeek = (dateString) => {
        const date = new Date(dateString);
        const dayOfWeek = date.getUTCDay(); // 0 (domingo) a 6 (sábado)
        const days = [
          "sunday",
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
        ];
        return days[dayOfWeek];
      };

      const dayOfWeek = getDayOfWeek(day);

      // Buscar todas las citas confirmadas para ese profesional en el día
      const startOfDay = new Date(day);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(day);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const appointmentsConfirmed = await Appointment.find({
        professional: professional._id,
        date: { $gte: startOfDay, $lte: endOfDay },
        disabled: false,
      });

      // Preparar la disponibilidad horaria según el día de la semana
      const timeAvailabilitiesOfDay = professional.timeAvailabilities[dayOfWeek];
      if (!timeAvailabilitiesOfDay) {
        return res.status(400).send("No availability");
      }

      const {
        initialHour,
        finalHour,
        secondInitialHour,
        secondFinalHour,
      } = timeAvailabilitiesOfDay;

      const { duration: serviceDuration } = await TypeOfService.findById(
        serviceId
      );

      // Función para generar franjas horarias con el intervalo del servicio
      const generateTimeSlots = (start, end, interval) => {
        const startTime = new Date(`1970-01-01T${start}:00Z`);
        const copyStartTime = new Date(`1970-01-01T${start}:00Z`);
        const endTime = new Date(`1970-01-01T${end}:00Z`);
        const slots = [];

        while (
          startTime < endTime &&
          copyStartTime.setMinutes(startTime.getMinutes() + interval) <= endTime
        ) {
          slots.push(startTime.toISOString().substring(11, 16));
          startTime.setMinutes(startTime.getMinutes() + interval);
        }

        return slots;
      };

      const allSchedules = [
        ...generateTimeSlots(initialHour, finalHour, serviceDuration),
        ...generateTimeSlots(secondInitialHour, secondFinalHour, serviceDuration),
      ];

      // Se crea un objeto para contar la cantidad de turnos en cada franja horaria
      const slotCounts = {};

      appointmentsConfirmed.forEach((appt) => {
        const startTime = new Date(appt.startTime);
        const endTime = new Date(appt.endTime);
        let adjustedStart = new Date(appt.startTime);
        let adjustedEnd = new Date(appt.endTime);

        // Se recorre allSchedules para ajustar el inicio y fin del turno según las franjas disponibles
        for (let i = 0; i < allSchedules.length; i++) {
          const time = allSchedules[i];
          const [hours, minutes] = time.split(":");
          const stringStart = startTime.toJSON().split("T");
          const formattedStart =
            stringStart[0] + `T${hours}:${minutes}` + stringStart[1].slice(5);
          const stringEnd = endTime.toJSON().split("T");
          const formattedEnd =
            stringEnd[0] + `T${hours}:${minutes}` + stringEnd[1].slice(5);

          if (new Date(formattedStart) <= startTime) {
            adjustedStart = new Date(formattedStart);
          }

          if (new Date(formattedEnd) >= endTime) {
            adjustedEnd = new Date(formattedEnd);
            break;
          }
        }

        // Se generan todas las franjas horarias que cubre este turno y se acumula el conteo
        while (adjustedStart < adjustedEnd) {
          const slot = adjustedStart.toISOString().substring(11, 16);
          slotCounts[slot] = (slotCounts[slot] || 0) + 1;
          adjustedStart.setMinutes(adjustedStart.getMinutes() + serviceDuration);
        }
      });

      // Se utiliza la propiedad maxAppos para determinar cuándo un horario ya alcanzó su límite
      const maxAppos = professional.maxAppos || 1; // si no se define, se asume 1
      const unavailableSchedules = allSchedules.filter((slot) => {
        return (slotCounts[slot] || 0) >= maxAppos;
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
  }
);

module.exports = router;
