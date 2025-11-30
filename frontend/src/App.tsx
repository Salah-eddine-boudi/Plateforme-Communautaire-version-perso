import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route par défaut (Accueil) */}
        <Route path="/" element={<Home />} />

        {/* Route Inscription */}
        <Route path="/register" element={<Register />} />

        {/* Route Connexion */}
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
