const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const typeOfServiceSchema = new Schema({
  name: { type: String, required: true },
  duration: { type: Number, required: true }, // duracion en minutos
  image: { type: String, required: true },
  price: { type: Number, required: true },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const TypeOfService = mongoose.model("TypeOfService", typeOfServiceSchema);

module.exports = { TypeOfService };
