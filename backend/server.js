// backend/server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs'); // File System: para leer y escribir archivos
const path = require('path');

const app = express();
// El puerto será proporcionado por Render, o usará 3000 para pruebas locales
const PORT = process.env.PORT || 3000;

// --- Middlewares ---
// Habilita CORS para que tu frontend pueda hacerle peticiones
app.use(cors()); 
// Sirve el archivo CSV como un archivo estático para que sea fácil de descargar
app.use('/data', express.static(path.join(__dirname)));

// --- Configuración de Multer para la subida de archivos ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Guarda el archivo en el directorio actual del backend
        cb(null, __dirname); 
    },
    filename: function (req, file, cb) {
        // Siempre sobrescribe el archivo con el nombre 'preguntas.csv'
        cb(null, 'preguntas.csv'); 
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Aceptar solo archivos CSV
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos .csv'), false);
        }
    } 
});

// --- Rutas de la API ---

// 1. Ruta para obtener las preguntas (GET)
//    El frontend llamará a: https://tu-backend.onrender.com/data/preguntas.csv
//    No necesitamos una ruta explícita gracias a express.static

// 2. Ruta para subir un nuevo archivo de preguntas (POST)
app.post('/upload', upload.single('archivoPreguntas'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No se subió ningún archivo.' });
    }
    
    console.log('Archivo preguntas.csv actualizado correctamente.');
    res.json({ success: true, message: '¡Archivo de preguntas actualizado con éxito!' });
});

// Ruta de bienvenida para verificar que el servidor está vivo
app.get('/', (req, res) => {
  res.send('El servidor del generador de preguntas está funcionando. ¡Hola desde Render!');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});