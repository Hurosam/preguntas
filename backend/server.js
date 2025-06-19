const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para permitir la comunicación entre frontend y backend
app.use(cors());

// Middleware para servir el archivo CSV actual de forma pública
// Cualquier petición a /data/preguntas.csv devolverá el archivo
app.use('/data', express.static(__dirname));

// Configuración de Multer para gestionar la subida de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // El archivo se guardará en el mismo directorio del backend
        cb(null, __dirname); 
    },
    filename: function (req, file, cb) {
        // Siempre se llamará 'preguntas.csv', sobrescribiendo el anterior
        cb(null, 'preguntas.csv'); 
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Filtro para aceptar únicamente archivos con extensión .csv
        if (path.extname(file.originalname).toLowerCase() === '.csv') {
            cb(null, true);
        } else {
            cb(new Error('Error: Solo se permiten archivos con extensión .csv'), false);
        }
    } 
});

// Ruta para subir y actualizar el archivo de preguntas
app.post('/upload', upload.single('archivoPreguntas'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No se ha subido ningún archivo.' });
    }
    
    console.log('El archivo preguntas.csv ha sido actualizado.');
    res.json({ success: true, message: '¡Archivo de preguntas actualizado con éxito!' });
});

// Ruta de bienvenida para verificar que el servidor está funcionando
app.get('/', (req, res) => {
  res.send('El servidor del generador de preguntas está funcionando. ¡Hola desde Render!');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});