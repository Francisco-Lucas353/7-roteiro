const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const FILE_PATH = 'matches.json';

const readData = () => {
    if (!fs.existsSync(FILE_PATH)) return [];
    try {
        const data = fs.readFileSync(FILE_PATH);
        return JSON.parse(data);
    } catch (error) {
        console.error("Erro ao ler o arquivo JSON:", error);
        return [];
    }
};

const writeData = (data) => {
    try {
        fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Erro ao escrever no arquivo JSON:", error);
    }
};

// Criar uma nova partida
app.post('/matches', (req, res) => {
    const { title, location, date } = req.body;
    if (!title || !location || !date) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios" });
    }
    const matches = readData();
    const newMatch = { id: Date.now(), title, location, date, players: [] };
    matches.push(newMatch);
    writeData(matches);
    res.status(201).json(newMatch);
});

// Listar todas as partidas
app.get('/matches', (req, res) => {
    res.json(readData());
});

// Adicionar jogador a uma partida
app.post('/matches/:id/players', (req, res) => {
    const { name, phone } = req.body;
    if (!name || !phone) {
        return res.status(400).json({ message: "Nome e telefone são obrigatórios" });
    }
    const matches = readData();
    const match = matches.find(m => m.id == req.params.id);
    if (!match) return res.status(404).json({ message: 'Partida não encontrada' });
    match.players.push({ id: Date.now(), name, phone, confirmed: false });
    writeData(matches);
    res.json(match);
});

// Confirmar presença de um jogador
app.patch('/matches/:id/players/:playerId', (req, res) => {
    const matches = readData();
    const match = matches.find(m => m.id == req.params.id);
    if (!match) return res.status(404).json({ message: 'Partida não encontrada' });
    
    const player = match.players.find(p => p.id == req.params.playerId);
    if (!player) return res.status(404).json({ message: 'Jogador não encontrado' });
    
    player.confirmed = true;
    writeData(matches);
    res.json(player);
});

// Remover jogador de uma partida
app.delete('/matches/:id/players/:playerId', (req, res) => {
    let matches = readData();
    const match = matches.find(m => m.id == req.params.id);
    if (!match) return res.status(404).json({ message: 'Partida não encontrada' });
    match.players = match.players.filter(p => p.id != req.params.playerId);
    writeData(matches);
    res.json({ message: 'Jogador removido com sucesso' });
});

// Excluir uma partida
app.delete('/matches/:id', (req, res) => {
    let matches = readData();
    matches = matches.filter(m => m.id != req.params.id);
    writeData(matches);
    res.json({ message: 'Partida excluída com sucesso' });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
