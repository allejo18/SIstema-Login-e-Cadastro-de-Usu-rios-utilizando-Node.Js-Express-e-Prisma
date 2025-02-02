const express = require('express');
const multer = require('multer');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Middleware de autenticação
function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  jwt.verify(token, 'secreto', (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
}

// Rota raiz
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/login.html'); // Redireciona para a página de login
});

// Rota de cadastro
app.post('/cadastro', async (req, res) => {
  const { nome, email, celular, cpf, senha } = req.body;

  try {
    // Verifica se o usuário já existe
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Cria o usuário
    const user = await prisma.user.create({
      data: {
        nome,
        email,
        celular,
        cpf,
        senha: hashedPassword,
      },
    });

    res.json({ message: 'Cadastro realizado com sucesso!', user });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cadastrar usuário' });
  }
});

// Rota de login
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    // Verifica se o usuário existe
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Usuário não encontrado' });
    }

    // Verifica a senha
    const validPassword = await bcrypt.compare(senha, user.senha);
    if (!validPassword) {
      return res.status(400).json({ error: 'Senha inválida' });
    }

    // Gera o token JWT
    const token = jwt.sign({ id: user.id }, 'secreto', { expiresIn: '1h' });

    res.json({ message: 'Login realizado com sucesso!', token });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// Rota protegida (exemplo)
app.get('/protegido', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    res.json({ nome: user.nome });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar dados do usuário' });
  }
});

// Rota para carregar o perfil do usuário
app.get('/perfil', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar perfil' });
  }
});

// Rota para editar o perfil
app.put('/editar-perfil', authenticateToken, async (req, res) => {
  const { nome, email, celular } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { nome, email, celular },
    });
    res.json({ message: 'Perfil atualizado com sucesso!', user });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});

// Rota para alterar a senha
app.put('/alterar-senha', authenticateToken, async (req, res) => {
  const { senhaAtual, novaSenha } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    // Verifica a senha atual
    const validPassword = await bcrypt.compare(senhaAtual, user.senha);
    if (!validPassword) {
      return res.status(400).json({ error: 'Senha atual incorreta' });
    }

    // Criptografa a nova senha
    const hashedPassword = await bcrypt.hash(novaSenha, 10);

    // Atualiza a senha
    await prisma.user.update({
      where: { id: req.user.id },
      data: { senha: hashedPassword },
    });

    res.json({ message: 'Senha alterada com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao alterar senha' });
  }
});

// Rota para upload de foto de perfil
app.post('/upload-foto', authenticateToken, upload.single('foto'), async (req, res) => {
  try {
    const fotoPerfil = `/uploads/${req.file.filename}`;

    // Atualiza a foto de perfil no banco de dados
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { fotoPerfil },
    });

    res.json({ message: 'Foto de perfil atualizada com sucesso!', user });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer upload da foto' });
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});