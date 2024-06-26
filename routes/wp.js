const express = require('express');
const axios = require('axios');
const router = express.Router();

//pal .env
const whatsappToken = '';
const whatsappPhoneNumberId = '';

router.post('/wp', async (req, res) => {
    try {
        const response = await axios.post(
            `https://graph.facebook.com/v11.0/${whatsappPhoneNumberId}/messages`,
            {
                messaging_product: 'whatsapp',
                to: numeroTelefono,
                type: 'template',
                template: {
                    name: 'hello_world',
                    language: { code: 'es' }
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${whatsappToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        res.status(200).send('Turno creado y mensaje enviado.');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al enviar el mensaje.');
    }
});

module.exports = router;