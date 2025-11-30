import { useState, type FormEvent, type ChangeEvent } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography, Box, Paper, Alert, Link as MuiLink, Avatar } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        try {
            // 1. Appel au backend pour se connecter
            const response = await axios.post('http://localhost:3000/auth/login', formData);

            // 2. Récupérer le token
            const { access_token } = response.data;

            // 3. Sauvegarder le token
            localStorage.setItem('access_token', access_token);

            // 4. Récupérer les infos de l'utilisateur
            const config = {
                headers: { Authorization: `Bearer ${access_token}` }
            };

            const profileResponse = await axios.get('http://localhost:3000/auth/profile', config);
            const user = profileResponse.data;

            // 5. Sauvegarder l'utilisateur pour l'UI
            localStorage.setItem('user', JSON.stringify(user));

            // 6. Redirection vers l'accueil
            alert(`Ravi de vous revoir, ${user.firstName} !`);
            navigate('/');

        } catch (err: any) {
            console.error("Login error:", err);
            if (err.response && err.response.status === 401) {
                setError("Email ou mot de passe incorrect.");
            } else {
                setError("Une erreur est survenue. Vérifiez que le serveur est lancé.");
            }
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
                        Connexion
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Adresse Email"
                            name="email"
                            type="email"
                            autoFocus
                            value={formData.email}
                            onChange={handleChange}
                            variant="outlined"
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Mot de passe"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            variant="outlined"
                        />

                        {error && (
                            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                                {error}
                            </Alert>
                        )}

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold' }}
                        >
                            Se connecter
                        </Button>

                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <MuiLink component={Link} to="/register" variant="body2" underline="hover">
                                {"Pas encore de compte ? S'inscrire"}
                            </MuiLink>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );

}
