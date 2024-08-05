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
    const frontOrigin = req.body.origin.endsWith("/") ? req.body.origin.slice(0, -1) : req.body.origin
    const backUrl = new URL(`http://${process.env.HOST ?? 'localhost'}${req.url}`);
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
        success: `${frontOrigin}/reserva-exitosa`,
        failure: `${frontOrigin}/reserva-error`,
      },
      auto_return: "approved",
      notification_url: `${backUrl.origin}/mercadopago/webhook`, // variables de entorno
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
  const backUrl = new URL(`http://${process.env.HOST ?? 'localhost'}${req.url}`);
  try {
    if (paymentQ.type === "payment") {
      const result = await payment.get({
        id: paymentQ["data.id"],
      });
      const existingAppointment = await Appointment.findOne({
        date: result.metadata.date
      });
      if (result.status === "approved" && !existingAppointment) {
        axios.post(`${backUrl}/appointments`, transformarObjeto(result.metadata))
      }
      return res.status(200);
    }
  } catch (error) {
    console.error("error webhook", error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
