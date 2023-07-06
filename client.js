// Módulo necessário
const socketIOClient = require("socket.io-client");

// Cria o socket do cliente
const socket = socketIOClient("http://localhost:3000");

// Função para realizar o depósito de um arquivo
function depositFile(fileName, tolerance) {
  socket.emit("deposit", { fileName, tolerance });
}

// Função para recuperar um arquivo
function retrieveFile(fileName) {
  socket.emit("retrieve", { fileName });
}

// Manipula evento de resultado do depósito
socket.on("depositResult", ({ message }) => {
  console.log("Depósito realizado com sucesso:", message);
});

// Manipula evento de resultado da recuperação
socket.on("retrieveResult", ({ replica, error }) => {
  if (error) {
    console.error("Erro ao recuperar o arquivo:", error);
  } else {
    console.log("Réplica recuperada:", replica);
  }
});

// Exemplo de uso
depositFile("meu_arquivo.txt", 3); // Deposita o arquivo com tolerância de 3 réplicas
retrieveFile("meu_arquivo.txt"); // Recupera uma réplica do arquivo
