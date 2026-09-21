import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MenuInferior from "../components/MenuInferior";

function Curtidos() {
  const [meusLikes, setMeusLikes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Estados para o Vínculo de Casal
  const [codigoParceiro, setCodigoParceiro] = useState("");
  const [meuCodigo, setMeuCodigo] = useState("");

  const navigate = useNavigate();
  const modoEscuro = localStorage.getItem("temaEscuro") !== "false";

  useEffect(() => {
    const buscarDados = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/");

      try {
        // Vai buscar os filmes que EU dei like
        const respostaLikes = await axios.get(
          "http://localhost:3000/meus-votos",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setMeusLikes(respostaLikes.data.filmes || []);
      } catch (erro) {
        console.error("Ainda não tens a rota /meus-votos no Back-end!", erro);
      } finally {
        setCarregando(false);
      }
    };
    buscarDados();
  }, [navigate]);

  const gerarMeuCodigo = async () => {
    try {
      const token = localStorage.getItem("token");
      const resposta = await axios.post(
        "http://localhost:3000/casais/gerar-codigo",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setMeuCodigo(resposta.data.codigo);
      alert(resposta.data.mensagem);
    } catch (erro) {
      alert(erro.response?.data?.erro || "Erro ao gerar código.");
    }
  };

  const vincularConta = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const resposta = await axios.post(
        "http://localhost:3000/casais/vincular",
        { codigo_convite: codigoParceiro },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      alert(resposta.data.mensagem);
      setCodigoParceiro("");
    } catch (erro) {
      alert(erro.response?.data?.erro || "Erro ao vincular conta.");
    }
  };

  const tema = {
    fundo: modoEscuro ? "#020617" : "#f8fafc",
    luz1: modoEscuro ? "#0284c7" : "#38bdf8",
    textoBase: modoEscuro ? "#f8fafc" : "#0f172a",
    textoSecundario: modoEscuro ? "#94a3b8" : "#475569",
    fundoCard: modoEscuro
      ? "rgba(15, 23, 42, 0.6)"
      : "rgba(255, 255, 255, 0.7)",
    borda: modoEscuro ? "rgba(14, 165, 233, 0.2)" : "rgba(255, 255, 255, 0.6)",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: tema.fundo,
        color: tema.textoBase,
        fontFamily: "'Montserrat', sans-serif",
        position: "relative",
        paddingBottom: "90px",
      }}
    >
      <div
        style={{
          position: "fixed",
          top: "0",
          left: "-20%",
          width: "100vw",
          height: "100vw",
          background: tema.luz1,
          filter: "blur(150px)",
          opacity: 0.2,
          borderRadius: "50%",
          zIndex: 0,
          pointerEvents: "none",
        }}
      ></div>

      <header
        style={{
          padding: "20px",
          position: "relative",
          zIndex: 1,
          borderBottom: `1px solid ${tema.borda}`,
          backdropFilter: "blur(10px)",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "28px",
            fontFamily: "'Bebas Neue', sans-serif",
            letterSpacing: "1px",
            textAlign: "center",
          }}
        >
          O que curti 💖
        </h1>
      </header>

      <main style={{ padding: "20px", position: "relative", zIndex: 1 }}>
        {/* Painel de Conexão com o Par */}
        <div
          style={{
            background: tema.fundoCard,
            padding: "20px",
            borderRadius: "20px",
            backdropFilter: "blur(10px)",
            border: `1px solid ${tema.borda}`,
            marginBottom: "30px",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "800",
              marginBottom: "15px",
            }}
          >
            Conectar com o Par 💍
          </h2>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            <button
              onClick={gerarMeuCodigo}
              style={{
                padding: "12px",
                background: "rgba(56, 189, 248, 0.1)",
                color: tema.luz1,
                border: `1px solid ${tema.luz1}`,
                borderRadius: "12px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              {meuCodigo
                ? `O Teu Código: ${meuCodigo}`
                : "Gerar Código de Convite"}
            </button>

            <form
              onSubmit={vincularConta}
              style={{ display: "flex", gap: "10px" }}
            >
              <input
                type="text"
                placeholder="Código do parceiro(a)"
                value={codigoParceiro}
                onChange={(e) =>
                  setCodigoParceiro(e.target.value.toUpperCase())
                }
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "12px",
                  border: `1px solid ${tema.borda}`,
                  background: "rgba(0,0,0,0.2)",
                  color: tema.textoBase,
                  outline: "none",
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "12px 20px",
                  background: tema.luz1,
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Vincular
              </button>
            </form>
          </div>
        </div>

        {/* Lista dos Filmes Curtidos */}
        <h2
          style={{ fontSize: "20px", fontWeight: "800", marginBottom: "15px" }}
        >
          Os meus Likes e SuperLikes
        </h2>

        {carregando ? (
          <p style={{ textAlign: "center", color: tema.textoSecundario }}>
            A carregar a tua lista... ⏳
          </p>
        ) : meusLikes.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              color: tema.textoSecundario,
              padding: "20px",
            }}
          >
            Ainda não curtiste nenhum filme. Vai à aba Explorar!
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
              gap: "10px",
            }}
          >
            {meusLikes.map((filme) => (
              <div
                key={filme.id}
                style={{
                  borderRadius: "12px",
                  overflow: "hidden",
                  background: tema.fundoCard,
                  border: `1px solid ${tema.borda}`,
                  position: "relative",
                }}
              >
                <img
                  src={filme.poster_url}
                  alt={filme.titulo}
                  style={{
                    width: "100%",
                    aspectRatio: "2/3",
                    objectFit: "cover",
                  }}
                />
                {filme.acao === "superlike" && (
                  <div
                    style={{
                      position: "absolute",
                      top: "5px",
                      right: "5px",
                      background: "#3b82f6",
                      color: "#fff",
                      fontSize: "10px",
                      padding: "2px 5px",
                      borderRadius: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    🌟
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <MenuInferior />
    </div>
  );
}

export default Curtidos;
