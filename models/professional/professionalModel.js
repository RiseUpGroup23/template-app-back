const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const {timeAvailabilitySchema} = require('../models/timeAvailability/timeAvailabilityModel')


const professionalSchema = new Schema({
  name: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  timeAvailabilities: {
    monday: { type: timeAvailabilitySchema, required: true },
    tuesday: { type: timeAvailabilitySchema, required: true },
    wednesday: { type: timeAvailabilitySchema, required: true },
    thursday: { type: timeAvailabilitySchema, required: true },
    friday: { type: timeAvailabilitySchema, required: true },
    saturday: { type: timeAvailabilitySchema, required: true },
    sunday: { type: timeAvailabilitySchema, required: true }
  },
  typesOfServices: [{ type: Schema.Types.ObjectId, ref: 'TypeOfService', required: false }]
});

const Professional = mongoose.model("Professional", professionalSchema);

module.exports = { Professional };
