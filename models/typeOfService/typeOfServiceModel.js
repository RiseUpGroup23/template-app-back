const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const typeOfServiceSchema = new Schema({
  name: { type: String, required: true },
  duration: { type: Number, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  professional: { type: Schema.Types.ObjectId, ref: 'Professional', required: true }
});

const TypeOfService = mongoose.model("TypeOfService", typeOfServiceSchema);

module.exports = { TypeOfService };
