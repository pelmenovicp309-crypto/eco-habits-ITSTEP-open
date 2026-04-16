const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());

const usersFile = path.join(__dirname, 'users.json');

function loadUsers() {
    if (fs.existsSync(usersFile)) {
        return JSON.parse(fs.readFileSync(usersFile));
    }
    return {};
}

function saveUsers(users) {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

app.post('/signup', (req, res) => {
    const { username, password } = req.body;
    const users = loadUsers();
    if (users[username]) {
        return res.status(400).json({ error: 'Ім\'я користувача вже існує' });
    }
    users[username] = { password, points: 0, autoClickerCount: 0, autoClickerCost: 100, leaderboard: [], taskCompletedToday: false, lastTaskDate: '' };
    saveUsers(users);
    res.json({ message: 'Обліковий запис створено' });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const users = loadUsers();
    if (!users[username] || users[username].password !== password) {
        return res.status(401).json({ error: 'Невірні облікові дані' });
    }
    res.json({ message: 'Увійшли', data: users[username] });
});

app.post('/save', (req, res) => {
    const { username, data } = req.body;
    const users = loadUsers();
    if (!users[username]) {
        return res.status(404).json({ error: 'Користувача не знайдено' });
    }
    users[username] = { ...users[username], ...data };
    saveUsers(users);
    res.json({ message: 'Data saved' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
