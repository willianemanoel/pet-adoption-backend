const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Dados mock (animais para teste)
const mockAnimals = [
  {
    id: 1,
    name: "teste",
    species: "cachorro",
    breed: "Vira-lata",
    age: 2,
    ageUnit: "anos",
    size: "médio",
    gender: "macho",
    description: "Um doguinho muito brincalhão e carinhoso! Adora passeios e brincar com bolinha.",
    photos: ["https://images.dog.ceo/breeds/mix/n02110185_1469.jpg"],
    personality: ["brincalhão", "carinhoso", "ativo"],
    healthInfo: { vaccinated: true, dewormed: true, castrated: true },
    requirements: ["Espaço para correr", "Passeios diários"]
  },{
    id: 2,
    name: "teas",
    species: "cachorro",
    breed: "Vira-lata",
    age: 2,
    ageUnit: "anos",
    size: "médio",
    gender: "macho",
    description: "Um doguinho muito brincalhão e carinhoso! Adora passeios e brincar com bolinha.",
    photos: ["https://images.dog.ceo/breeds/mix/n02110185_1469.jpg"],
    personality: ["brincalhão", "carinhoso", "ativo"],
    healthInfo: { vaccinated: true, dewormed: true, castrated: true },
    requirements: ["Espaço para correr", "Passeios diários"]
  },{
    id: 3,
    name: "teasdas",
    species: "cachorro",
    breed: "Vira-lata",
    age: 2,
    ageUnit: "anos",
    size: "médio",
    gender: "macho",
    description: "Um doguinho muito brincalhão e carinhoso! Adora passeios e brincar com bolinha.",
    photos: ["https://images.dog.ceo/breeds/mix/n02110185_1469.jpg"],
    personality: ["brincalhão", "carinhoso", "ativo"],
    healthInfo: { vaccinated: true, dewormed: true, castrated: true },
    requirements: ["Espaço para correr", "Passeios diários"]
  },{
    id: 4,
    name: "Rteadadwex",
    species: "cachorro",
    breed: "Vira-lata",
    age: 2,
    ageUnit: "anos",
    size: "médio",
    gender: "macho",
    description: "Um doguinho muito brincalhão e carinhoso! Adora passeios e brincar com bolinha.",
    photos: ["https://images.dog.ceo/breeds/mix/n02110185_1469.jpg"],
    personality: ["brincalhão", "carinhoso", "ativo"],
    healthInfo: { vaccinated: true, dewormed: true, castrated: true },
    requirements: ["Espaço para correr", "Passeios diários"]
  },
  // Você pode adicionar mais animais aqui
];

const mockUsers = [
  {
    id: 1,
    name: "João Silva",
    email: "joao@email.com",
    matches: [1] // IDs dos animais que já deram match
  },
  // Você pode adicionar mais usuários aqui
];

// Rotas principais
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Pet Adoption funcionando! 🐾',
    version: '1.0.0',
    status: '✅ ONLINE',
    endpoints: {
      home: '/',
      health: '/health', 
      animals: '/api/animals',
      animalDetail: '/api/animals/:id',
      matches: '/api/matches',
      like: '/api/animals/:id/like',
      dislike: '/api/animals/:id/dislike'
    }
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Pet Adoption API'
  });
});

// API de animais
app.get('/api/animals', (req, res) => {
  res.json({
    success: true,
    count: mockAnimals.length,
    animals: mockAnimals
  });
});

app.get('/api/animals/:id', (req, res) => {
  const animalId = parseInt(req.params.id);
  const animal = mockAnimals.find(a => a.id === animalId);
  
  if (animal) {
    res.json({ success: true, animal });
  } else {
    res.status(404).json({ success: false, message: 'Animal não encontrado' });
  }
});

// Rota de like (curtir animal e criar match)
app.post('/api/animals/:id/like', (req, res) => {
  const animalId = parseInt(req.params.id);
  const { userId } = req.body;

  const animal = mockAnimals.find(a => a.id === animalId);
  if (!animal) {
    return res.status(404).json({ success: false, message: 'Animal não encontrado' });
  }

  const user = mockUsers.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
  }

  // Adiciona match no usuário (se ainda não existir)
  if (!user.matches.includes(animalId)) {
    user.matches.push(animalId);
  }

  const newMatch = {
    id: Date.now(),
    userId,
    animalId,
    timestamp: new Date().toISOString(),
    status: 'pending'
  };

  res.json({
    success: true,
    match: newMatch,
    message: 'Match criado com sucesso! 💖'
  });
});

// Rota de dislike (não curtir animal)
app.post('/api/animals/:id/dislike', (req, res) => {
  const animalId = parseInt(req.params.id);
  const { userId } = req.body;

  const animal = mockAnimals.find(a => a.id === animalId);
  if (!animal) {
    return res.status(404).json({ success: false, message: 'Animal não encontrado' });
  }

  const user = mockUsers.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
  }

  // Remove o animal dos matches do usuário (se existir)
  user.matches = user.matches.filter(matchId => matchId !== animalId);

  res.json({
    success: true,
    message: 'Dislike registrado com sucesso! ✅',
    data: {
      animalId,
      userId,
      timestamp: new Date().toISOString(),
      action: 'dislike'
    }
  });
});

// API de matches por usuário
app.get('/api/matches/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const userMatches = mockUsers.find(u => u.id === userId)?.matches || [];
  
  const matches = userMatches.map(matchId => {
    const animal = mockAnimals.find(a => a.id === matchId);
    return {
      matchId,
      animal,
      matchedAt: new Date().toISOString()
    };
  });
  
  res.json({ success: true, matches });
});

module.exports = app;