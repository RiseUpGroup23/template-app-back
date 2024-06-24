const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const timeAvailavilitySchema = new Schema({
  initialHour: { type: String },
  finalHour: { type: String },
  secondInitialHour: { type: String },
  secondFinalHour: { type: String },
  active: { type: Boolean, default: true }
});

module.exports = timeAvailavilitySchema;
