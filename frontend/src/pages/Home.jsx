import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const [modoEscuro, setModoEscuro] = useState(() => {
    return localStorage.getItem("temaEscuro") !== "false"; // Agora o escuro (cinema) é o padrão!
  });

  useEffect(() => {
    localStorage.setItem("temaEscuro", modoEscuro);
  }, [modoEscuro]);

  const [modalAberto, setModalAberto] = useState(false);
  const [tipoModal, setTipoModal] = useState("login");
  const [carregando, setCarregando] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const abrirModal = (tipo) => {
    setTipoModal(tipo);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setNome("");
    setEmail("");
    setSenha("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    try {
      if (tipoModal === "login") {
        const resposta = await axios.post("http://localhost:3000/login", {
          email,
          senha,
        });
        localStorage.setItem("token", resposta.data.token);
        navigate("/filmes");
      } else {
        await axios.post("http://localhost:3000/usuarios", {
          nome,
          email,
          senha,
        });
        const resposta = await axios.post("http://localhost:3000/login", {
          email,
          senha,
        });
        localStorage.setItem("token", resposta.data.token);
        navigate("/filmes");
      }
    } catch (erro) {
      console.error("Erro na autenticação:", erro);
      alert(
        erro.response
          ? erro.response.data.erro
          : "Erro ao conectar com o servidor",
      );
    } finally {
      setCarregando(false);
    }
  };

  // Paleta "Cinema Noturno" & "Sessão da Tarde"
  const tema = {
    fundo: modoEscuro ? "#020617" : "#f8fafc", // Fundo super escuro vs Cinza gelo
    luz1: modoEscuro ? "#0284c7" : "#38bdf8", // Luz projetor Azul
    luz2: modoEscuro ? "#0d9488" : "#2dd4bf", // Luz projetor Verde Água
    fundoVidro: modoEscuro
      ? "rgba(15, 23, 42, 0.4)"
      : "rgba(255, 255, 255, 0.5)",
    bordaVidro: modoEscuro
      ? "rgba(14, 165, 233, 0.2)"
      : "rgba(255, 255, 255, 0.6)",
    textoBase: modoEscuro ? "#f8fafc" : "#0f172a",
    textoSecundario: modoEscuro ? "#94a3b8" : "#475569",
    corDestaque: modoEscuro ? "#38bdf8" : "#0284c7",
    inputFundo: modoEscuro ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.7)",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: tema.fundo,
        color: tema.textoBase,
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Montserrat', sans-serif",
        transition: "background-color 0.5s ease",
        position: "relative",
        overflow: "hidden", // Garante que as luzes desfocadas não criem rolagem
      }}
    >
      {/* Luzes de Fundo (Para o Vidro Fosco dar efeito) */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "-10%",
          width: "50vw",
          height: "50vw",
          background: tema.luz1,
          filter: "blur(150px)",
          opacity: 0.4,
          borderRadius: "50%",
          zIndex: 0,
          pointerEvents: "none",
        }}
      ></div>
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          right: "-10%",
          width: "50vw",
          height: "50vw",
          background: tema.luz2,
          filter: "blur(150px)",
          opacity: 0.3,
          borderRadius: "50%",
          zIndex: 0,
          pointerEvents: "none",
        }}
      ></div>

      {/* Todo o conteúdo precisa ficar acima das luzes de fundo (zIndex: 1) */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        {/* Cabeçalho Flexível (Mobile-First: usa padding em % para adaptar na tela) */}
        <header
          style={{
            padding: "20px 5%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "15px",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "32px",
              fontFamily: "'Bebas Neue', sans-serif",
              letterSpacing: "2px",
              color: tema.corDestaque,
              textShadow: "0 2px 10px rgba(0,0,0,0.3)",
            }}
          >
            MatchChairs 🍿
          </h1>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              onClick={() => setModoEscuro(!modoEscuro)}
              style={{
                background: "none",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
                padding: "5px",
              }}
            >
              {modoEscuro ? "☀️" : "🌙"}
            </button>
            <button
              onClick={() => abrirModal("login")}
              style={{
                background: "none",
                border: "none",
                color: tema.textoBase,
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "15px",
                padding: "8px",
              }}
            >
              Entrar
            </button>
            <button
              onClick={() => abrirModal("cadastro")}
              style={{
                background: tema.corDestaque,
                color: "#FFF",
                border: "none",
                padding: "10px 20px",
                borderRadius: "25px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "15px",
                boxShadow: `0 4px 15px ${tema.corDestaque}50`,
              }}
            >
              Criar Conta
            </button>
          </div>
        </header>

        {/* Apresentação Principal */}
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            padding: "40px 5%",
          }}
        >
          <div
            style={{
              background: tema.fundoVidro,
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: `1px solid ${tema.bordaVidro}`,
              borderRadius: "30px",
              padding: "40px 20px",
              maxWidth: "700px",
              width: "100%",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
          >
            <h2
              style={{
                fontSize: "clamp(40px, 8vw, 70px)",
                fontFamily: "'Bebas Neue', sans-serif",
                letterSpacing: "2px",
                marginBottom: "15px",
                lineHeight: "0.9",
                textTransform: "uppercase",
              }}
            >
              O fim das discussões
              <br />
              <span style={{ color: tema.corDestaque }}>na hora do filme.</span>
            </h2>
            <p
              style={{
                fontSize: "clamp(14px, 4vw, 18px)",
                color: tema.textoSecundario,
                marginBottom: "35px",
                lineHeight: "1.6",
                fontWeight: "400",
                maxWidth: "500px",
                margin: "0 auto 35px",
              }}
            >
              Conecte-se com seu parceiro, deslize pelos sucessos do cinema e
              deixe o MatchChairs revelar quando vocês derem "Gostei" no mesmo
              filme.
            </p>
            <button
              onClick={() => abrirModal("cadastro")}
              style={{
                padding: "18px 40px",
                fontSize: "18px",
                background: tema.corDestaque,
                color: "#FFF",
                border: "none",
                borderRadius: "40px",
                cursor: "pointer",
                fontWeight: "800",
                textTransform: "uppercase",
                letterSpacing: "1px",
                boxShadow: `0 8px 25px ${tema.corDestaque}60`,
                transition: "all 0.3s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.transform = "translateY(-3px)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              Descubra Agora
            </button>
          </div>
        </main>
      </div>

      {/* Modal Flutuante de Autenticação */}
      {modalAberto && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10,
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "420px",
              background: tema.fundoVidro,
              backdropFilter: "blur(25px)",
              WebkitBackdropFilter: "blur(25px)",
              borderRadius: "24px",
              padding: "40px 30px",
              border: `1px solid ${tema.bordaVidro}`,
              position: "relative",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            }}
          >
            <button
              onClick={fecharModal}
              style={{
                position: "absolute",
                top: "15px",
                right: "20px",
                background: "none",
                border: "none",
                fontSize: "24px",
                color: tema.textoSecundario,
                cursor: "pointer",
              }}
            >
              ✖
            </button>

            <h2
              style={{
                textAlign: "center",
                marginBottom: "30px",
                fontSize: "32px",
                fontFamily: "'Bebas Neue', sans-serif",
                letterSpacing: "1px",
                color: tema.corDestaque,
              }}
            >
              {tipoModal === "login" ? "Bilheteria" : "Garantir Ingresso"}
            </h2>

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              {tipoModal === "cadastro" && (
                <input
                  type="text"
                  placeholder="Seu nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    border: `1px solid ${tema.bordaVidro}`,
                    background: tema.inputFundo,
                    color: tema.textoBase,
                    outline: "none",
                    fontSize: "15px",
                    fontFamily: "'Montserrat', sans-serif",
                    transition: "all 0.3s",
                  }}
                />
              )}

              <input
                type="email"
                placeholder="Seu melhor e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  border: `1px solid ${tema.bordaVidro}`,
                  background: tema.inputFundo,
                  color: tema.textoBase,
                  outline: "none",
                  fontSize: "15px",
                  fontFamily: "'Montserrat', sans-serif",
                  transition: "all 0.3s",
                }}
              />

              <input
                type="password"
                placeholder="Sua senha secreta"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  border: `1px solid ${tema.bordaVidro}`,
                  background: tema.inputFundo,
                  color: tema.textoBase,
                  outline: "none",
                  fontSize: "15px",
                  fontFamily: "'Montserrat', sans-serif",
                  transition: "all 0.3s",
                }}
              />

              <button
                type="submit"
                disabled={carregando}
                style={{
                  padding: "16px",
                  fontSize: "16px",
                  background: tema.corDestaque,
                  color: "#FFF",
                  border: "none",
                  borderRadius: "12px",
                  cursor: carregando ? "not-allowed" : "pointer",
                  fontWeight: "800",
                  marginTop: "10px",
                  opacity: carregando ? 0.7 : 1,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                {carregando
                  ? "Conectando... ⏳"
                  : tipoModal === "login"
                    ? "Entrar"
                    : "Cadastrar"}
              </button>
            </form>

            <div
              style={{
                textAlign: "center",
                marginTop: "25px",
                fontSize: "14px",
                color: tema.textoSecundario,
              }}
            >
              {tipoModal === "login"
                ? "Primeira vez aqui? "
                : "Já tem seu ingresso? "}
              <button
                onClick={() =>
                  setTipoModal(tipoModal === "login" ? "cadastro" : "login")
                }
                style={{
                  background: "none",
                  border: "none",
                  color: tema.corDestaque,
                  cursor: "pointer",
                  fontWeight: "800",
                  padding: "0",
                  marginLeft: "5px",
                }}
              >
                {tipoModal === "login" ? "Criar conta" : "Fazer login"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
