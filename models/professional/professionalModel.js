const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const timeAvailabilitySchema = require('./timeAvailabilitySchema')
const appointmentSchema = require('./appointmentSchema')
const typeOfServiceSchema = require('./typeOfServiceSchema')

const professionalSchema = new Schema({
  name: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  timeAvailability: { type: [timeAvailabilitySchema], required: true },
  appointmentsOfTheDay: { type: [appointmentSchema], required: false },
  typesOfServices: { type: [typeOfServiceSchema], required: true },
});

const Professional = mongoose.model("Professional", professionalSchema);

module.exports = { Professional };
