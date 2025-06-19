// frontend/script.js
document.addEventListener('DOMContentLoaded', () => {
    // IMPORTANTE: Esta URL la obtendrás después de desplegar tu backend en Render.
    // Por ahora, para pruebas locales, usa la dirección de tu servidor local.
    const BACKEND_URL = 'http://localhost:3000'; 
    // CUANDO DESPLIEGUES, LA CAMBIARÁS POR ALGO COMO: 'https://tu-backend-xyz.onrender.com'
    
    let todasLasPreguntas = [];

    // Referencias a los elementos del DOM
    const fileInput = document.getElementById('file-input');
    const uploadBtn = document.getElementById('upload-btn');
    const uploadStatus = document.getElementById('upload-status');
    const numQuestionsInput = document.getElementById('num-questions');
    const generateBtn = document.getElementById('generate-btn');
    const questionsList = document.getElementById('questions-list');

    // --- FUNCIÓN 1: CARGAR PREGUNTAS DESDE EL BACKEND ---
    async function cargarPreguntasDesdeBackend() {
        uploadStatus.textContent = 'Cargando preguntas desde el servidor...';
        uploadStatus.className = 'status-loading';
        try {
            // Pide el archivo CSV al backend
            const response = await fetch(`${BACKEND_URL}/data/preguntas.csv`);
            if (!response.ok) {
                throw new Error('No se pudo cargar el archivo de preguntas desde el servidor.');
            }
            const csvText = await response.text();
            const preguntasDesdeCsv = csvText
                .split('\n').slice(1).map(l => l.trim()).filter(Boolean);

            todasLasPreguntas = preguntasDesdeCsv;
            uploadStatus.textContent = `¡Éxito! Se cargaron ${todasLasPreguntas.length} preguntas.`;
            uploadStatus.className = 'status-success';
        } catch (error) {
            uploadStatus.textContent = `Error: ${error.message}`;
            uploadStatus.className = 'status-error';
            console.error(error);
        }
    }

    // --- FUNCIÓN 2: SUBIR NUEVO ARCHIVO DE PREGUNTAS ---
    async function subirNuevoCsv() {
        const file = fileInput.files[0];
        if (!file) {
            alert('Por favor, selecciona un archivo .csv para subir.');
            return;
        }

        const formData = new FormData();
        formData.append('archivoPreguntas', file); // 'archivoPreguntas' debe coincidir con upload.single() en el backend

        uploadStatus.textContent = 'Subiendo nuevo archivo...';
        uploadStatus.className = 'status-loading';

        try {
            const response = await fetch(`${BACKEND_URL}/upload`, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Error en el servidor al subir el archivo.');
            }

            uploadStatus.textContent = result.message;
            uploadStatus.className = 'status-success';

            // Una vez subido, volvemos a cargar la lista de preguntas actualizada
            await cargarPreguntasDesdeBackend();

        } catch (error) {
            uploadStatus.textContent = `Error al subir: ${error.message}`;
            uploadStatus.className = 'status-error';
            console.error(error);
        }
    }

    // Función para generar preguntas (esta no cambia mucho)
    function generarPreguntas() {
        // ... (la lógica de esta función es exactamente la misma que antes)
        // ... (cópiala y pégala de tu versión anterior)
    }

    // --- ASIGNAR EVENTOS ---
    uploadBtn.addEventListener('click', subirNuevoCsv);
    generateBtn.addEventListener('click', generarPreguntas);

    // --- INICIO: Cargar las preguntas al cargar la página ---
    cargarPreguntasDesdeBackend();
});