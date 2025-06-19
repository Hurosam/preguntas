document.addEventListener('DOMContentLoaded', () => {
    // IMPORTANTE: Esta URL es para pruebas locales.
    // CUANDO DESPLIEGUES EN RENDER, CAMBIA ESTA LÍNEA POR LA URL DE TU BACKEND.
    const BACKEND_URL = 'http://localhost:3000'; 
    
    let todasLasPreguntas = [];

    // Referencias a los elementos del DOM
    const fileInput = document.getElementById('file-input');
    const uploadBtn = document.getElementById('upload-btn');
    const uploadStatus = document.getElementById('upload-status');
    const numQuestionsInput = document.getElementById('num-questions');
    const generateBtn = document.getElementById('generate-btn');
    const questionsList = document.getElementById('questions-list');

    async function cargarPreguntasDesdeBackend() {
        uploadStatus.textContent = 'Cargando preguntas desde el servidor...';
        uploadStatus.className = 'status-loading';
        try {
            const response = await fetch(`${BACKEND_URL}/data/preguntas.csv?t=${new Date().getTime()}`);
            if (!response.ok) throw new Error('No se pudo cargar el archivo de preguntas.');
            
            const csvText = await response.text();
            const preguntasDesdeCsv = csvText.split('\n').slice(1).map(l => l.trim().replace(/"/g, '')).filter(Boolean);

            todasLasPreguntas = preguntasDesdeCsv;
            uploadStatus.textContent = `¡Éxito! Se cargaron ${todasLasPreguntas.length} preguntas.`;
            uploadStatus.className = 'status-success';
        } catch (error) {
            uploadStatus.textContent = `Error: ${error.message}`;
            uploadStatus.className = 'status-error';
            console.error(error);
        }
    }

    async function subirNuevoCsv() {
        const file = fileInput.files[0];
        if (!file) {
            alert('Por favor, selecciona un archivo .csv para subir.');
            return;
        }

        const formData = new FormData();
        formData.append('archivoPreguntas', file);

        uploadStatus.textContent = 'Subiendo nuevo archivo...';
        uploadStatus.className = 'status-loading';

        try {
            const response = await fetch(`${BACKEND_URL}/upload`, { method: 'POST', body: formData });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || 'Error en el servidor.');

            uploadStatus.textContent = result.message;
            uploadStatus.className = 'status-success';
            await cargarPreguntasDesdeBackend();
        } catch (error) {
            uploadStatus.textContent = `Error al subir: ${error.message}`;
            uploadStatus.className = 'status-error';
            console.error(error);
        }
    }

    function generarPreguntas() {
        const cantidad = parseInt(numQuestionsInput.value, 10);
        questionsList.innerHTML = '';

        if (todasLasPreguntas.length === 0) {
            alert('No hay preguntas cargadas. Sube un archivo o recarga la página.');
            return;
        }
        if (isNaN(cantidad) || cantidad <= 0) {
            alert('Por favor, introduce un número válido de preguntas.');
            return;
        }
        if (cantidad > todasLasPreguntas.length) {
            alert(`Solo hay ${todasLasPreguntas.length} preguntas disponibles. No se pueden generar ${cantidad}.`);
            return;
        }

        const barajadas = [...todasLasPreguntas];
        for (let i = barajadas.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [barajadas[i], barajadas[j]] = [barajadas[j], barajadas[i]];
        }

        const seleccionadas = barajadas.slice(0, cantidad);
        seleccionadas.forEach(pregunta => {
            const li = document.createElement('li');
            li.textContent = pregunta;
            questionsList.appendChild(li);
        });
    }

    uploadBtn.addEventListener('click', subirNuevoCsv);
    generateBtn.addEventListener('click', generarPreguntas);

    cargarPreguntasDesdeBackend();
});