var express = require('express');
var router = express.Router();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/cloudinary', upload.single('photo'), async (req, res) => {
    try {
        cloudinary.config({  // esto en un futuro a variables de entorno
            cloud_name: "dwqcfuief",
            api_key: "381134874894872",
            api_secret: "XfgRi_QxAhGa01VnckWH7AAx9rE",
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