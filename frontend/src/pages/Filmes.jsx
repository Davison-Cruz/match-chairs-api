import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MenuInferior from "../components/MenuInferior";

function Filmes() {
  const [filmes, setFilmes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [votoAtual, setVotoAtual] = useState(""); // 'like', 'pass' ou 'superlike'
  const [direcaoAnimacao, setDirecaoAnimacao] = useState(""); // 'direita', 'esquerda' ou 'cima'
  const [animando, setAnimando] = useState(false);
  const [detalhesAbertos, setDetalhesAbertos] = useState(false);

  const navigate = useNavigate();
  const modoEscuro = localStorage.getItem("temaEscuro") !== "false";

  const buscarFilmes = async () => {
    setCarregando(true);
    const token = localStorage.getItem("token");
    if (!token) return navigate("/");

    try {
      const resposta = await axios.get("http://localhost:3000/filmes/em-alta", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resposta.data.filmes) setFilmes(resposta.data.filmes);
      else if (resposta.data.results) setFilmes(resposta.data.results);
      else if (Array.isArray(resposta.data)) setFilmes(resposta.data);
    } catch (erro) {
      localStorage.removeItem("token");
      navigate("/");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarFilmes();
  }, [navigate]);

  // Atualizado para aceitar o tipo exato de ação
  const handleVoto = async (tipoAcao) => {
    if (animando) return;

    const filmeAtual = filmes[0];
    if (!filmeAtual) return;

    setAnimando(true);
    setVotoAtual(tipoAcao);

    setTimeout(() => {
      // Define a direção: Gostei (Direita), Passar (Esquerda), SuperLike (Cima)
      setDirecaoAnimacao(
        tipoAcao === "like"
          ? "direita"
          : tipoAcao === "pass"
            ? "esquerda"
            : "cima",
      );

      setTimeout(async () => {
        setFilmes((listaAtual) => listaAtual.slice(1));

        setVotoAtual("");
        setDirecaoAnimacao("");
        setAnimando(false);
        setDetalhesAbertos(false);

        try {
          const token = localStorage.getItem("token");
          await axios.post(
            "http://localhost:3000/votos",
            {
              filme_id: filmeAtual.id,
              acao: tipoAcao, // Envia 'like', 'pass' ou 'superlike'
            },
            { headers: { Authorization: `Bearer ${token}` } },
          );
        } catch (erro) {
          console.error("Erro ao salvar voto:", erro);
        }
      }, 400);
    }, 800);
  };

  const tema = {
    fundo: modoEscuro ? "#020617" : "#f8fafc",
    luz1: modoEscuro ? "#0284c7" : "#38bdf8",
    luz2: modoEscuro ? "#0d9488" : "#2dd4bf",
    fundoVidro: modoEscuro
      ? "rgba(15, 23, 42, 0.6)"
      : "rgba(255, 255, 255, 0.7)",
    bordaVidro: modoEscuro
      ? "rgba(14, 165, 233, 0.2)"
      : "rgba(255, 255, 255, 0.6)",
    textoBase: modoEscuro ? "#f8fafc" : "#0f172a",
    textoSecundario: modoEscuro ? "#94a3b8" : "#475569",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: tema.fundo,
        color: tema.textoBase,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "'Montserrat', sans-serif",
        position: "relative",
        overflow: "hidden",
        paddingBottom: "80px",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "0",
          left: "-20%",
          width: "60vw",
          height: "60vw",
          background: tema.luz1,
          filter: "blur(150px)",
          opacity: 0.3,
          borderRadius: "50%",
          zIndex: 0,
          pointerEvents: "none",
        }}
      ></div>
      <div
        style={{
          position: "absolute",
          bottom: "0",
          right: "-20%",
          width: "60vw",
          height: "60vw",
          background: tema.luz2,
          filter: "blur(150px)",
          opacity: 0.2,
          borderRadius: "50%",
          zIndex: 0,
          pointerEvents: "none",
        }}
      ></div>

      <header
        style={{
          width: "100%",
          padding: "20px",
          display: "flex",
          justifyContent: "space-between",
          zIndex: 1,
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${tema.bordaVidro}`,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "22px",
            fontFamily: "'Bebas Neue', sans-serif",
            letterSpacing: "1px",
            color: tema.textoBase,
          }}
        >
          MatchChairs
        </h1>
      </header>

      <main
        style={{
          flex: 1,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
          zIndex: 1,
        }}
      >
        {carregando ? (
          <h2 style={{ fontSize: "20px", color: tema.textoSecundario }}>
            A preparar a sessão... 🍿
          </h2>
        ) : filmes.length > 0 ? (
          <div
            style={{ position: "relative", width: "100%", maxWidth: "380px" }}
          >
            {filmes
              .slice(0, 2)
              .reverse()
              .map((filme) => {
                const isTop = filme.id === filmes[0].id;

                return (
                  <div
                    key={filme.id}
                    style={{
                      position: isTop ? "relative" : "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      zIndex: isTop ? 10 : 1,
                      background: tema.fundoVidro,
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                      borderRadius: "24px",
                      padding: "16px",
                      border: `1px solid ${tema.bordaVidro}`,
                      boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                      display: "flex",
                      flexDirection: "column",

                      // Adicionada a direção CIMA (translateY(-120%)) para o SuperLike
                      transform: isTop
                        ? direcaoAnimacao === "direita"
                          ? "translateX(120%) rotate(15deg)"
                          : direcaoAnimacao === "esquerda"
                            ? "translateX(-120%) rotate(-15deg)"
                            : direcaoAnimacao === "cima"
                              ? "translateY(-120%) rotate(0deg)"
                              : "translateX(0) rotate(0)"
                        : "scale(0.95) translateY(20px)",

                      opacity: isTop ? (direcaoAnimacao ? 0.5 : 1) : 0.6,
                      transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
                      pointerEvents: isTop ? "auto" : "none",
                    }}
                  >
                    {isTop && detalhesAbertos && (
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: modoEscuro
                            ? "rgba(15, 23, 42, 0.98)"
                            : "rgba(255, 255, 255, 0.98)",
                          zIndex: 10,
                          padding: "24px",
                          display: "flex",
                          flexDirection: "column",
                          overflowY: "auto",
                          backdropFilter: "blur(15px)",
                          borderRadius: "24px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: "20px",
                          }}
                        >
                          <h3
                            style={{
                              fontSize: "18px",
                              fontWeight: "900",
                              color: tema.textoSecundario,
                              textTransform: "uppercase",
                            }}
                          >
                            Mais Detalhes
                          </h3>
                          <button
                            onClick={() => setDetalhesAbertos(false)}
                            style={{
                              background: "rgba(255,255,255,0.1)",
                              border: "none",
                              borderRadius: "50%",
                              width: "35px",
                              height: "35px",
                              fontSize: "16px",
                              color: tema.textoBase,
                              cursor: "pointer",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            ✖
                          </button>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: "15px",
                            marginBottom: "20px",
                          }}
                        >
                          <img
                            src={filme.poster_url}
                            alt="Póster"
                            style={{
                              width: "100px",
                              borderRadius: "12px",
                              boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
                              objectFit: "cover",
                            }}
                          />
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                            }}
                          >
                            <h2
                              style={{
                                fontSize: "20px",
                                fontWeight: "800",
                                marginBottom: "8px",
                                color: tema.textoBase,
                                lineHeight: "1.2",
                              }}
                            >
                              {filme.titulo}
                            </h2>
                            <span
                              style={{
                                alignSelf: "flex-start",
                                background: "#eab308",
                                color: "#000",
                                padding: "4px 10px",
                                borderRadius: "8px",
                                fontWeight: "bold",
                                fontSize: "14px",
                              }}
                            >
                              ⭐ {filme.nota ? filme.nota.toFixed(1) : "N/A"}
                            </span>
                          </div>
                        </div>
                        <h4
                          style={{
                            fontSize: "16px",
                            fontWeight: "bold",
                            marginBottom: "8px",
                            color: tema.textoBase,
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
                          {filme.sinopse || "Nenhuma sinopse disponível."}
                        </p>
                      </div>
                    )}

                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "2/3",
                        maxHeight: "50vh",
                        borderRadius: "16px",
                        overflow: "hidden",
                        marginBottom: "16px",
                        backgroundColor: "rgba(0,0,0,0.5)",
                      }}
                    >
                      <img
                        src={filme.poster_url}
                        alt={filme.titulo}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />

                      {/* CARIMBOS DE VOTO */}
                      {isTop && votoAtual === "like" && (
                        <div
                          style={{
                            position: "absolute",
                            top: "20px",
                            left: "20px",
                            border: "6px solid #22c55e",
                            color: "#22c55e",
                            padding: "5px 15px",
                            borderRadius: "12px",
                            fontSize: "32px",
                            fontWeight: "900",
                            transform: "rotate(-15deg)",
                            backgroundColor: "rgba(0,0,0,0.6)",
                            textShadow: "0 2px 4px rgba(0,0,0,0.8)",
                          }}
                        >
                          GOSTEI
                        </div>
                      )}
                      {isTop && votoAtual === "pass" && (
                        <div
                          style={{
                            position: "absolute",
                            top: "20px",
                            right: "20px",
                            border: "6px solid #ef4444",
                            color: "#ef4444",
                            padding: "5px 15px",
                            borderRadius: "12px",
                            fontSize: "32px",
                            fontWeight: "900",
                            transform: "rotate(15deg)",
                            backgroundColor: "rgba(0,0,0,0.6)",
                            textShadow: "0 2px 4px rgba(0,0,0,0.8)",
                          }}
                        >
                          PASSEI
                        </div>
                      )}
                      {isTop && votoAtual === "superlike" && (
                        <div
                          style={{
                            position: "absolute",
                            bottom: "20px",
                            left: "50%",
                            transform: "translateX(-50%) rotate(-5deg)",
                            border: "6px solid #3b82f6",
                            color: "#3b82f6",
                            padding: "5px 15px",
                            borderRadius: "12px",
                            fontSize: "28px",
                            fontWeight: "900",
                            backgroundColor: "rgba(0,0,0,0.6)",
                            textShadow: "0 2px 4px rgba(0,0,0,0.8)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          SUPER LIKE 🌟
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "8px",
                      }}
                    >
                      <h2
                        style={{
                          fontSize: "22px",
                          fontWeight: "800",
                          lineHeight: "1.2",
                          flex: 1,
                          paddingRight: "10px",
                        }}
                      >
                        {filme.titulo}
                      </h2>
                      <button
                        onClick={() => setDetalhesAbertos(true)}
                        style={{
                          background: tema.luz1,
                          color: "#fff",
                          border: "none",
                          borderRadius: "50%",
                          width: "30px",
                          height: "30px",
                          cursor: "pointer",
                          fontWeight: "bold",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          flexShrink: 0,
                        }}
                      >
                        ℹ️
                      </button>
                    </div>

                    <p
                      style={{
                        fontSize: "13px",
                        color: tema.textoSecundario,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        marginBottom: "20px",
                      }}
                    >
                      {filme.sinopse || "Sem resumo."}
                    </p>

                    {/* TRÊS BOTÕES AGORA */}
                    <div
                      style={{ display: "flex", gap: "8px", marginTop: "auto" }}
                    >
                      <button
                        onClick={() => handleVoto("pass")}
                        disabled={animando}
                        style={{
                          flex: 1,
                          padding: "12px 5px",
                          borderRadius: "14px",
                          border: "none",
                          background: "rgba(239, 68, 68, 0.1)",
                          color: "#ef4444",
                          borderBottom: "2px solid #ef4444",
                          fontWeight: "800",
                          cursor: animando ? "default" : "pointer",
                          fontSize: "13px",
                          textTransform: "uppercase",
                        }}
                      >
                        ✖ Passar
                      </button>
                      <button
                        onClick={() => handleVoto("superlike")}
                        disabled={animando}
                        style={{
                          flex: 1,
                          padding: "12px 5px",
                          borderRadius: "14px",
                          border: "none",
                          background: "rgba(59, 130, 246, 0.1)",
                          color: "#3b82f6",
                          borderBottom: "2px solid #3b82f6",
                          fontWeight: "800",
                          cursor: animando ? "default" : "pointer",
                          fontSize: "13px",
                          textTransform: "uppercase",
                        }}
                      >
                        🌟 Super
                      </button>
                      <button
                        onClick={() => handleVoto("like")}
                        disabled={animando}
                        style={{
                          flex: 1,
                          padding: "12px 5px",
                          borderRadius: "14px",
                          border: "none",
                          background: "rgba(34, 197, 94, 0.1)",
                          color: "#22c55e",
                          borderBottom: "2px solid #22c55e",
                          fontWeight: "800",
                          cursor: animando ? "default" : "pointer",
                          fontSize: "13px",
                          textTransform: "uppercase",
                        }}
                      >
                        ❤️ Gostei
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              background: tema.fundoVidro,
              padding: "40px 20px",
              borderRadius: "24px",
              backdropFilter: "blur(20px)",
              border: `1px solid ${tema.bordaVidro}`,
            }}
          >
            <h2 style={{ fontSize: "24px", marginBottom: "10px" }}>
              Fim da Sessão! 🎬
            </h2>
            <p style={{ color: tema.textoSecundario, marginBottom: "20px" }}>
              Já avaliaste todos os filmes desta página.
            </p>
            <button
              onClick={buscarFilmes}
              style={{
                padding: "12px 24px",
                borderRadius: "30px",
                background: tema.luz1,
                color: "#fff",
                border: "none",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Procurar mais filmes
            </button>
          </div>
        )}
      </main>
      <MenuInferior />
    </div>
  );
}

export default Filmes;
