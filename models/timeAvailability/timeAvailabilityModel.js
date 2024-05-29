const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const timeAvailavilitySchema = new Schema({
  initialHour: { type: String, default: "9:00"},
  finalHour: { type: String, default: "13:00"},
  secondInitialHour: { type: String, default: "17:00"},
  SecondFinalHour: { type: String, default: "21:00"},
});

const TimeAvailavility = mongoose.model(
  "TimeAvailavility",
  timeAvailavilitySchema
);

module.exports = { TimeAvailavility, timeAvailavilitySchema };
