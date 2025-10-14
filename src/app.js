const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();

// --- CONFIGURAÇÃO DO MULTER ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));

// --- BANCO DE DADOS MOCK ---
let mockAnimals = [
  { id: 1, name: "Rex", species: "Cachorro", photos: [`http://192.168.0.103:3000/public/uploads/rex.jpg`] },
  { id: 2, name: "Luna", species: "Gato", photos: [`http://192.168.0.103:3000/public/uploads/luna.jpg`] }
];

let mockAdminChats = [
    { id: 'chat1', petName: 'Rex', userName: 'Ana Carolina', lastMessage: 'Olá! Tenho interesse em adotar o Rex.', timestamp: 'há 2 horas', unread: true, status: 'active' },
    { id: 'chat2', petName: 'Luna', userName: 'Marcos Paulo', lastMessage: 'Gostaria de saber mais sobre a Luna.', timestamp: 'há 5 horas', unread: false, status: 'pending' },
];

let mockMatchRequests = [
    { id: 'req1', userName: 'Ana Carolina', userImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', petName: 'Bolinha', petImage: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=100&h=100&fit=crop', timestamp: '2 horas atrás' },
    { id: 'req2', userName: 'Marcos Paulo', userImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', petName: 'Frajola', petImage: 'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=100&h=100&fit=crop', timestamp: '5 horas atrás' },
];

// --- ROTAS ---

app.get('/', (req, res) => res.json({ message: 'API Pet Adoption funcionando!' }));

// --- API DE ANIMAIS (CRUD) ---
app.get('/api/animals', (req, res) => res.json({ success: true, animals: mockAnimals }));
app.get('/api/animals/:id', (req, res) => {
  const animal = mockAnimals.find(a => a.id === parseInt(req.params.id));
  if (animal) res.json({ success: true, animal });
  else res.status(404).json({ success: false, message: 'Animal não encontrado' });
});

app.post('/api/animals', upload.array('photos', 5), (req, res) => {
    const petInfo = req.body;
    const photoPaths = req.files ? req.files.map(file => `http://192.168.0.103:3000/public/uploads/${file.filename}`) : [];
    const newPet = { ...petInfo, id: Date.now(), age: parseInt(petInfo.age, 10), photos: photoPaths, status: 'Disponível' };
    mockAnimals.push(newPet);
    res.status(201).json({ success: true, message: 'Pet cadastrado!', pet: newPet });
});

app.put('/api/animals/:id', upload.array('photos', 5), (req, res) => {
    const petIndex = mockAnimals.findIndex(p => p.id === parseInt(req.params.id));
    if (petIndex > -1) {
        Object.assign(mockAnimals[petIndex], req.body);
        if (req.files && req.files.length > 0) {
            mockAnimals[petIndex].photos = req.files.map(file => `http://192.168.0.103:3000/public/uploads/${file.filename}`);
        }
        res.json({ success: true, message: 'Pet atualizado!', pet: mockAnimals[petIndex] });
    } else {
        res.status(404).json({ success: false, message: 'Animal não encontrado' });
    }
});

app.delete('/api/animals/:id', (req, res) => {
    const initialLength = mockAnimals.length;
    mockAnimals = mockAnimals.filter(p => p.id !== parseInt(req.params.id));
    if (mockAnimals.length < initialLength) res.json({ success: true, message: 'Pet removido!' });
    else res.status(404).json({ success: false, message: 'Animal não encontrado' });
});

// ROTA PARA AS SOLICITAÇÕES
app.get('/api/match-requests', (req, res) => {
    res.json({ success: true, requests: mockMatchRequests });
});

// Rota para buscar conversas do admin
app.get('/api/chats/admin', (req, res) => {
    res.json({ success: true, chats: mockAdminChats });
});

// Login do Admin (simulado)
app.post('/api/admin/login', (req, res) => {
    const { email, password } = req.body;
    if (email && password) res.json({ success: true, message: 'Login bem-sucedido!' });
    else res.status(400).json({ success: false, message: 'Email e senha são obrigatórios.' });
});

module.exports = app;