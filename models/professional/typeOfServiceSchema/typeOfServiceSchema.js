const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const typeOfServiceSchema = new Schema({
  name: { type: String, required: true },
  duration: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: String, required: true },
});

module.exports = typeOfServiceSchema ;
