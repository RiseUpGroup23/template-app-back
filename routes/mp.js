const express = require("express");
const router = express.Router();
const { Preference, MercadoPagoConfig, Payment } = require("mercadopago");
const axios = require("axios");
const { Appointment } = require("../models/appointment/appointmentModel");

// const TOKEN = process?.env?.MPTOKEN ?? ""
const TOKEN =
  "APP_USR-5122067603010426-040316-c74ec9a6ccb3f802c1cb5cdf8ebcde25-1693845695";

// Agrega credenciales
const client = new MercadoPagoConfig({
  accessToken: TOKEN,
});

const payment = new Payment(client);

function transformarObjeto(objeto) {
  const nuevoObjeto = {};

  for (let clave in objeto) {
    if (objeto.hasOwnProperty(clave)) {
      let nuevaClave = clave.replace(/_([a-z])/g, function (match, letra) {
        return letra.toUpperCase();
      });

      if (
        typeof objeto[clave] === "object" &&
        objeto[clave] !== null &&
        !Array.isArray(objeto[clave])
      ) {
        nuevoObjeto[nuevaClave] = transformarObjeto(objeto[clave]);
      } else {
        nuevoObjeto[nuevaClave] = objeto[clave];
      }
    }
  }

  return nuevoObjeto;
}

// POST
router.post("/mercadopago/crear-preferencia", async (req, res) => {
  try {
    console.log("crear pref", req.body.appointment);
    const body = {
      items: [
        {
          title: req.body.title,
          quantity: Number(req.body.quantity),
          unit_price: Number(req.body.price),
          currency_id: "ARS",
        },
      ],
      back_urls: {
        success: "https://www.anashe.org/", // variables de entorno
        failure: "https://www.noanashe.org/", // variables de entorno
      },
      auto_return: "approved",
      notification_url: `https://template-peluquerias-back.vercel.app/mercadopago/webhook`, // variables de entorno
      metadata: req.body.appointment,
    };

    const preference = new Preference(client);
    const result = await preference.create({ body });

    res.json({
      id: result.id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message,
    });
  }
});

router.post("/mercadopago/webhook", async (req, res) => {
  let paymentQ = req.query;
  try {
    if (paymentQ.type === "payment") {
      const result = await payment.get({
        id: paymentQ["data.id"],
      });
      const existingAppointment = await Appointment.findOne({
        date: result.metadata.date
      });
      if (result.status === "approved" && !existingAppointment) {
        axios.post("https://template-peluquerias-back.vercel.app/appointments", transformarObjeto(result.metadata))
      }
      return res.status(200);
    }
  } catch (error) {
    console.error("error webhook", error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
