const express = require("express");
const router = express.Router();
const { Preference, MercadoPagoConfig, Payment, } = require("mercadopago");

// const TOKEN = process?.env?.MPTOKEN ?? ""
const TOKEN = "APP_USR-5122067603010426-040316-c74ec9a6ccb3f802c1cb5cdf8ebcde25-1693845695"

// Agrega credenciales
const client = new MercadoPagoConfig({
  accessToken: TOKEN,
});

const payment = new Payment(client);

// POST
router.post("/mercadopago/crear-preferencia", async (req, res) => {
  try {

    const body = {
      items: [
        {
          title: "Seña turno",
          quantity: 1,
          unit_price: 50,
          currency_id: "ARS",
        },
      ],
      back_urls: {
        success: "https://www.anashe.org/",
        failure: "https://www.noanashe.org/",
      },
      auto_return: "approved",
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

module.exports = router;
