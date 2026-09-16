require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

app.get("/", (req, res) => {
  res.json({
    projeto: "MatchChairs API",
    status: "Motor ligado e rodando perfeitamente!",
    versão: "1.0.0",
  });
});

app.get("/teste-banco", async (req, res) => {
  try {
    const cliente = await pool.connect();
    const resultado = await cliente.query("SELECT NOW()");
    cliente.release();

    res.json({
      sucesso: true,
      mensagem: "Conexão com a nuvem estabelecida com sucesso!",
      hora_no_servidor: resultado.rows[0].now,
    });
  } catch (erro) {
    console.error("Erro na conexão:", erro);
    res.status(500).json({ erro: "Falha ao conectar no banco de dados." });
  }
});

app.post("/usuarios", async (req, res) => {
  try {
    const { nome, email, senha, data_nascimento } = req.body;

    if (!nome || !email || !senha || !data_nascimento) {
      return res
        .status(400)
        .json({ erro: "Todos os campos são obrigatórios." });
    }

    const dataNasc = new Date(data_nascimento);
    const hoje = new Date();

    let idade = hoje.getFullYear() - dataNasc.getFullYear();
    const mes = hoje.getMonth() - dataNasc.getMonth();

    if (mes < 0 || (mes === 0 && hoje.getDate() < dataNasc.getDate())) {
      idade--;
    }

    if (idade < 18) {
      return res.status(403).json({
        erro: "Acesso negado.",
        detalhe: "Você precisa ter 18 anos ou mais para usar o MatchChairs.",
      });
    }

    const saltos = 10;
    const senhaCriptografada = await bcrypt.hash(senha, saltos);

    const cliente = await pool.connect();

    const query = `
            INSERT INTO usuarios (nome, email, senha_hash, data_nascimento)
            VALUES ($1, $2, $3, $4)
            RETURNING id, nome, email;
        `;
    const valores = [nome, email, senhaCriptografada, data_nascimento];

    const resultado = await cliente.query(query, valores);
    cliente.release();

    res.status(201).json({
      sucesso: true,
      mensagem: "Usuário criado com sucesso!",
      usuario: resultado.rows[0],
    });
  } catch (erro) {
    console.erro("Erro no cadastro:", erro);
    if (erro.code === "23505") {
      return res.status(409).json({ erro: "Este email já está cadastrado." });
    }
    res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res
        .status(400)
        .json({ erro: "Email e senha não preenchidos ou incorretos." });
    }

    const cliente = await pool.connect();

    const resultado = await cliente.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email],
    );
    cliente.release();

    if (resultado.rows.length === 0) {
      return res.status(401).json({ erro: "Usuário ou senha incorretos." });
    }

    const usuario = resultado.rows[0];

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaValida) {
      return res.status(401).json({ erro: "Usuário ou senha incorretos." });
    }

    const payload = {
      id: usuario.i,
      nome: usuario.nome,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      sucesso: true,
      mensagem: "Login realizado com sucesso! 🎟️",
      token: token,
      usuario: {
        id: usuario.id,
        nome: usuario.name,
        email: usuario.email,
      },
    });
  } catch (erro) {
    console.error("Erro no login:", erro);
    res.status(500).json({ Erro: "interno no servidor." });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🎬 MatchChairs backend rodando na porta ${PORT}`);
});
