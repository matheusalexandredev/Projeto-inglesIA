function register(event) {
  event.preventDefault();

  const name = document.getElementById("registerName").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  // Recupera usuários existentes
  const users = JSON.parse(localStorage.getItem("users")) || [];

  // Verifica se já existe
  if (users.find(u => u.email === email)) {
    alert("Esse email já está cadastrado!");
    return;
  }

  users.push({ name, email, password });
  localStorage.setItem("users", JSON.stringify(users));

  alert("Cadastro realizado com sucesso!");
  window.location.href = "index.html"; // Redireciona pro login
}

function login(event) {
  event.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const users = JSON.parse(localStorage.getItem("users")) || [];

  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    localStorage.setItem("loggedUser", JSON.stringify(user));
    alert("Login realizado!");
    window.location.href = "app.html"; // vai pro seu app principal
  } else {
    alert("Email ou senha inválidos!");
  }
}
