// Módulos necessários
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

// Inicialização do servidor
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Estrutura para armazenar os arquivos e suas réplicas
let storage = {};

// Manipula eventos de conexão de socket
io.on("connection", (socket) => {
  // Manipula evento de depósito
  socket.on("deposit", ({ fileName, tolerance }) => {
    // Verifica se o arquivo já existe
    if (storage[fileName]) {
      // Atualiza o número de réplicas
      storage[fileName].tolerance = tolerance;
    } else {
      // Cria uma nova entrada no armazenamento
      storage[fileName] = {
        replicas: [],
        tolerance: tolerance,
      };
    }

    socket.emit("depositResult", {
      message: "Depósito realizado com sucesso.",
    });
  });

  // Manipula evento de recuperação
  socket.on("retrieve", ({ fileName }) => {
    // Verifica se o arquivo existe
    if (storage[fileName]) {
      // Verifica se há réplicas suficientes para atender à tolerância
      if (storage[fileName].replicas.length < storage[fileName].tolerance) {
        socket.emit("retrieveResult", {
          error: "Não há réplicas suficientes para recuperar o arquivo.",
        });
      } else {
        // Retorna uma das réplicas aleatoriamente
        const replicaIndex = Math.floor(
          Math.random() * storage[fileName].replicas.length
        );
        const replica = storage[fileName].replicas[replicaIndex];
        socket.emit("retrieveResult", { replica });
      }
    } else {
      socket.emit("retrieveResult", {
        error: "O arquivo solicitado não foi encontrado.",
      });
    }
  });
});

// Inicia o servidor na porta 4000
server.listen(4000, () => {
  console.log("Servidor iniciado na porta 4000.");
});
