const express = require("express");
const router = express.Router();
const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot');
const QRPortalWeb = require('@bot-whatsapp/portal');
const BaileysProvider = require('@bot-whatsapp/provider/baileys');
const MongoAdapter = require('@bot-whatsapp/database/mongo');
const path = require('path');

const MONGO_DB_URI = process.env.DBURL ||
    "mongodb+srv://spatemplate28:3yHl8y63kOduKv0O@cluster0.yzp1qhd.mongodb.net/";
const MONGO_DB_NAME = 'test';

// Configura el flujo principal del chatbot
const flowPrincipal = addKeyword(['chatbot'])
    .addAnswer('🙌 Hola bienvenido a este *Chatbot*');

// Función para enviar un mensaje de WhatsApp
const sendMessage = async (number, message) => {
    try {
        await adapterProvider.sendMessage(`${number}`, message, { options: {} });
        console.log('Mensaje enviado exitosamente');
    } catch (error) {
        console.error('Error al enviar el mensaje:', error);
    }
};

// Ruta POST /whatsapp
router.post('/whatsapp', async (req, res) => {
    const { number, message } = req.body;

    if (!number || !message) {
        return res.status(400).send('Número y mensaje son requeridos');
    }

    // Enviar mensaje
    await sendMessage(number, message);

    res.send('Mensaje enviado');
});

router.get('/whatsapp/qr', (req, res) => {
    const imagePath = path.join(__dirname, '../bot.qr.png');
    res.sendFile(imagePath);
});

// Función principal para configurar el bot
const main = async () => {
    // Configura el adaptador de base de datos
    const adapterDB = new MongoAdapter({
        dbUri: MONGO_DB_URI,
        dbName: MONGO_DB_NAME,
    });

    // Configura el adaptador de flujo
    const adapterFlow = createFlow([flowPrincipal]);

    // Configura el proveedor de Baileys
    adapterProvider = createProvider(BaileysProvider);

    // Configura el bot
    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    });

    QRPortalWeb();
};

// Ejecuta la función principal
main();

module.exports = router;