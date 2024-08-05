const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const timeAvailabilitySchema = require("./timeAvailability/timeAvailabilitySchema");

const defaultTimeAvailability = {
  initialHour: "09:00",
  finalHour: "13:00",
  secondInitialHour: "17:00",
  secondFinalHour: "21:00",
};

const professionalSchema = new Schema({
  name: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  profession: { type: String, required: true },
  image: { type: String, required: true },
  timeAvailabilities: {
    monday: {
      type: timeAvailabilitySchema,
      default: () => defaultTimeAvailability,
    },
    tuesday: {
      type: timeAvailabilitySchema,
      default: () => defaultTimeAvailability,
    },
    wednesday: {
      type: timeAvailabilitySchema,
      default: () => defaultTimeAvailability,
    },
    thursday: {
      type: timeAvailabilitySchema,
      default: () => defaultTimeAvailability,
    },
    friday: {
      type: timeAvailabilitySchema,
      default: () => defaultTimeAvailability,
    },
    saturday: {
      type: timeAvailabilitySchema,
      default: () => defaultTimeAvailability,
    },
    sunday: {
      type: timeAvailabilitySchema,
      default: () => defaultTimeAvailability,
    },
  },
  typesOfServices: [
    { type: Schema.Types.ObjectId, ref: "TypeOfService", required: false },
  ],
});

const Professional = mongoose.model("Professional", professionalSchema);

module.exports = { Professional };
