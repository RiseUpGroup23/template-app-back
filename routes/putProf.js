const mongoose = require("mongoose");
const moment = require("moment"); // Asegúrate de instalar moment con npm install moment
const Appointment = require("./models/Appointment"); // Ajusta la ruta a tu modelo

// Función para obtener todos los días específicos en un rango de fechas
const getSpecificDaysInRange = (startDate, endDate, daysOfWeek) => {
  const specificDays = [];
  let current = moment(startDate);

  while (current <= endDate) {
    if (daysOfWeek.includes(current.isoWeekday())) {
      // Check if the current day is one of the specific days
      specificDays.push(current.clone());
    }
    current.add(1, "days");
  }

  return specificDays;
};

// Función para buscar turnos en días específicos dentro de 12 meses
const findAppointmentsOnSpecificDays = async (daysOfWeek) => {
  try {
    const today = moment();
    const startDate = today.startOf("day").toDate();
    const endDate = today.add(12, "months").endOf("day").toDate();

    const specificDays = getSpecificDaysInRange(startDate, endDate, daysOfWeek);
    const appointments = [];

    for (const day of specificDays) {
      const startOfDay = day.startOf("day").toDate();
      const endOfDay = day.endOf("day").toDate();

      const result = await Appointment.find({
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      });

      appointments.push(...result);
    }

    return appointments;
  } catch (error) {
    console.error("Error finding appointments:", error);
    throw error;
  }
};

// Ejemplo de uso
const daysOfWeek = [2, 5]; // 2 = Martes, 5 = Jueves

findAppointmentsOnSpecificDays(daysOfWeek)
  .then((appointments) => {
    console.log("Appointments on specific days:", appointments);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
