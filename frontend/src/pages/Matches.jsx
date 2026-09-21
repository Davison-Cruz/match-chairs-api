import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MenuInferior from "../components/MenuInferior";

// Função para calcular o "Há quanto tempo"
const calcularTempo = (dataISO) => {
  if (!dataISO) return "";
  const dataMatch = new Date(dataISO);
  const diffMs = new Date() - dataMatch;
  const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDias = Math.floor(diffHoras / 24);

  if (diffDias > 0) return `Há ${diffDias} dia${diffDias > 1 ? "s" : ""}`;
  if (diffHoras > 0) return `Há ${diffHoras} hora${diffHoras > 1 ? "s" : ""}`;
  return "Match recente! 🔥";
};

function Matches() {
  const [matches, setMatches] = useState([]);
  const [status, setStatus] = useState({
    carregando: true,
    mensagem: "",
    erro: false,
  });
  const [filmeExpandido, setFilmeExpandido] = useState(null); // Estado do Modal

  const navigate = useNavigate();
  const modoEscuro = localStorage.getItem("temaEscuro") !== "false";

  useEffect(() => {
    const buscarMatches = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/");

      try {
        const resposta = await axios.get("http://localhost:3000/matches", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMatches(resposta.data.filmes || []);
        setStatus({
          carregando: false,
          mensagem: resposta.data.mensagem || "",
          erro: false,
        });
      } catch (erro) {
        setStatus({
          carregando: false,
          mensagem: erro.response?.data?.erro || "Erro ao carregar.",
          erro: true,
        });
      }
    };
    buscarMatches();
  }, [navigate]);

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
          A Vossa Lista 🍿
        </h1>
      </header>

      <main style={{ padding: "20px", position: "relative", zIndex: 1 }}>
        {status.carregando ? (
          <p
            style={{
              textAlign: "center",
              color: tema.textoSecundario,
              marginTop: "50px",
            }}
          >
            A procurar as vossas combinações... ⏳
          </p>
        ) : status.erro || matches.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              marginTop: "50px",
              background: tema.fundoCard,
              padding: "30px",
              borderRadius: "20px",
              backdropFilter: "blur(10px)",
              border: `1px solid ${tema.borda}`,
            }}
          >
            <h3 style={{ fontSize: "20px", marginBottom: "10px" }}>
              {status.erro ? "Sem Vínculo 💔" : "Nenhum Match Ainda 🎬"}
            </h3>
            <p style={{ color: tema.textoSecundario, lineHeight: "1.5" }}>
              {status.mensagem}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: "15px",
            }}
          >
            {matches.map((filme) => (
              <div
                key={filme.id}
                onClick={() => setFilmeExpandido(filme)} // Ao clicar, abre o modal
                style={{
                  borderRadius: "12px",
                  overflow: "hidden",
                  background: tema.fundoCard,
                  border: `1px solid ${tema.borda}`,
                  boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
                  cursor: "pointer",
                  transition: "transform 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.transform = "scale(1.03)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                <div style={{ position: "relative" }}>
                  <img
                    src={filme.poster_url}
                    alt={filme.titulo}
                    style={{
                      width: "100%",
                      aspectRatio: "2/3",
                      objectFit: "cover",
                    }}
                  />
                  {/* Etiqueta de Tempo Decorrido no canto do póster */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "8px",
                      right: "8px",
                      background: "rgba(0,0,0,0.7)",
                      color: "#fff",
                      fontSize: "10px",
                      padding: "4px 8px",
                      borderRadius: "10px",
                      fontWeight: "bold",
                    }}
                  >
                    {calcularTempo(filme.data_match)}
                  </div>
                </div>
                <div style={{ padding: "12px" }}>
                  <h4
                    style={{
                      fontSize: "13px",
                      fontWeight: "bold",
                      margin: 0,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {filme.titulo}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL DO FILME EXPANDIDO */}
      {filmeExpandido && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            zIndex: 200,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              background: tema.fundoCard,
              width: "100%",
              maxWidth: "400px",
              borderRadius: "24px",
              border: `1px solid ${tema.borda}`,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              maxHeight: "80vh",
            }}
          >
            <div style={{ position: "relative" }}>
              <img
                src={filmeExpandido.poster_url}
                alt="Poster"
                style={{ width: "100%", height: "250px", objectFit: "cover" }}
              />
              <button
                onClick={() => setFilmeExpandido(null)}
                style={{
                  position: "absolute",
                  top: "15px",
                  right: "15px",
                  background: "rgba(0,0,0,0.5)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "50%",
                  width: "35px",
                  height: "35px",
                  fontSize: "16px",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                ✖
              </button>
            </div>

            <div style={{ padding: "20px", overflowY: "auto" }}>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "900",
                  marginBottom: "5px",
                }}
              >
                {filmeExpandido.titulo}
              </h2>
              <p
                style={{
                  fontSize: "12px",
                  color: "#22c55e",
                  fontWeight: "bold",
                  marginBottom: "15px",
                }}
              >
                Deu Match {calcularTempo(filmeExpandido.data_match)}
              </p>

              <h4
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  marginBottom: "8px",
                }}
              >
                Sinopse
              </h4>
              <p
                style={{
                  fontSize: "14px",
                  lineHeight: "1.6",
                  color: tema.textoSecundario,
                }}
              >
                {filmeExpandido.sinopse}
              </p>
            </div>
          </div>
        </div>
      )}

      <MenuInferior />
    </div>
  );
}

export default Matches;
