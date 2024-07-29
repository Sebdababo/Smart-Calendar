const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

const dataFile = path.join(__dirname, 'data', 'events.json');

if (!fs.existsSync(path.dirname(dataFile))) {
    fs.mkdirSync(path.dirname(dataFile), { recursive: true });
}

if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, '{}');
}

app.get('/api/events', (req, res) => {
    const events = JSON.parse(fs.readFileSync(dataFile));
    res.json(events);
});

app.post('/api/events', (req, res) => {
    const events = req.body;
    fs.writeFileSync(dataFile, JSON.stringify(events, null, 2));
    res.sendStatus(200);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});