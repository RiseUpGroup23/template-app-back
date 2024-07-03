const express = require("express");
const axios = require("axios");
const router = express.Router();

//pal .env
const whatsappToken = //dura 24hs
  "EAARcGh1d8gsBO4V3j7lzEI3a9yCK5wdCJ8ooEcSQ2CBnwedKkwo2TkZBEcqNv2nTyVZCybfw0lmM0l8ZBrHmDsGDxAHM3fPm1B41sEPQUJjNg8xGDcJ7i8cpnJfFqareV9CKxgo5Mf4UEQZAVdGwfbO5M8EZBxgRZAvczTiEkAfrZCo2MLsnznnAV78RZArhztYXYyRqV05wfZAs1FUp4TYUZD";
const whatsappPhoneNumberId = "386041251250531"; //id numero dueño

router.post("/wp", async (req, res) => {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v11.0/${whatsappPhoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        to: "543815729513", //req.body.phone
        type: "template",
        template: {
          name: "turno",
          language: {
            code: "es",
          },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: "Alejo", //req.body.appointment.customer.name
                },
                {
                  type: "text",
                  text: "03-07-2024", //req.body.apponintment.date
                },
                {
                  type: "text",
                  text: "18:00", //req.body.apponintment.time
                },
                {
                  type: "text",
                  text: "Avenida Aconquija 150", //config?
                },
                {
                  type: "text",
                  text: "BarberShop", //config?
                },
              ],
            },
          ],
        },
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
