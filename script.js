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
        typingIndicator.remove();
        addMessage("IA", "⚠️ Não consegui me conectar ao servidor.", "ia");
    }
}

// ===== Adicionar mensagem no chat =====
function addMessage(sender, text, type) {
    const chat = document.getElementById("chat");

    const wrapper = document.createElement("div");
    wrapper.classList.add("message-wrapper", type);

    const avatar = document.createElement("img");
    avatar.src = getAvatar(type);
    avatar.classList.add("avatar");

    const msg = document.createElement("div");
    msg.classList.add("message", type);
    msg.innerHTML = `<strong>${sender}:</strong> ${escapeHtml(text)}`;

    wrapper.appendChild(avatar);
    wrapper.appendChild(msg);
    chat.appendChild(wrapper);
    chat.scrollTop = chat.scrollHeight;
}

// ===== Escapar HTML =====
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ===== Indicador "digitando..." =====
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
    // esconde todas as seções
    document.querySelectorAll(".section").forEach(s => s.classList.add("hidden"));

    // mostra só a seção clicada
    const sec = document.getElementById(section);
    if (sec) sec.classList.remove("hidden");

    // se for exercícios, carregar questão
    if (section === "exercise-section") showExercise();
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
let correctCount = 0;
let scorePoints = 0;
let lastChecked = false;

// ===== Placar =====
function updateScoreboard() {
    document.getElementById("correctCount").textContent = correctCount;
    document.getElementById("scorePoints").textContent = scorePoints;
}

// ===== Mostrar exercício =====
function showExercise() {
    const q = exercises[currentExercise];
    const questionEl = document.getElementById("exerciseQuestion");
    const input = document.getElementById("exerciseInput");
    const optionsBox = document.getElementById("exerciseOptions");
    const result = document.getElementById("exerciseResult");
    const checkBtn = document.getElementById("checkBtn");
    const nextBtn = document.getElementById("nextBtn");

    if (!q) return;

    questionEl.textContent = q.question;
    result.textContent = "";
    selectedOption = null;
    lastChecked = false;

    checkBtn.disabled = false;
    nextBtn.disabled = true;

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
    updateScoreboard();
}

// ===== Selecionar opção =====
function selectOption(option, event) {
    selectedOption = option;
    document.querySelectorAll("#exerciseOptions button").forEach(btn => {
        btn.classList.remove("selected");
        btn.style.background = "#eee";
    });
    event.currentTarget.style.background = "#90ee90";
}

// ===== Verificar resposta =====
function checkExercise() {
    const q = exercises[currentExercise];
    const result = document.getElementById("exerciseResult");
    const checkBtn = document.getElementById("checkBtn");
    const nextBtn = document.getElementById("nextBtn");

    if (!q || lastChecked) return;

    if (q.type === "translate") {
        const answer = document.getElementById("exerciseInput").value.trim().toLowerCase();
        if (!answer) {
            result.textContent = "⚠️ Digite sua resposta antes de verificar.";
            result.style.color = "orange";
            return;
        }
        if (answer === q.answer.toLowerCase()) {
            result.textContent = "✅ Correto!";
            result.style.color = "green";
            correctCount++;
            scorePoints += 10;
        } else {
            result.textContent = `❌ Errado! Resposta certa: ${q.answer}`;
            result.style.color = "red";
        }
    } else if (q.type === "multiple") {
        if (!selectedOption) {
            result.textContent = "⚠️ Escolha uma opção!";
            result.style.color = "orange";
            return;
        }
        if (selectedOption.toLowerCase() === q.answer.toLowerCase()) {
            result.textContent = "✅ Correto!";
            result.style.color = "green";
            correctCount++;
            scorePoints += 10;
        } else {
            result.textContent = `❌ Errado! Resposta certa: ${q.answer}`;
            result.style.color = "red";
        }
        document.querySelectorAll("#exerciseOptions button").forEach(btn => btn.disabled = true);
    }

    checkBtn.disabled = true;
    nextBtn.disabled = false;
    lastChecked = true;
    updateScoreboard();
}

// ===== Próxima questão =====
function nextExercise() {
    currentExercise = (currentExercise + 1) % exercises.length;
    showExercise();
}

// ===== Inicialização =====
showSection('home-section');
