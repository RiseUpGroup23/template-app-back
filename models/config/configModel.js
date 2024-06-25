const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ImgSchema = require("./configSchemas/imgSchema");
const ContactSchema = require("./configSchemas/contactSchema");
const { defaultStringValue } = require("../../config");

const ConfigSchema = new Schema({
  imgsCarrousel: {
    type: [ImgSchema],
    default: [
      {
        name: defaultStringValue,
        url: defaultStringValue,
      },
    ],
  },
  presentationText: {
    type: String,
    default: defaultStringValue,
  },
  imagePresentation: {
    type: String,
    default: defaultStringValue,
  },
  presentationTitle: {
    type: String,
    default: defaultStringValue,
  },
  banners: {
    imageAppointment: {
      type: String,
      default: defaultStringValue,
    },
    imageAboutUs: {
      type: String,
      default: defaultStringValue,
    },
    imageNews: {
      type: String,
      default: defaultStringValue,
    },
    imageReservations: {
      type: String,
      default: defaultStringValue,
    },
  },
  contact: {
    type: ContactSchema,
    default: {
      name: defaultStringValue,
      phone: defaultStringValue,
      address: defaultStringValue,
      email: defaultStringValue,
      city: defaultStringValue,
      state: defaultStringValue,
      mapPoint: defaultStringValue,
      facebook: defaultStringValue,
      instagram: defaultStringValue,
    },
  },
  reservationPrice: {
    type: Number,
  },
  timeModule: {
    //creamos un objeto appo? para esas dos cosas y por si sale algo mas o nelson mandela
    type: Number,
  },
  customization: {
    background: {
      backgroundImage: { type: String, default: defaultStringValue },
      backgroundTurno: { type: String, default: defaultStringValue },
    },
    primary: {
      color: { type: String, default: defaultStringValue },
      text: { type: String, default: defaultStringValue },
    },
    secondary: {
      color: { type: String, default: defaultStringValue },
      text: { type: String, default: defaultStringValue },
    },
    logo: {
      primary: { type: String, default: defaultStringValue },
      secondary: { type: String, default: defaultStringValue },
    },
    shopName: { type: String, default: defaultStringValue },
  },
});

const ConfigModel = mongoose.model("ConfigSchema", ConfigSchema);

module.exports = { ConfigModel };
