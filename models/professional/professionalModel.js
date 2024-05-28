const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const professionalSchema = new Schema({
  name: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  appointments: [{ type: Schema.Types.ObjectId, ref: 'Appointment', required: false }],
  timeAvailabilities: [{ type: Schema.Types.ObjectId, ref: 'TimeAvailability', required: false }],
  typesOfServices: [{ type: Schema.Types.ObjectId, ref: 'TypeOfService', required: false }]

});

const Professional = mongoose.model("Professional", professionalSchema);

module.exports = { Professional };
