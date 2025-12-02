import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import {
    Box, TextField, IconButton, Paper, Typography, Fab
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../context/AuthContext';

// 1. On se connecte au serveur WebSocket (Port 3000)
const socket = io('http://localhost:3000');

export default function ChatWidget() {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<any[]>([]);

    useEffect(() => {
        // 2. ÉCOUTE : Quand le serveur envoie un message
        socket.on('nouveauMessage', (data) => {
            // On ajoute le nouveau message à la liste existante
            setMessages((prev) => [...prev, data]);
        });

        // ÉCOUTE : Historique des messages à la connexion
        socket.on('historiqueMessages', (history) => {
            setMessages(history);
        });

        // Nettoyage quand on quitte la page
        return () => {
            socket.off('nouveauMessage');
            socket.off('historiqueMessages');
        };
    }, []);

    const handleSend = () => {
        if (message.trim() && user) {
            // 3. ENVOI : On envoie le texte au serveur
            socket.emit('sendMessage', {
                text: message,
                sender: user.firstName // On envoie le prénom
            });
            setMessage(''); // On vide le champ
        }
    };

    return (
        <>
            {/* BOUTON FLOTTANT (Bulle de chat) */}
            <Fab
                color="primary"
                aria-label="chat"
                onClick={() => setOpen(!open)}
                sx={{ position: 'fixed', bottom: 20, right: 20 }}
            >
                {open ? <CloseIcon /> : <ChatIcon />}
            </Fab>

            {/* FENÊTRE DE CHAT */}
            {open && (
                <Paper
                    elevation={4}
                    sx={{
                        position: 'fixed', bottom: 90, right: 20, width: 300, height: 400,
                        display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 1000
                    }}
                >
                    {/* En-tête */}
                    <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold">Messagerie Communauté</Typography>
                    </Box>

                    {/* Liste des messages */}
                    <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, bgcolor: '#f5f5f5' }}>
                        {messages.map((msg, index) => (
                            <Box
                                key={index}
                                sx={{
                                    mb: 1,
                                    textAlign: msg.sender === user?.firstName ? 'right' : 'left'
                                }}
                            >
                                <Typography variant="caption" color="text.secondary">
                                    {msg.sender}
                                </Typography>
                                <Paper
                                    sx={{
                                        p: 1,
                                        bgcolor: msg.sender === user?.firstName ? '#e3f2fd' : 'white',
                                        display: 'inline-block',
                                        maxWidth: '80%'
                                    }}
                                >
                                    {msg.text}
                                </Paper>
                            </Box>
                        ))}
                        {messages.length === 0 && (
                            <Typography variant="body2" color="gray" align="center" mt={4}>
                                Aucun message. Dites bonjour ! 👋
                            </Typography>
                        )}
                    </Box>

                    {/* Zone de saisie */}
                    <Box sx={{ p: 1, display: 'flex', gap: 1, borderTop: '1px solid #ddd' }}>
                        <TextField
                            fullWidth size="small" placeholder="Votre message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <IconButton color="primary" onClick={handleSend}>
                            <SendIcon />
                        </IconButton>
                    </Box>
                </Paper>
            )}
        </>
    );
}