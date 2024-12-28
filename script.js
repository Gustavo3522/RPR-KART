const ADMIN_PASSWORD = "kartadmin123"; // Senha do administrador
const VIEWER_PASSWORD = "tabela"; // Senha apenas para visualização
let pilots = []; // Array de pilotos
let isAdmin = false; // Define se o usuário tem permissão de administrador
const dbName = 'kartChampionship'; // Nome do banco de dados
const storeName = 'pilots'; // Nome da store para guardar pilotos

// Abre ou cria o banco de dados
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);

        request.onupgradeneeded = function (e) {
            const db = e.target.result;
            const objectStore = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
            objectStore.createIndex('name', 'name', { unique: false });
            objectStore.createIndex('points', 'points', { unique: false });
            objectStore.createIndex('bestLap', 'bestLap', { unique: false });
        };

        request.onsuccess = function (e) {
            resolve(e.target.result);
        };

        request.onerror = function (e) {
            reject("Erro ao abrir banco de dados: " + e.target.errorCode);
        };
    });
}

// Função para obter os pilotos do banco de dados
function getPilots() {
    return new Promise((resolve, reject) => {
        const dbRequest = openDatabase();

        dbRequest.then(db => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = function () {
                pilots = request.result;
                resolve(pilots);
            };

            request.onerror = function (e) {
                reject("Erro ao buscar pilotos: " + e.target.errorCode);
            };
        }).catch(error => {
            reject(error);
        });
    });
}

// Função para salvar pilotos no banco de dados
function savePilots() {
    openDatabase().then(db => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);

        pilots.forEach(pilot => {
            store.put(pilot);
        });

        transaction.oncomplete = function () {
            console.log('Pilotos salvos com sucesso!');
        };

        transaction.onerror = function (e) {
            console.error("Erro ao salvar pilotos:", e.target.errorCode);
        };
    }).catch(error => {
        console.error("Erro ao abrir banco de dados:", error);
    });
}

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

// Inicia a aplicação
window.onload = function () {
    document.getElementById("loginForm").style.display = "flex";
    document.getElementById("content").style.display = "none";
    getPilots().then(() => updateTable());
};
