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

// ===== Adicionar mensagem no chat =====
function addMessage(sender, text, type) {
    const chat = document.getElementById("chat");

    const wrapper = document.createElement("div");
    wrapper.classList.add("message-wrapper", type); // "user" ou "ia"

    const avatar = document.createElement("img");
    avatar.src = getAvatar(type);
    avatar.classList.add("avatar");

    const msg = document.createElement("div");
    msg.classList.add("message", type);
    // aceita HTML (para markdown quando implementar), aqui usamos texto direto
    msg.innerHTML = `<strong>${sender}:</strong> ${escapeHtml(text)}`;

    wrapper.appendChild(avatar);
    wrapper.appendChild(msg);
    chat.appendChild(wrapper);
    chat.scrollTop = chat.scrollHeight;
}

// simples escapador (prevenir injeção ao usar innerHTML)
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ===== Indicador de "digitando..." =====
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

// ===== Placar =====
let correctCount = 0;
let scorePoints = 0;
let lastChecked = false; // evita dupla contagem na mesma questão

function updateScoreboard() {
    const c = document.getElementById("correctCount");
    const s = document.getElementById("scorePoints");
    if (c) c.textContent = correctCount;
    if (s) s.textContent = scorePoints;
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

    if (!q || !questionEl) return;

    questionEl.textContent = q.question;
    result.textContent = "";
    selectedOption = null;
    lastChecked = false;

    // habilita/desabilita botões: verificar ativo, próxima desativada até checar
    if (checkBtn) {
        checkBtn.disabled = false;
        checkBtn.textContent = "Verificar";
    }
    if (nextBtn) nextBtn.disabled = true;

    // limpar opções e input
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

    // atualiza placar visual
    updateScoreboard();
}

// ===== Selecionar opção =====
function selectOption(option, event) {
    selectedOption = option;

    // remove seleção antiga
    document.querySelectorAll("#exerciseOptions button").forEach(btn => {
        btn.classList.remove("selected");
        btn.style.background = "#eee";
    });

    // marca novo
    const btn = event.currentTarget || event.target;
    btn.classList.add("selected");
    btn.style.background = "#90ee90";
}

// ===== Verificar resposta =====
function checkExercise() {
    const q = exercises[currentExercise];
    const result = document.getElementById("exerciseResult");
    const checkBtn = document.getElementById("checkBtn");
    const nextBtn = document.getElementById("nextBtn");

    if (!q) return;

    // evita conferir duas vezes
    if (lastChecked) {
        return;
    }

    if (q.type === "translate") {
        const answerInput = document.getElementById("exerciseInput");
        const answer = answerInput ? answerInput.value.trim().toLowerCase() : "";

        if (!answer) {
            result.textContent = "⚠️ Digite sua resposta antes de verificar.";
            result.style.color = "orange";
            return;
        }

        if (answer === q.answer.toLowerCase()) {
            result.textContent = "✅ Correto!";
            result.style.color = "green";

            // atualizar placar
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

            // atualizar placar
            correctCount++;
            scorePoints += 10;
        } else {
            result.textContent = `❌ Errado! Resposta certa: ${q.answer}`;
            result.style.color = "red";
        }

        // reset visual das opções (mantemos resultado visível)
        document.querySelectorAll("#exerciseOptions button").forEach(btn => {
            btn.disabled = true;
        });
    }

    // bloquear verificar e habilitar próxima questão
    if (checkBtn) checkBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = false;
    lastChecked = true;

    // atualizar placar visual
    updateScoreboard();
}

// ===== Próxima questão =====
function nextExercise() {
    // avançar índice
    currentExercise = (currentExercise + 1) % exercises.length;

    // reabilitar botões e mostrar exercício
    showExercise();
}
function startGame(gameType) {
    const gameArea = document.getElementById("gameArea");
    gameArea.innerHTML = ""; // limpa antes

    if (gameType === "forca") {
        gameArea.innerHTML = "<h3>🪢 Jogo da Forca</h3><p>Em breve...</p>";
        // Aqui depois você coloca a lógica da forca
    } else if (gameType === "quiz") {
        gameArea.innerHTML = "<h3>❓ Quiz</h3><p>Em breve...</p>";
        // Aqui depois você coloca perguntas/respostas
    } else if (gameType === "completar") {
        gameArea.innerHTML = "<h3>✍️ Completar Frases</h3><p>Em breve...</p>";
        // Aqui depois você coloca frases com lacunas
    }
}
function goToSection(sectionId) {
    // Esconde todas as seções
    document.querySelectorAll(".section").forEach(sec => sec.classList.add("hidden"));

    // Mostra apenas a escolhida
    const target = document.getElementById(sectionId);
    if (target) {
        target.classList.remove("hidden");
        // Faz rolagem suave até a seção
        target.scrollIntoView({ behavior: "smooth" });
    }
}

// ===== Inicializar mostrando chat =====
showSection('chat');
