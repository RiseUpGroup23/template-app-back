var express = require('express');
var router = express.Router();
const cloudinary = require('cloudinary').v2;
const { CloudinaryModel } = require("../models/cloudinary/cloudinaryModel")
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/cloudinary/config', async (req, res) => {
    try {
        let existingConfig = await CloudinaryModel.findOne({})

        if (!existingConfig) {
            const newDoc = new CloudinaryModel({});
            await newDoc.save();
            existingConfig = newDoc
        }
        await CloudinaryModel.updateOne({}, { $set: req.body });
        res.send("Configuration of images API updated successfully");

    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error: POST of image configuration");
    }
})

router.post('/cloudinary', upload.single('photo'), async (req, res) => {
    try {
        const cloudinaryData = await CloudinaryModel.findOne({})
        const { cloud, appKey, appToken } = cloudinaryData
        cloudinary.config({
            cloud_name: cloud,
            api_key: appKey,
            api_secret: appToken,
        });

        if (!req.file) {
            return res.status(400).json({ error: 'No se proporcionó ninguna imagen.' });
        }

        const result = await new Promise((resolve, reject) => {
            const upload_stream = cloudinary.uploader.upload_stream(
                { resource_type: 'image' },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );

            // Enviar el búfer al stream de carga de Cloudinary
            upload_stream.end(req.file.buffer);
        });

        res.json({ url: result.secure_url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;