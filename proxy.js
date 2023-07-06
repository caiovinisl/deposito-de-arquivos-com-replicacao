// Módulos necessários
const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const socketIO = require("socket.io");

// Inicialização do proxy
const app = express();
app.use(bodyParser.json());
const server = http.createServer(app);
const io = socketIO(server);

// Array para armazenar os servidores disponíveis
let servers = [];

// Função para adicionar um novo servidor
function addServer(serverSocket) {
  servers.push(serverSocket);
}

// Função para remover um servidor
function removeServer(serverSocket) {
  servers = servers.filter((server) => server !== serverSocket);
}

// Rota para adicionar um novo servidor
app.post("/addServer", (req, res) => {
  const { serverUrl } = req.body;

  // Cria um novo socket para o servidor
  const serverSocket = io.of(serverUrl);

  // Adiciona o servidor
  addServer(serverSocket);

  res.status(200).json({ message: "Servidor adicionado com sucesso." });
});

// Rota para remover um servidor
app.post("/removeServer", (req, res) => {
  const { serverUrl } = req.body;

  // Remove o socket do servidor
  const serverSocket = servers.find((server) => server.nsp.name === serverUrl);
  if (serverSocket) {
    serverSocket.removeAllListeners();
    serverSocket.close();
    removeServer(serverSocket);
  }

  res.status(200).json({ message: "Servidor removido com sucesso." });
});

// Inicia o proxy na porta 3000
server.listen(3000, () => {
  console.log("Proxy iniciado na porta 3000.");
});

// Manipula eventos de conexão de socket
io.on("connection", (socket) => {
  // Manipula evento de depósito
  socket.on("deposit", ({ fileName, tolerance }) => {
    // Encaminha a solicitação para um dos servidores disponíveis
    if (servers.length > 0) {
      const serverIndex = Math.floor(Math.random() * servers.length);
      const serverSocket = servers[serverIndex];
      serverSocket.emit("deposit", { fileName, tolerance });
    }
  });

  // Manipula evento de recuperação
  socket.on("retrieve", ({ fileName }) => {
    // Encaminha a solicitação para um dos servidores disponíveis
    if (servers.length > 0) {
      const serverIndex = Math.floor(Math.random() * servers.length);
      const serverSocket = servers[serverIndex];
      serverSocket.emit("retrieve", { fileName });
    }
  });
});
