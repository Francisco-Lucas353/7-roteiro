document.addEventListener("DOMContentLoaded", () => {
    const matchForm = document.getElementById("matchForm");
    const matchesList = document.getElementById("matchesList");

    // Buscar partidas
    const fetchMatches = async () => {
        try {
            const response = await fetch("http://localhost:3000/matches");
            if (!response.ok) throw new Error("Erro ao buscar partidas");
            const matches = await response.json();
            matchesList.innerHTML = "";
            matches.forEach(match => {
                const li = document.createElement("li");
                li.innerHTML = `
                    <strong>${match.title}</strong><br>
                    Local: ${match.location}<br>
                    Data: ${new Date(match.date).toLocaleString()}<br>
                    <button onclick="deleteMatch(${match.id})">Excluir Partida</button>
                    <h3>Jogadores:</h3>
                    <ul id="players-${match.id}" class="player-list"></ul>
                    <input type="text" id="name-${match.id}" placeholder="Nome" required>
                    <input type="text" id="phone-${match.id}" placeholder="Telefone" required>
                    <button onclick="addPlayer(${match.id})">Adicionar Jogador</button>
                `;
                matchesList.appendChild(li);
                updatePlayersList(match);
            });
        } catch (error) {
            console.error("Erro ao carregar partidas:", error);
        }
    };

    // Criar partida
    matchForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const title = document.getElementById("title").value;
        const location = document.getElementById("location").value;
        const date = document.getElementById("date").value;
        if (!title || !location || !date) {
            alert("Por favor, preencha todos os campos.");
            return;
        }
        await fetch("http://localhost:3000/matches", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, location, date })
        });
        matchForm.reset();
        fetchMatches();
    });

    // Adicionar jogador
    window.addPlayer = async (matchId) => {
        const name = document.getElementById(`name-${matchId}`).value;
        const phone = document.getElementById(`phone-${matchId}`).value;
        if (!name || !phone) {
            alert("Nome e telefone são obrigatórios");
            return;
        }
        await fetch(`http://localhost:3000/matches/${matchId}/players`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, phone })
        });
        fetchMatches();
    };

    // Atualizar lista de jogadores
    const updatePlayersList = (match) => {
        const playersList = document.getElementById(`players-${match.id}`);
        playersList.innerHTML = "";
        match.players.forEach(player => {
            const li = document.createElement("li");
            li.innerHTML = `${player.name} - ${player.phone} ${player.confirmed ? '✅' : `<button onclick="confirmPresence(${match.id}, ${player.id})">Confirmar</button>`} <button onclick="removePlayer(${match.id}, ${player.id})">Remover</button>`;
            playersList.appendChild(li);
        });
    };

    // Confirmar presença
    window.confirmPresence = async (matchId, playerId) => {
        await fetch(`http://localhost:3000/matches/${matchId}/players/${playerId}`, { method: "PATCH" });
        fetchMatches();
    };

    // Remover jogador
    window.removePlayer = async (matchId, playerId) => {
        await fetch(`http://localhost:3000/matches/${matchId}/players/${playerId}`, { method: "DELETE" });
        fetchMatches();
    };

    // Excluir partida
    window.deleteMatch = async (id) => {
        await fetch(`http://localhost:3000/matches/${id}`, { method: "DELETE" });
        fetchMatches();
    };

    fetchMatches();
});
