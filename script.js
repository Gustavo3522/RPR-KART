document.addEventListener("DOMContentLoaded", function() {
    const loginSection = document.getElementById("login-section");
    const dashboard = document.getElementById("dashboard");
    const tabelaPilotos = document.getElementById("tabela-pilotos");
    const formularioPiloto = document.getElementById("formulario-piloto");

    function login() {
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        if (username === "admin" && password === "1234") {
            localStorage.setItem("user", "admin");
            loginSection.style.display = "none";
            dashboard.style.display = "block";
            carregarPilotos();
            formularioPiloto.style.display = "block";
        } else if (username === "viewer" && password === "1234") {
            localStorage.setItem("user", "viewer");
            loginSection.style.display = "none";
            dashboard.style.display = "block";
            carregarPilotos();
        } else {
            alert("Usuário ou senha incorretos!");
        }
    }

    function logout() {
        localStorage.removeItem("user");
        loginSection.style.display = "block";
        dashboard.style.display = "none";
        formularioPiloto.style.display = "none";
    }

    // Função para carregar os pilotos do backend
    function carregarPilotos() {
        fetch("http://localhost:8080/pilotos")  // Certifique-se de que essa URL está correta
            .then(response => response.json())  // Converte a resposta para JSON
            .then(pilotos => {
                tabelaPilotos.innerHTML = "";  // Limpa a tabela antes de preencher

                // Verifica se a resposta é um array
                if (Array.isArray(pilotos)) {
                    pilotos.forEach((piloto, index) => {
                        const row = `<tr>
                            <td>${index + 1}</td>
                            <td>${piloto.nome}</td>
                            <td>${piloto.pontuacao}</td>
                            <td>${piloto.corridas}</td>
                        </tr>`;
                        tabelaPilotos.innerHTML += row;  // Adiciona uma linha para cada piloto
                    });
                } else {
                    console.error("Resposta inválida: Não é um array");
                    alert("Erro ao carregar pilotos.");
                }
            })
            .catch(error => {
                console.error('Erro ao carregar pilotos:', error);
                alert('Erro ao carregar pilotos.');
            });
    }

    // Função para adicionar piloto no backend
    function adicionarPiloto() {
        const nome = document.getElementById("nomePiloto").value;
        const pontuacao = document.getElementById("pontuacaoPiloto").value;
        const corridas = document.getElementById("corridasPiloto").value;

        if (!nome || !pontuacao || !corridas) {
            alert("Preencha todos os campos!");
            return;
        }

        alert("Usuario criado com sucesso!")

        const piloto = { nome, pontuacao, corridas };

        // Fazendo uma requisição POST para adicionar piloto no backend
        fetch('http://localhost:8080/pilotos', {  // Altere a URL conforme sua configuração
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(piloto)
        })
        .then(response => response.json())
        .then(() => {
            carregarPilotos();  // Atualiza a lista de pilotos
            document.getElementById("formulario-piloto").reset();
        })
        .catch(error => {
            console.error('Erro ao adicionar piloto:', error);
        });
    }

    if (localStorage.getItem("user")) {
        loginSection.style.display = "none";
        dashboard.style.display = "block";
        carregarPilotos();
        if (localStorage.getItem("user") === "admin") {
            formularioPiloto.style.display = "block";
        }
    }

    window.login = login;
    window.logout = logout;
    window.adicionarPiloto = adicionarPiloto;
});
