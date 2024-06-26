const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const appointmentSchema = new Schema({
  date: { type: Date, required: true }, //2024-05-28T12:00:00Z
  startTime: { type: Date },
  endTime: { type: Date }, 
  professional: { type: Schema.Types.ObjectId, ref: "Professional" },
  typeOfService: { type: Schema.Types.ObjectId, ref: "TypeOfService" },
  customer:{
    name: { type: String, required: false },
    lastname: { type: String, required: false },
    phoneNumber: { type: String, required: false },
  }
});

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = { Appointment };
