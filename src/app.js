// src/app.js

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

const IP_ADDRESS = process.env.IP_ADDRESS || '192.168.0.103'; 
const PORT = process.env.PORT || 3000;
const BASE_URL = `http://${IP_ADDRESS}:${PORT}`;

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, '../public')));


// --- CONFIGURAÇÃO DO MULTER ---
const uploadDir = 'public/uploads/';
const absoluteUploadDir = path.join(__dirname, '..', uploadDir);
if (!fs.existsSync(absoluteUploadDir)) {
    fs.mkdirSync(absoluteUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });


// --- BANCO DE DADOS MOCK ---

// ✅ CORREÇÃO 1: Dados originais agora estão protegidos dentro de uma função.
const getInitialMockData = () => ({
    mockUsers: [
        {
            id: 'user1', name: 'Ana Carolina', email: 'ana@email.com', phone: '11987654321', location: 'São Paulo, SP',
            bio: 'Amante de animais procurando um novo amigo de quatro patas.',
            stats: { matches: 1, petsViewed: 25, favorites: 3, adopted: 0 }
        },
        {
            id: 'user2', name: 'Marcos Paulo', email: 'marcos@email.com', phone: '21912345678', location: 'Rio de Janeiro, RJ',
            bio: 'Tenho um quintal grande e muito amor para dar.',
            stats: { matches: 1, petsViewed: 40, favorites: 5, adopted: 1 }
        }
    ],
    mockAnimals: [
        { 
            id: 1, name: "Rex", type: "Cachorro", age: 2, ageUnit: 'anos', breed: 'Vira-lata',
            location: 'São Paulo, SP', size: 'Médio', sex: 'Macho', status: 'Disponível',
            description: 'Rex é um companheiro leal e brincalhão. Adora correr atrás de bolinhas e receber carinho na barriga.',
            vaccinated: true, neutered: true,
            temperament: ['Brincalhão', 'Leal', 'Ativo'], needs: ['Passeios diários', 'Espaço para correr'],
            photos: [`${BASE_URL}/public/uploads/rex.jpg`],
            matches: 12, views: 150
        },
        { 
            id: 2, name: "Luna", type: "Gato", age: 1, ageUnit: 'ano', breed: 'Siamês',
            location: 'Rio de Janeiro, RJ', size: 'Pequeno', sex: 'Fêmea', status: 'Disponível',
            description: 'Luna é uma gatinha calma e carinhosa. Gosta de tirar longas sonecas no sol e de um bom colo.',
            vaccinated: true, neutered: true,
            temperament: ['Calma', 'Carinhosa', 'Independente'], needs: ['Caixa de areia limpa', 'Arranhadores'],
            photos: [`${BASE_URL}/public/uploads/luna.jpg`],
            matches: 8, views: 95
        },
        { 
            id: 3, name: "Pompom", type: "Coelho", age: 6, ageUnit: 'meses', breed: 'Angorá',
            location: 'Curitiba, PR', size: 'Pequeno', sex: 'Macho', status: 'Disponível',
            description: 'Pompom é um coelhinho curioso e fofo. Adora feno e vegetais frescos.',
            vaccinated: false, neutered: true,
            temperament: ['Curioso', 'Dócil'], needs: ['Gaiola espaçosa', 'Feno à vontade'],
            photos: [`${BASE_URL}/public/uploads/pompom.jpg`],
            matches: 5, views: 72
        }
    ],
    mockMatches: [
        { id: 1, petId: 1, userId: 'user1', matchedAt: new Date(), status: 'pending' },
        { id: 2, petId: 2, userId: 'user2', matchedAt: new Date(), status: 'approved' },
    ],
    mockFavorites: [
        { id: 1, petId: 1, userId: 'user2', addedAt: new Date() },
        { id: 2, petId: 3, userId: 'user1', addedAt: new Date() },
    ]
});

// Variáveis que podem ser modificadas pelas rotas
let { mockAnimals, mockUsers, mockMatches, mockFavorites } = getInitialMockData();


// --- ROTAS ---

// ✅ CORREÇÃO 2: Nova rota para resetar os dados durante os testes
app.get('/api/reset-data', (req, res) => {
    ({ mockAnimals, mockUsers, mockMatches, mockFavorites } = getInitialMockData());
    console.log('--- DADOS DE TESTE RESETADOS PARA O ESTADO INICIAL ---');
    res.json({ success: true, message: 'Dados resetados com sucesso!' });
});


app.get('/', (req, res) => res.json({ message: 'API Pet Adoption funcionando!' }));

// --- API DE ANIMAIS (CRUD MELHORADO) ---
app.get('/api/animals', (req, res) => {
    console.log(`Enviando ${mockAnimals.length} animais.`);
    res.json({ success: true, animals: mockAnimals });
});

app.post('/api/animals', upload.array('photos', 5), (req, res) => {
    const petInfo = req.body;
    const newPhotos = req.files ? req.files.map(file => `${BASE_URL}/public/uploads/${file.filename}`) : [];
    
    const newPet = {
        id: Date.now(),
        name: petInfo.name,
        type: petInfo.type,
        age: parseInt(petInfo.age, 10) || 0,
        ageUnit: petInfo.ageUnit,
        breed: petInfo.breed,
        location: petInfo.location,
        size: petInfo.size,
        sex: petInfo.sex,
        description: petInfo.description,
        vaccinated: petInfo.vaccinated === 'true',
        neutered: petInfo.neutered === 'true',
        temperament: petInfo.temperament ? petInfo.temperament.split(',').map(t => t.trim()) : [],
        needs: petInfo.needs ? petInfo.needs.split(',').map(n => n.trim()) : [],
        photos: newPhotos,
        status: 'Disponível',
        matches: 0,
        views: 0
    };

    mockAnimals.push(newPet);
    res.status(201).json({ success: true, message: 'Pet cadastrado!', pet: newPet });
});

app.put('/api/animals/:id', upload.array('photos', 5), (req, res) => {
    const petId = parseInt(req.params.id);
    const petIndex = mockAnimals.findIndex(p => p.id === petId);
    if (petIndex === -1) {
        return res.status(404).json({ success: false, message: 'Animal não encontrado' });
    }

    const petData = req.body;
    const newPhotos = req.files ? req.files.map(file => `${BASE_URL}/public/uploads/${file.filename}`) : [];
    
    let existingPhotos = mockAnimals[petIndex].photos;
    if (petData.existingPhotos) {
        try {
            existingPhotos = JSON.parse(petData.existingPhotos);
        } catch (e) {
            console.error("Erro ao parsear existingPhotos:", e);
        }
    }
    
    const allPhotos = [...existingPhotos, ...newPhotos];

    const updatedPet = {
        ...mockAnimals[petIndex],
        ...petData,
        age: parseInt(petData.age, 10) || mockAnimals[petIndex].age,
        vaccinated: petData.vaccinated === 'true',
        neutered: petData.neutered === 'true',
        temperament: petData.temperament ? petData.temperament.split(',').map(t => t.trim()) : mockAnimals[petIndex].temperament,
        needs: petData.needs ? petData.needs.split(',').map(n => n.trim()) : mockAnimals[petIndex].needs,
        photos: allPhotos
    };
    
    mockAnimals[petIndex] = updatedPet;
    res.json({ success: true, message: 'Pet atualizado!', pet: updatedPet });
});

app.delete('/api/animals/:id', (req, res) => {
    const initialLength = mockAnimals.length;
    mockAnimals = mockAnimals.filter(p => p.id !== parseInt(req.params.id));
    if (mockAnimals.length < initialLength) {
        res.json({ success: true, message: 'Pet removido!' });
    } else {
        res.status(404).json({ success: false, message: 'Animal não encontrado' });
    }
});
app.get('/api/matches', (req, res) => {
    const { userId } = req.query;
    let matches = mockMatches;
    if (userId) {
        matches = mockMatches.filter(m => m.userId === userId);
    }
    res.json({ success: true, matches });
});

app.get('/api/favorites', (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ success: false, message: 'userId é obrigatório' });
    }
    const userFavorites = mockFavorites.filter(f => f.userId === userId);
    res.json({ success: true, favorites: userFavorites });
});

module.exports = app;