const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const customerSchema = new Schema({
  name: { type: String, required: true },
  lastname: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: false },
  appointments: [
    { type: Schema.Types.ObjectId, ref: "Appointment", required: false },
  ],
});

const Customer = mongoose.model("Customer", customerSchema);

module.exports = { Customer };
