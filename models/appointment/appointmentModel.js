const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const appointmentSchema = new Schema({
  date: { type: Date, required: true }, //2024-05-28T12:00:00Z
  typeOfService: { type: Schema.Types.ObjectId, ref: 'TypeOfService' },
  customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
  professional: { type: Schema.Types.ObjectId, ref: 'Professional' }
});

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = { Appointment };
