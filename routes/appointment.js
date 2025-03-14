const express = require("express");
const router = express.Router();
const { Appointment } = require("../models/appointment/appointmentModel");
const { Professional } = require("../models/professional/professionalModel");
const { TypeOfService } = require("../models/typeOfService/typeOfServiceModel");

const createOrUpdate = async (req, res, isUpdate = false) => {
  try {
    // Borra los turnos antiguos
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0); // Último día del mes pasado

    await Appointment.deleteMany({
      endTime: { $gte: lastMonth, $lte: endOfLastMonth },
    });

    // Borra los profesionales deshabilitados que no tienen turnos
    const professionalsWithoutAppointments = await Professional.aggregate([
      {
        $lookup: {
          from: 'appointments',
          localField: '_id',
          foreignField: 'professional',
          as: 'appointments'
        }
      },
      {
        $match: {
          appointments: { $size: 0 },
          disabled: true
        }
      }
    ]);

    const professionalIds = professionalsWithoutAppointments.map((p) => p._id);
    await Professional.deleteMany({ _id: { $in: professionalIds } });

    // Procesar los tipos de servicio deshabilitados y borrarlos si no tienen turnos asociados
    const disabledTypes = await TypeOfService.find({ disabled: true });
    for (const type of disabledTypes) {
      const appointments = await Appointment.find({
        typeOfService: type._id,
        disabled: false,
      });
      if (appointments.length === 0) {
        await TypeOfService.findByIdAndDelete(type._id);
      }
    }

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

    // Extraer y analizar la fecha del turno
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

    // Verificar que exista disponibilidad para ese día
    const availability = professional.timeAvailabilities[dayOfWeek];
    if (!availability) {
      return res.status(400).send({ error: "No availability" });
    }

    // Convertir los horarios de disponibilidad a minutos
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
    const isAvailable =
      (appointmentTime >= availabilityStart && appointmentTime <= availabilityEnd) ||
      (appointmentTime >= availabilitySecondStart && appointmentTime <= availabilitySecondEnd);
    if (!isAvailable) {
      return res.status(400).send({
        error: "Appointment time is outside of professional's availability",
      });
    }

    // Calcular startTime y endTime basado en la duración del servicio
    const startTime = new Date(dateString);
    const endTime = new Date(startTime.getTime() + typeOfService.duration * 60000);

    // Buscar turnos existentes para el mismo profesional en el mismo día
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);
    const appointmentsOfDay = await Appointment.find({
      professional: professional._id,
      date: { $gte: startOfDay, $lte: endOfDay },
      disabled: { $ne: true },
    });

    // Verificar solapamiento de citas permitiendo hasta maxAppos turnos por franja
    // Se cuentan todos los turnos que se traslapan con el nuevo turno
    const overlappingAppointments = appointmentsOfDay.filter((appt) => {
      const existingStartTime = appt.startTime.getTime();
      const existingEndTime = appt.endTime.getTime();
      return startTime < existingEndTime && endTime > existingStartTime;
    });

    // Si ya se alcanzó la cantidad máxima de turnos para esa franja, se rechaza la creación/actualización
    const maxAppos = professional.maxAppos || 1;
    if (!isUpdate && overlappingAppointments.length >= maxAppos) {
      return res.status(400).send({
        error: "Appointment overlaps with existing appointments and the maximum allowed appointments for this time slot have been reached",
      });
    }

    if (isUpdate) {
      // Actualizar el turno existente
      const appointment = await Appointment.findByIdAndUpdate(
        req.params.id,
        { ...req.body, startTime, endTime },
        { new: true, runValidators: true }
      );
      if (!appointment) {
        return res.status(404).send({ error: "Appointment not found" });
      }
      res.status(200).send(appointment);
    } else {
      // Crear y guardar el nuevo turno
      const appointment = new Appointment({
        ...req.body,
        startTime,
        endTime,
      });
      await appointment.save();
      res.status(201).send(appointment);
    }
  } catch (error) {
    console.error(error);
    res.status(400).send(error);
  }
};

//post
router.post("/appointments", (req, res) => createOrUpdate(req, res));

//put
router.put("/appointments/:id", (req, res) => createOrUpdate(req, res, true));

//get
router.get("/appointments", async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("professional")
      .populate("typeOfService")
      .sort({ date: -1 });
    res.status(200).send(appointments);
  } catch (error) {
    res.status(500).send(error);
    console.log(error);
  }
});

//get x phoneNumber
router.get("/appointments/phoneNumber/:phone", async (req, res) => {
  try {
    const { phone } = req.params;
    const appointments = await Appointment.find({
      "customer.phoneNumber": { $regex: phone, $options: "i" },
    })
      .populate("professional")
      .populate("typeOfService")
      .sort({ date: -1 });

    res.status(200).send(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// GET Buscador
router.get("/appointments/search", async (req, res) => {
  const fecha = new Date(new Date().getTime() + (-3 * 60 * 60 * 1000) - (30 * 60 * 1000));

  let query = {
    date: { $gte: fecha }
  };
  const term = req.query.term;
  const professional = req.query.professional;
  const typeOfService = req.query.typeOfService;
  const disabled = req.query.disabled;

  // default
  const page = parseInt(req.query.page) || 1;
  const rows = parseInt(req.query.rows) || 5;

  if (term && term !== "") {
    query.$or = [
      { "customer.name": { $regex: term, $options: "i" } },
      { "customer.lastname": { $regex: term, $options: "i" } },
    ];
  }

  if (typeOfService !== "all" && typeOfService) {
    query.typeOfService = typeOfService;
  }

  if (professional !== "all" && professional) {
    query.professional = professional;
  }

  if (disabled !== "all" && disabled !== undefined) {
    query.disabled =
      disabled === "true"
        ? true
        : disabled === "false"
          ? false
          : query.disabled;
  }

  try {
    // Buscar los turnos con paginación
    const appointments = await Appointment.find(query)
      .sort({ date: 1 })
      .populate({
        path: 'professional',
        select: '_id name lastname typesOfServices'
      })
      .populate("typeOfService")
      .skip((page - 1) * rows) // Saltar los documentos de las páginas anteriores
      .limit(rows) // limitar el número de documentos devueltos
      .exec();

    // Contar el total de documentos que coinciden con la consulta
    const count = await Appointment.countDocuments(query).exec();

    // Enviar la respuesta con los turnos y la información de paginación
    res.json({
      appointments,
      totalPages: Math.ceil(count / rows), // Número total de páginas
      currentPage: page, // Página actual
      totalAppointments: count, // Número total de turnos
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al buscar los turnos" });
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
    }).select('date disabled typeOfService professional');
    // .populate("professional")
    // .populate("typeOfService");

    res.status(200).send(appointments);
  } catch (error) {
    res.status(500).send(error);
  }
});

//borrado logico
router.patch("/appointments/delete/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        disabled: true,
      },
      { new: true }
    );
    if (!appointment) {
      return res.status(404).send();
    }
    res.status(200).send(appointment);
  } catch (error) {
    res.status(500).send(error);
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

module.exports = router;
