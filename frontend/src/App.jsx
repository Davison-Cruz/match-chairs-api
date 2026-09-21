import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Filmes from "./pages/Filmes";
import Matches from "./pages/Matches";
import Curtidos from "./pages/Curtidos";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/filmes" element={<Filmes />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/curtidos" element={<Curtidos />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
