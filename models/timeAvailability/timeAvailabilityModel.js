const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const timeAvailavilitySchema = new Schema({
  day: {
    type: {String},
    required: true,
    enum: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
  },
  initialHour: { type: String, required: true },
  finalHour: { type: String, required: true },
  secondInitialHour: { type: String, required: false },
  SecondFinalHour: { type: String, required: false },
});

const TimeAvailavility = mongoose.model(
  "TimeAvailavility",
  timeAvailavilitySchema
);

module.exports = { TimeAvailavility };
