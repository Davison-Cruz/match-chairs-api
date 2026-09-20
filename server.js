require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Middleware de Autenticação (nao vai passar ninguem)
const verificarToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res
      .status(403)
      .json({ erro: "Acesso negado. Cadê a sua pulseira VIP (Token)?" });

  jwt.verify(token, process.env.JWT_SECRET, (erro, usuarioDecodificado) => {
    if (erro) {
      return res
        .status(401)
        .json({ erro: "Token inválido ou expirado. Faça login novamente." });
    }

    req.usuarioId = usuarioDecodificado.id;
    next();
  });
};

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
      id: usuario.id,
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

app.post("/casais/gerar-codigo", verificarToken, async (req, res) => {
  try {
    const meuId = req.usuarioId;

    const codigoAleatorio = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
    const codigoConvite = `MTC-${codigoAleatorio}`;

    const cliente = await pool.connect();

    const checaExistente = await cliente.query(
      "SELECT * FROM casais WHERE usuario1_id = $1 OR usuario2_id = $1",
      [meuId],
    );

    if (checaExistente.rows.length > 0) {
      cliente.release();
      return res.status(400).json({
        erro: "Você já está em um vínculo ou já possui um código gerado. ",
      });
    }

    const query = `
      INSERT INTO casais (codigo_convite, usuario1_id)
      VALUES ($1, $2)
      RETURNING codigo_convite;
      `;

    const resultado = await cliente.query(query, [codigoConvite, meuId]);
    cliente.release();

    res.status(201).json({
      sucesso: true,
      mensagem: "Código gerado com sucesso! Envie para o seu amor. 💌",
      codigo: resultado.rows[0].codigo_convite,
    });
  } catch (erro) {
    console.error("Erro ao gerar código:", erro);
    res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

//Aceitar o convite ( só pra eu não esquecer por enquanto)
app.post("/casais/vincular", verificarToken, async (req, res) => {
  try {
    const meuId = req.usuarioId;
    const { codigo_convite } = req.body;

    if (!codigo_convite) {
      return res
        .status(400)
        .json({ erro: "Por favor, insira o código de convite" });
    }

    const cliente = await pool.connect();

    const buscaCasal = await cliente.query(
      "SELECT * FROM casais WHERE codigo_convite = $1 AND usuario2_id IS NULL",
      [codigo_convite],
    );

    if (buscaCasal.rows.length === 0) {
      cliente.release();
      return res
        .status(404)
        .json({ erro: "Código inválido, expirado ou já utilizado." });
    }

    const idCasal = buscaCasal.rows[0].id;
    const idUsuario1 = buscaCasal.rows[0].usuario1_id;

    if (idUsuario1 === meuId) {
      cliente.release();
      return res
        .status(400)
        .json({ erro: "Você não pode vincular a conta com você mesmo!" });
    }

    await cliente.query("UPDATE casais SET usuario2_id = $1 WHERE id = $2", [
      meuId,
      idCasal,
    ]);
    cliente.release();

    res.json({
      sucesso: true,
      mensagem: "Vínculo de casal criado com sucesso!",
    });
  } catch (erro) {
    console.error("Erro ao vincular casal:", erro);
    res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

// Buscar Filmes em Alta (Fila Inteligente: Sem repetecos)
app.get("/filmes/em-alta", verificarToken, async (req, res) => {
  try {
    const meuId = req.usuarioId;
    const cliente = await pool.connect();

    const buscaMeusVotos = await cliente.query(
      "SELECT filme_id_tmdb FROM votos WHERE usuario_id = $1",
      [meuId],
    );
    cliente.release();

    const filmesVotados = buscaMeusVotos.rows.map((voto) => voto.filme_id_tmdb);

    const paginaSolicitada = req.query.pagina || 1;

    const urlTMDB = `https://api.themoviedb.org/3/movie/popular?language=pt-BR&page=${paginaSolicitada}`;
    const opcoes = {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
      },
    };

    const respostaTMDB = await axios.get(urlTMDB, opcoes);

    const filmesIneditos = respostaTMDB.data.results.filter(
      (filme) => !filmesVotados.includes(filme.id),
    );

    const filmesLimpos = filmesIneditos.map((filme) => {
      return {
        id: filme.id,
        titulo: filme.title,
        sinopse: filme.overview,
        nota: filme.vote_average,
        poster_url: filme.poster_path
          ? `https://image.tmdb.org/t/p/w500${filme.poster_path}`
          : null,
      };
    });

    res.json({
      sucesso: true,
      quantidade_recebida_tmdb: respostaTMDB.data.results.length,
      quantidade_enviada_celular: filmesLimpos.length, // Aqui você vai ver a diferença!
      filmes: filmesLimpos,
    });
  } catch (erro) {
    console.error(
      "Erro ao buscar filmes no TMDB:",
      erro.response ? erro.response.data : erro.message,
    );
    res
      .status(500)
      .json({ erro: "Falha ao se comunicar com o catálogo de filmes." });
  }
});

app.post("/votos", verificarToken, async (req, res) => {
  try {
    const meuId = req.usuarioId;
    const { filme_id, acao } = req.body;

    if (!filme_id || !acao) {
      return res
        .status(400)
        .json({ erro: "ID do filmes e ação são obrigatórios" });
    }

    const cliente = await pool.connect();

    try {
      await cliente.query(
        "INSERT INTO votos (usuario_id, filme_id_tmdb, acao) VALUES ($1, $2, $3)",
        [meuId, filme_id, acao],
      );
    } catch (err) {
      if (err.code === "23505") {
        cliente.release();
        return res.status(400).json({ erro: "Você já votou nesse filme" });
      }
      throw err;
    }

    let deuMatch = false;

    if (acao === "like" || acao === "superlike") {
      const buscaCasal = await cliente.query(
        "SELECT id, usuario1_id, usuario2_id FROM casais WHERE usuario1_id = $1 OR usuario2_id = $1",
        [meuId],
      );

      if (
        buscaCasal.rows.length > 0 &&
        buscaCasal.rows[0].usuario2_id !== null
      ) {
        const casal = buscaCasal.rows[0];

        const parceiroId =
          casal.usuario1_id === meuId ? casal.usuario2_id : casal.usuario1_id;

        const buscaVotoParceiro = await cliente.query(
          "SELECT * FROM votos WHERE usuario_id = $1 AND filme_id_tmdb = $2 AND acao IN ('like', 'superlike')",
          [parceiroId, filme_id],
        );

        if (buscaVotoParceiro.rows.length > 0) {
          deuMatch = true;

          const checaMatch = await cliente.query(
            "SELECT * FROM lista_matches WHERE casal_id = $1 and filme_id_tmdb = $2",
            [casal.id, filme_id],
          );

          if (checaMatch.rows.length === 0) {
            await cliente.query(
              "INSERT INTO lista_matches (casal_id, filme_id_tmdb) VALUES ($1, $2)",
              [casal.id, filme_id],
            );
          }
        }
      }
    }

    cliente.release();

    res.status(201).json({
      sucesso: true,
      mensagem: "Voto computado com sucesso!",
      match: deuMatch,
    });
  } catch (erro) {
    console.error("Erro ao registrar voto", erro);
    res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

app.get("/matches", verificarToken, async (req, res) => {
  try {
    const meuId = req.usuarioId;
    const cliente = await pool.connect();

    const buscaCasal = await cliente.query(
      "SELECT id FROM casais WHERE usuario1_id = $1 OR usuario2_id = $1",
      [meuId],
    );

    if (buscaCasal.rows.length === 0) {
      cliente.release();
      return res
        .status(404)
        .json({ erro: "Você ainda não está em um vínculo de casal." });
    }

    const casalId = buscaCasal.rows[0].id;

    const buscaMatches = await cliente.query(
      "SELECT filme_id_tmdb, data_match FROM lista_matches WHERE casal_id = $1 ORDER BY data_match DESC",
      [casalId],
    );
    cliente.release();

    if (buscaMatches.rows.length === 0) {
      return res.json({
        sucesso: true,
        mensagem: "Vocês ainda não têm matches. Continuem votando!",
        filmes: [],
      });
    }

    const opcoesTMDB = {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
      },
    };

    const promessasFilmes = buscaMatches.rows.map(async (match) => {
      try {
        const url = `https://api.themoviedb.org/3/movie/${match.filme_id_tmdb}?language=pt-BR`;
        const resposta = await axios.get(url, opcoesTMDB);
        const filme = resposta.data;

        return {
          id: filme.id,
          titulo: filme.title,
          sinopse: filme.overview,
          poster_url: filme.poster_path
            ? `https://image.tmdb.org/t/p/w500${filme.poster_path}`
            : null,
          data_match: match.data_match,
        };
      } catch (erroTMDB) {
        console.error(
          `Erro ao buscar detalhes do filme ${match.filme_id_tmdb}:`,
          erroTMDB.message,
        );
        return null;
      }
    });

    let filmesMatches = await Promise.all(promessasFilmes);

    filmesMatches = filmesMatches.filter((filme) => filme !== null);

    res.json({
      sucesso: true,
      quantidade: filmesMatches.length,
      filmes: filmesMatches,
    });
  } catch (erro) {
    console.error("Erro ao buscar a lista de matches:", erro);
    res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🎬 MatchChairs backend rodando na porta ${PORT}`);
});
