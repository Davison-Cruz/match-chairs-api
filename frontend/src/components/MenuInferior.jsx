import { useNavigate, useLocation } from "react-router-dom";

function MenuInferior() {
  const navigate = useNavigate();
  const location = useLocation();
  const modoEscuro = localStorage.getItem("temaEscuro") !== "false";

  const tema = {
    fundo: modoEscuro ? "rgba(15, 23, 42, 0.85)" : "rgba(255, 255, 255, 0.85)",
    borda: modoEscuro ? "rgba(14, 165, 233, 0.2)" : "rgba(14, 165, 233, 0.3)",
    textoAtivo: modoEscuro ? "#38bdf8" : "#0284c7",
    textoInativo: modoEscuro ? "#64748b" : "#94a3b8",
  };

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: tema.fundo,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: `1px solid ${tema.borda}`,
        display: "flex",
        justifyContent: "space-around",
        padding: "15px 10px",
        paddingBottom: "max(15px, env(safe-area-inset-bottom))",
        zIndex: 100,
      }}
    >
      <button
        onClick={() => navigate("/filmes")}
        style={{
          background: "none",
          border: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "5px",
          cursor: "pointer",
          color:
            location.pathname === "/filmes"
              ? tema.textoAtivo
              : tema.textoInativo,
          fontWeight: "bold",
        }}
      >
        <span style={{ fontSize: "24px" }}>🎬</span>
        <span style={{ fontSize: "11px", textTransform: "uppercase" }}>
          Explorar
        </span>
      </button>

      <button
        onClick={() => navigate("/matches")}
        style={{
          background: "none",
          border: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "5px",
          cursor: "pointer",
          color:
            location.pathname === "/matches"
              ? tema.textoAtivo
              : tema.textoInativo,
          fontWeight: "bold",
        }}
      >
        <span style={{ fontSize: "24px" }}>🍿</span>
        <span style={{ fontSize: "11px", textTransform: "uppercase" }}>
          Matches
        </span>
      </button>

      <button
        onClick={() => navigate("/curtidos")}
        style={{
          background: "none",
          border: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "5px",
          cursor: "pointer",
          color:
            location.pathname === "/curtidos"
              ? tema.textoAtivo
              : tema.textoInativo,
          fontWeight: "bold",
        }}
      >
        <span style={{ fontSize: "24px" }}>💖</span>
        <span style={{ fontSize: "11px", textTransform: "uppercase" }}>
          Curtidos
        </span>
      </button>
    </nav>
  );
}

export default MenuInferior;
