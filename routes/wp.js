const express = require("express");
const axios = require("axios");
const router = express.Router();

//pal .env
const whatsappToken =
  "EAARcGh1d8gsBO1IsC9RlzOZA1UN2fBbeMdopjtlf9nbGIrgzZCPNYQfgGZCSoH6hOPMmW8YpkD6u31NGDdUZBcLyAvREJb2AHIxbEDOE6ezdhlh6H6MPGTvj8IzBFvukTDHOAlqGmIlZC59I41ZCYEZBcdMf9aLV9yZBQafqPgYoxZBzZCHmYyBjtWZAHwLJzVXUnO8tcAI3kT8djU1DKsE0zwZD";
const whatsappPhoneNumberId = "386041251250531";

router.post("/wp", async (req, res) => {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v11.0/${whatsappPhoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        to: "543815729513",
        type: "template",
        template: { name: "hello_world", language: { code: "en_US" } },
      },
      {
        headers: {
          Authorization: `Bearer ${whatsappToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    res.status(200).send("mensaje enviado.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al enviar el mensaje.");
  }
});

module.exports = router;
