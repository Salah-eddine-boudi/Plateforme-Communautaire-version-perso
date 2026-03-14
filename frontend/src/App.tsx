import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import ChatWidget from './components/ChatWidget';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import CalendarPage from './pages/CalendarPage';

const theme = createTheme({
  palette: { mode: 'light' },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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

          {/* Route Calendrier */}
          <Route path="/calendar" element={<CalendarPage />} />
        </Routes>

        {/* LE CHAT EST ICI, HORS DES ROUTES (Toujours visible) */}
        <ChatWidget />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
