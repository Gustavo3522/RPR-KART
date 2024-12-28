const ADMIN_PASSWORD = "kartadmin123"; // Senha do administrador
const VIEWER_PASSWORD = "tabela"; // Senha apenas para visualização
const pilots = JSON.parse(localStorage.getItem("kartPilots")) || [];
let isAdmin = false; // Define se o usuário tem permissão de administrador



const connection = mysql.createConnection({
    host: '127.0.0.1:3306', // Endereço do servidor MySQL
    user: 'u878056332_admin', // Usuário do banco de dados
    password: 'bancoRoda123!', // Senha do banco de dados
    database: 'u878056332_usuarios' // Nome do banco de dados
  });


// Estabelecendo a conexão
connection.connect((err) => {
    if (err) {
      console.error('Erro ao conectar ao MySQL:', err.message);
      return;
    }
    console.log('Conexão bem-sucedida ao MySQL!');
  });

connection.query('SELECT * FROM `listaCampeonato`', (err, results) => {
    if (err) {
      console.error('Erro na consulta:', err.message);
      return;
    }
    console.log('Resultados da consulta:', results);
  });

// Função de Login
function login() {
    const password = document.getElementById("password").value;
    if (password === ADMIN_PASSWORD) {
        isAdmin = true; // Permissão de administrador
        alert("Login como administrador bem-sucedido!");
        showContent();
    } else if (password === VIEWER_PASSWORD) {
        isAdmin = false; // Apenas visualização
        alert("Login como visualizador bem-sucedido!");
        showContent();
    } else {
        alert("Senha incorreta!");
    }
}


// Mostra o conteúdo baseado no tipo de usuário
function showContent() {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("content").style.display = "block";
    document.getElementById("addPilot").style.display = isAdmin ? "block" : "none";
    updateTable();
}


// Atualiza a tabela com base no tipo de usuário
function updateTable() {
    const tableBody = document.getElementById("tableBody");
    tableBody.innerHTML = "";
    pilots.sort((a, b) => b.points - a.points);
    pilots.forEach((pilot, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${pilot.name}</td>
            <td contenteditable="${isAdmin}" onblur="updatePoints(${index}, this.innerText)">${pilot.points}</td>
            <td contenteditable="${isAdmin}" onblur="updateBestLap(${index}, this.innerText)">${pilot.bestLap || "-"}</td>
            ${
                isAdmin
                    ? `<td><button onclick="removePilot(${index})">Remover</button></td>`
                    : `<td>-</td>`
            }
        `;
        tableBody.appendChild(row);
    });
}


// Atualiza os pontos de um piloto
function updatePoints(index, value) {
    const newPoints = parseInt(value);
    if (!isNaN(newPoints) && newPoints >= 0) {
        pilots[index].points = newPoints;
        savePilots();
        updateTable();
    } else {
        alert("Por favor, insira um valor válido para os pontos.");
    }
}


// Atualiza o melhor tempo de um piloto
function updateBestLap(index, value) {
    const newBestLap = value.trim();
    // Valida se o tempo está no formato correto MM:SS.mmm
    const lapPattern = /^([0-5]?[0-9]):([0-5]?[0-9])\.(\d{3})$/;
    if (lapPattern.test(newBestLap) || newBestLap === "") {
        pilots[index].bestLap = newBestLap === "" ? null : newBestLap;
        savePilots();
        updateTable();
    } else {
        alert("Por favor, insira um tempo válido no formato MM:SS.mmm.");
    }
}


// Adiciona um novo piloto (somente para administrador)
function addPilot() {
    if (!isAdmin) return;
    const name = prompt("Nome do piloto:");
    if (!name) return;
    pilots.push({ name, points: 0, bestLap: null });
    savePilots();
    updateTable();
}


// Remove um piloto (somente para administrador)
function removePilot(index) {
    if (!isAdmin) return;
    if (confirm(`Tem certeza de que deseja remover o piloto "${pilots[index].name}"?`)) {
        pilots.splice(index, 1);
        savePilots();
        updateTable();
    }
}


// Salva os pilotos no localStorage
//function savePilots() {
//    localStorage.setItem("kartPilots", JSON.stringify(pilots));
//}

// Função para inserir dados na tabela listaCampeonato
function savePilots(nome, pontos, melhorVolta, faltas) {
    const query = `INSERT INTO listaCampeonato (Nome, Pontos, MelhorVoltar, Faltas) VALUES (?, ?, ?, ?)`;
    
    // Executa a query
    connection.query(query, [nome, pontos, melhorVolta, faltas], (err, results) => {
      if (err) {
        console.error('Erro ao inserir dados:', err.message);
        return;
      }
      console.log('Dados inseridos com sucesso! ID:', results.insertId);
    });
  }


// Inicia a aplicação
window.onload = function () {
    document.getElementById("loginForm").style.display = "flex";
    document.getElementById("content").style.display = "none";
};

connection.end();
