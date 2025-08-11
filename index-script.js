const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadPrompt = document.getElementById('uploadPrompt');
const loadingFile = document.getElementById('loadingFile');
const loadingFileName = document.getElementById('loadingFileName');
const uploadAlertPlaceholder = document.getElementById('uploadAlertPlaceholder');
const customConfirmModal = document.getElementById('customConfirm');
const confirmMessage = document.getElementById('confirmMessage');
const confirmYesBtn = document.getElementById('confirmYes');
const confirmNoBtn = document.getElementById('confirmNo');
const generatedActions = document.getElementById('generatedActions');

const STORAGE_KEY = 'generadorPreguntas_db';
let questions = loadQuestions();
let confirmCallback = null;
let lastGeneratedQuestions = [];

function saveQuestions() { localStorage.setItem(STORAGE_KEY, JSON.stringify(questions)); }
function loadQuestions() {
    const savedQuestions = localStorage.getItem(STORAGE_KEY);
    return savedQuestions ? JSON.parse(savedQuestions) : [];
}

function updateQuestionCount() {
    const total = questions.length;
    document.getElementById('totalQuestions').textContent = total;
    const questionCountInput = document.getElementById('questionCount');
    if (questionCountInput) {
        questionCountInput.max = total > 0 ? total : 1;
        if (parseInt(questionCountInput.value) > total || total === 0) {
            questionCountInput.value = total > 0 ? total : 1;
        }
    }
}

function addQuestion() {
    const newQuestionInput = document.getElementById('newQuestion');
    const question = newQuestionInput.value.trim();
    if (!question) { alert('Por favor, ingresa una pregunta válida.'); return; }
    if (questions.includes(question)) { alert('Esta pregunta ya existe en la base de datos.'); return; }
    questions.push(question);
    newQuestionInput.value = '';
    updateQuestionCount();
    saveQuestions();
    showAlert('Pregunta agregada exitosamente.', 'success');
}

function clearAllQuestions() {
    showCustomConfirm('¿Estás seguro de que quieres eliminar todas las preguntas?', () => {
        questions = [];
        lastGeneratedQuestions = [];
        updateQuestionCount();
        document.getElementById('generatedQuestions').innerHTML = `<div style="text-align: center; color: #888; padding: 40px;">No hay preguntas generadas aún.</div>`;
        generatedActions.style.display = 'none';
        saveQuestions();
        showAlert('Todas las preguntas han sido eliminadas.', 'warning');
    });
}

function generateQuestions() {
    const count = parseInt(document.getElementById('questionCount').value);
    if (questions.length === 0) { alert('No hay preguntas en la base de datos. ¡Agrega algunas primero!'); return; }
    if (isNaN(count) || count <= 0 || count > questions.length) { alert(`Por favor, ingresa un número entre 1 y ${questions.length}.`); return; }
    const shuffledQuestions = [...questions].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffledQuestions.slice(0, count);
    lastGeneratedQuestions = selectedQuestions;
    displayQuestions(selectedQuestions);
}

function displayQuestions(questionList) {
    const container = document.getElementById('generatedQuestions');
    if (questionList.length === 0) {
        container.innerHTML = `<div style="text-align: center; color: #888; padding: 40px;">No hay preguntas generadas aún.</div>`;
        generatedActions.style.display = 'none';
    } else {
        container.innerHTML = questionList.map((question, index) => `<div class="question-item"><span class="question-number">${index + 1}</span><span class="question-text">${question}</span></div>`).join('');
        generatedActions.style.display = 'block';
    }
}

function exportToCsv(data, fileName) {
    if (data.length === 0) { alert('No hay preguntas para exportar.'); return; }
    let csvContent = "pregunta\n";
    data.forEach(question => { csvContent += `"${question.replace(/"/g, '""')}"\n`; });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden'; document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function exportToExcel(data, fileName) {
    if (data.length === 0) { alert('No hay preguntas para exportar.'); return; }
    const dataForSheet = [["pregunta"], ...data.map(q => [q])];
    const worksheet = XLSX.utils.aoa_to_sheet(dataForSheet);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Preguntas");
    XLSX.writeFile(workbook, fileName);
}

function exportAllToCsv() { exportToCsv(questions, 'banco_completo.csv'); }
function exportAllToExcel() { exportToExcel(questions, 'banco_completo.xlsx'); }
function exportGeneratedToCsv() { exportToCsv(lastGeneratedQuestions, 'preguntas_generadas.csv'); }
function exportGeneratedToExcel() { exportToExcel(lastGeneratedQuestions, 'preguntas_generadas.xlsx'); }

function handleFileUpload(file) {
    uploadPrompt.style.display = 'none';
    loadingFileName.textContent = `Procesando: ${file.name}`;
    loadingFile.style.display = 'block';
    uploadAlertPlaceholder.innerHTML = '';
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.csv')) { processCsvFile(file); } 
    else if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) { processExcelFile(file); } 
    else { alert('Formato de archivo no soportado.'); resetUploadArea(); }
}

function processCsvFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const rows = e.target.result.split('\n').slice(1);
        const newQuestions = rows.map(row => row.trim().replace(/^"|"$/g, '')).filter(Boolean);
        addQuestionsFromArray(newQuestions); resetUploadArea();
    };
    reader.readAsText(file);
}

function processExcelFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
            const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });
            const newQuestions = jsonData.slice(1).map(row => row && row[0] ? String(row[0]).trim() : null).filter(Boolean);
            addQuestionsFromArray(newQuestions);
        } catch (error) { console.error('Error:', error); alert('Error al procesar el archivo Excel.'); } 
        finally { resetUploadArea(); }
    };
    reader.readAsArrayBuffer(file);
}

function addQuestionsFromArray(newQuestionsArray) {
    const addedQuestions = [];
    newQuestionsArray.forEach(q => { if (!questions.includes(q)) { questions.push(q); addedQuestions.push(q); } });
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert';
    if (addedQuestions.length > 0) {
        updateQuestionCount(); saveQuestions(); 
        alertDiv.classList.add('alert-success');
        alertDiv.textContent = `Se agregaron ${addedQuestions.length} nuevas preguntas.`;
    } else { 
        alertDiv.classList.add('alert-warning');
        alertDiv.textContent = 'No se encontraron preguntas nuevas en el archivo o ya existían todas.';
    }
    uploadAlertPlaceholder.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 5000);
}

function resetUploadArea() { fileInput.value = ''; loadingFile.style.display = 'none'; uploadPrompt.style.display = 'block'; }
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`; alertDiv.textContent = message;
    document.querySelector('.container').insertBefore(alertDiv, document.querySelector('.container').firstChild.nextSibling);
    setTimeout(() => alertDiv.remove(), 5000);
}

function showCustomConfirm(message, callback) {
    confirmMessage.textContent = message;
    confirmCallback = callback;
    customConfirmModal.style.display = 'flex';
}

confirmYesBtn.addEventListener('click', () => { if (confirmCallback) { confirmCallback(); } customConfirmModal.style.display = 'none'; });
confirmNoBtn.addEventListener('click', () => { customConfirmModal.style.display = 'none'; });
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => { uploadArea.addEventListener(eventName, (e) => { e.preventDefault(); e.stopPropagation(); }, false); });
uploadArea.addEventListener('dragover', () => uploadArea.classList.add('drag-over'));
uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
uploadArea.addEventListener('drop', (e) => { uploadArea.classList.remove('drag-over'); if (e.dataTransfer.files[0]) handleFileUpload(e.dataTransfer.files[0]); });
uploadArea.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => { if (e.target.files[0]) handleFileUpload(e.target.files[0]); });
document.getElementById('newQuestion').addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addQuestion(); } });
updateQuestionCount();