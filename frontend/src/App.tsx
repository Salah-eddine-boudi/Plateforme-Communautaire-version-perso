import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import ChatWidget from './components/ChatWidget';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Route par défaut (Accueil) */}
          <Route path="/" element={<Home />} />

          {/* Route Inscription */}
          <Route path="/register" element={<Register />} />

          {/* Route Connexion */}
          <Route path="/login" element={<Login />} />
        </Routes>

        {/* LE CHAT EST ICI, HORS DES ROUTES (Toujours visible) */}
        <ChatWidget />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
