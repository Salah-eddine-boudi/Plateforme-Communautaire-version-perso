import { useState, type ChangeEvent, type FormEvent } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography, Box, Paper, Alert, Avatar, Link as MuiLink } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate, Link } from 'react-router-dom';

interface RegisterFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  bio: string;
}

export default function Register() {
  const navigate = useNavigate();

  // Les données du formulaire
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    bio: ''
  });

  const [error, setError] = useState('');

  // Quand on écrit dans un champ
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Quand on clique sur "S'inscrire"
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Empêche la page de se recharger
    try {
      // On envoie les données au Backend
      await axios.post('http://localhost:3000/users', {
        ...formData,
        role: 'member', // Par défaut, on inscrit des membres
        skills: [] // On pourra gérer les compétences plus tard
      });

      // Si ça marche, on retourne à l'accueil
      alert("Inscription réussie ! Bienvenue dans la communauté.");
      navigate('/');
    } catch {
      setError("Erreur lors de l'inscription. L'email est peut-être déjà pris.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f0f2f5',
      }}
    >
      <Container component="main" maxWidth="xs">
        <Paper
          elevation={6}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2,
            width: '100%'
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
            Rejoindre la Communauté
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                margin="normal" required fullWidth label="Prénom"
                name="firstName" autoFocus
                value={formData.firstName}
                onChange={handleChange}
                variant="outlined"
              />
              <TextField
                margin="normal" required fullWidth label="Nom"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                variant="outlined"
              />
            </Box>
            <TextField
              margin="normal" required fullWidth label="Adresse Email"
              name="email" type="email"
              value={formData.email}
              onChange={handleChange}
              variant="outlined"
            />
            <TextField
              margin="normal" required fullWidth label="Mot de passe"
              name="password" type="password"
              value={formData.password}
              onChange={handleChange}
              variant="outlined"
            />
            <TextField
              margin="normal" fullWidth label="Petite bio (optionnel)"
              name="bio" multiline rows={3}
              value={formData.bio}
              onChange={handleChange}
              variant="outlined"
            />

            {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold' }}
            >
              Envoyer ma demande
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <MuiLink component={Link} to="/login" variant="body2" underline="hover">
                {"Déjà un compte ? Se connecter"}
              </MuiLink>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
