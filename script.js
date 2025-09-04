// ===== Função para retornar avatar =====
function getAvatar(type) {
    if (type === "user") return "https://i.pravatar.cc/35?img=12";
    return "https://i.pravatar.cc/35?img=5";
}

// ===== Enviar mensagem para IA =====
async function sendMessage() {
    const input = document.getElementById("userInput");
    const message = input.value.trim();
    if (!message) return;

    addMessage("Você", message, "user");
    input.value = "";

    const typingIndicator = addTyping();

    try {
        const response = await fetch("http://127.0.0.1:8000/api/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message }),
        });

        const data = await response.json();
        typingIndicator.remove();

        if (data.reply) addMessage("IA", data.reply, "ia");
        else if (data.error) addMessage("IA", "⚠️ Erro: " + data.error, "ia");
        else addMessage("IA", "⚠️ Resposta inesperada do servidor.", "ia");
    } catch (err) {
        console.error(err);
        typingIndicator.remove();
        addMessage("IA", "⚠️ Não consegui me conectar ao servidor.", "ia");
    }
}

function addMessage(sender, text, type) {
    const chat = document.getElementById("chat");

    const wrapper = document.createElement("div");
    wrapper.classList.add("message-wrapper", type); // "user" ou "ia"

    const avatar = document.createElement("img");
    avatar.src = getAvatar(type);
    avatar.classList.add("avatar");

    const msg = document.createElement("div");
    msg.classList.add("message", type);
    msg.innerHTML = `<strong>${sender}:</strong> ${text}`;

    wrapper.appendChild(avatar);
    wrapper.appendChild(msg);
    chat.appendChild(wrapper);
    chat.scrollTop = chat.scrollHeight;
}

function addTyping() {
    const chat = document.getElementById("chat");
    const wrapper = document.createElement("div");
    wrapper.classList.add("message-wrapper", "ia");

    const avatar = document.createElement("img");
    avatar.src = getAvatar("ia");
    avatar.classList.add("avatar");

    const typing = document.createElement("div");
    typing.classList.add("typing");
    typing.innerHTML = `<div class="dot"></div><div class="dot"></div><div class="dot"></div>`;

    wrapper.appendChild(avatar);
    wrapper.appendChild(typing);
    chat.appendChild(wrapper);
    chat.scrollTop = chat.scrollHeight;

    return wrapper;
}

// ===== Navegação lateral =====
function showSection(section) {
    // Oculta todas as seções
    document.querySelectorAll(".section").forEach(s => s.classList.add("hidden"));

    // Mostra apenas a seção desejada
    const sec = document.getElementById(section + "-section");
    if (sec) sec.classList.remove("hidden");

    // Inicializa exercícios se for a seção de exercícios
    if (section === "exercise") showExercise();
}

// ===== Banco de Exercícios =====
const exercises = [
    { type: "translate", question: "Traduza: Good morning", answer: "bom dia" },
    { type: "translate", question: "Traduza: Thank you", answer: "obrigado" },
    { type: "multiple", question: "Qual a tradução de 'Apple'?", options: ["Maçã", "Banana", "Cadeira"], answer: "Maçã" },
    { type: "multiple", question: "Qual a tradução de 'Dog'?", options: ["Cachorro", "Gato", "Peixe"], answer: "Cachorro" },
    { type: "translate", question: "Traduza: I am happy", answer: "eu estou feliz" },
    { type: "multiple", question: "Qual a tradução de 'Chair'?", options: ["Cadeira", "Mesa", "Janela"], answer: "Cadeira" }
];

let currentExercise = 0;
let selectedOption = null;

// ===== Mostrar exercício =====
function showExercise() {
    const q = exercises[currentExercise];
    const questionEl = document.getElementById("exerciseQuestion");
    const input = document.getElementById("exerciseInput");
    const optionsBox = document.getElementById("exerciseOptions");
    const result = document.getElementById("exerciseResult");

    questionEl.textContent = q.question;
    result.textContent = "";
    selectedOption = null;

    if (q.type === "translate") {
        input.style.display = "block";
        input.value = "";
        optionsBox.style.display = "none";
        optionsBox.innerHTML = "";
    } else {
        input.style.display = "none";
        optionsBox.style.display = "flex";
        optionsBox.innerHTML = "";
        q.options.forEach(opt => {
            const btn = document.createElement("button");
            btn.textContent = opt;
            btn.classList.add("option-btn");
            btn.onclick = (event) => selectOption(opt, event);
            optionsBox.appendChild(btn);
        });
    }
}

// ===== Selecionar opção =====
function selectOption(option, event) {
    selectedOption = option;
    document.querySelectorAll("#exerciseOptions button").forEach(btn => btn.style.background = "#eee");
    event.target.style.background = "#90ee90";
}

// ===== Verificar resposta =====
function checkExercise() {
    const q = exercises[currentExercise];
    const result = document.getElementById("exerciseResult");

    if (q.type === "translate") {
        const answer = document.getElementById("exerciseInput").value.trim().toLowerCase();
        if (answer === q.answer.toLowerCase()) {
            result.textContent = "✅ Correto!";
            result.style.color = "green";
        } else {
            result.textContent = `❌ Errado! Resposta certa: ${q.answer}`;
            result.style.color = "red";
        }
    } else {
        if (!selectedOption) {
            result.textContent = "⚠️ Escolha uma opção!";
            result.style.color = "orange";
            return;
        }
        if (selectedOption === q.answer) {
            result.textContent = "✅ Correto!";
            result.style.color = "green";
        } else {
            result.textContent = `❌ Errado! Resposta certa: ${q.answer}`;
            result.style.color = "red";
        }
        selectedOption = null;
    }
}

// ===== Próxima questão =====
function nextExercise() {
    currentExercise = (currentExercise + 1) % exercises.length;
    showExercise();
}

// ===== Inicializar mostrando chat =====
showSection('chat');