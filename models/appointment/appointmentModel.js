const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const appointmentSchema = new Schema({
  date: { type: Date, required: true }, //2024-05-28T12:00:00Z
  professional: { type: Schema.Types.ObjectId, ref: "Professional" },
  typeOfService: { type: Schema.Types.ObjectId, ref: "TypeOfService" },
  //datos del cliente
});

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = { Appointment };
