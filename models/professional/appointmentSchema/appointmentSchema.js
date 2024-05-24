const mongoose = require("mongoose");
const customerSchema = require("../../appointment/customerSchema/customerSchema");
const Schema = mongoose.Schema;

const appointmentSchema = new Schema({
  initialHour: { type: String, required: true },
  duration: { type: String, required: true },
  requestedService: { type: String, required: true },
  date: { type: Date, required: true },
  customer: { type: customerSchema, required: true },
});


module.exports = appointmentSchema;
