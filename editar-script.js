const questionsListContainer = document.getElementById('questions-list');
const customConfirmModal = document.getElementById('customConfirm');
const confirmMessage = document.getElementById('confirmMessage');
const confirmYesBtn = document.getElementById('confirmYes');
const confirmNoBtn = document.getElementById('confirmNo');

const STORAGE_KEY = 'generadorPreguntas_db';
let questions = [];
let confirmCallback = null;

function saveQuestions() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
}

function renderQuestions() {
    questionsListContainer.innerHTML = '';
    if (questions.length === 0) {
        questionsListContainer.innerHTML = '<p style="text-align:center; color:#888;">No hay preguntas para editar. Vuelve y agrega algunas.</p>';
        return;
    }
    questions.forEach((question, index) => {
        const listItem = document.createElement('div');
        listItem.className = 'list-item';
        
        const questionText = document.createElement('span');
        questionText.className = 'question-text';
        questionText.textContent = question;

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'actions';

        const editButton = document.createElement('button');
        editButton.className = 'btn-edit';
        editButton.textContent = 'Editar';
        editButton.addEventListener('click', () => editQuestion(index));

        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn-danger';
        deleteButton.textContent = 'Eliminar';
        deleteButton.addEventListener('click', () => deleteQuestion(index));

        actionsDiv.appendChild(editButton);
        actionsDiv.appendChild(deleteButton);
        listItem.appendChild(questionText);
        listItem.appendChild(actionsDiv);
        
        questionsListContainer.appendChild(listItem);
    });
}

function editQuestion(index) {
    const currentQuestion = questions[index];
    const newQuestion = prompt('Edita la pregunta:', currentQuestion);
    if (newQuestion && newQuestion.trim() !== '' && newQuestion !== currentQuestion) {
        questions[index] = newQuestion.trim();
        saveQuestions();
        renderQuestions();
    }
}

function deleteQuestion(index) {
    showCustomConfirm('¿Estás seguro de que quieres eliminar esta pregunta?', () => {
        questions.splice(index, 1);
        saveQuestions();
        renderQuestions();
    });
}

function showCustomConfirm(message, callback) {
    confirmMessage.textContent = message;
    confirmCallback = callback;
    customConfirmModal.style.display = 'flex';
}

confirmYesBtn.addEventListener('click', () => {
    if (confirmCallback) { confirmCallback(); }
    customConfirmModal.style.display = 'none';
});

confirmNoBtn.addEventListener('click', () => {
    customConfirmModal.style.display = 'none';
});

// Carga inicial de la página
const savedData = localStorage.getItem(STORAGE_KEY);
questions = savedData ? JSON.parse(savedData) : [];
renderQuestions();