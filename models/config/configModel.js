const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ImgSchema = require("./configSchemas/imgSchema");
const ContactSchema = require("./configSchemas/contactSchema");
const { defaultStringValue } = require("../../config");

const ConfigSchema = new Schema({
  texts: {
    presentationTitle: {
      type: String,
      default: "Título",
    },
    presentationText: {
      type: String,
      default: "Descripción de la empresa",
    },
    footer: {
      type: String,
      default: "Descripción de la empresa",
    }
  },
  imagePresentation: {
    type: String,
    default: "https://www.estudiostreaming.com.ar/wp-content/uploads/2020/10/tulogo.png",
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
      name: "Nombre de la empresa",
      phone: "0000",
      address: "Dirección",
      email: "email@email.com",
      city: "Ciudad",
      state: "Provincia",
      mapPoint: "",
      facebook: "facebook.com",
      instagram: "instagram.com",
    },
  },
  appointment: {
    mercadoPago: {
      type: Boolean,
      default: false
    },
    bannedDays: [{
      title: {
        type: String,
        required: true
      },
      date: {
        type: Date,
        required: true
      }
    }]
  },
  customization: {
    background: {
      backgroundImage: { type: String, default: defaultStringValue },
      backgroundTurno: { type: String, default: defaultStringValue },
    },
    primary: {
      color: { type: String, default: "#FFFFFF" },
      text: { type: String, default: "#000000" },
    },
    secondary: {
      color: { type: String, default: "#FFFFFF" },
      text: { type: String, default: "#000000" },
    },
    logo: {
      primary: { type: String, default: "https://www.estudiostreaming.com.ar/wp-content/uploads/2020/10/tulogo.png" },
      secondary: { type: String, default: "https://www.estudiostreaming.com.ar/wp-content/uploads/2020/10/tulogo.png" },
    },
    shopName: { type: String, default: "Nombre de la empresa" },
    twoColors: { type: Boolean, default: true }
  },
});

const ConfigModel = mongoose.model("ConfigSchema", ConfigSchema);

module.exports = { ConfigModel };
