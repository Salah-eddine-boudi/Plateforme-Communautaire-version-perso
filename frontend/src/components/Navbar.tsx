import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    AppBar, Toolbar, Typography, Box, Button, Tooltip, IconButton, Avatar, Menu, MenuItem, Divider, ListItemIcon
} from '@mui/material';
import { Logout, Person, Settings } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleLogout = () => {
        handleCloseUserMenu();
        logout();
        alert("Vous avez été déconnecté.");
        navigate('/');
    };

    const getInitials = (firstName?: string, lastName?: string) => {
        const first = firstName ? firstName.charAt(0) : '';
        const last = lastName ? lastName.charAt(0) : '';
        return `${first}${last}`.toUpperCase() || '?';
    };

    return (
        <AppBar position="static" sx={{ bgcolor: '#1976d2' }}>
            <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
                <Typography
                    variant="h6"
                    component={Link}
                    to="/"
                    sx={{
                        mr: 2,
                        fontWeight: 'bold',
                        fontSize: { xs: '1rem', sm: '1.25rem' },
                        color: 'inherit',
                        textDecoration: 'none',
                    }}
                >
                    JUNIA COMMUNITY
                </Typography>

                <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 2 }}>
                    <Button sx={{ color: 'white', display: 'block' }} component={Link} to="/">
                        Accueil
                    </Button>
                    <Button sx={{ color: 'white', display: 'block' }} onClick={() => alert('Bientôt disponible !')}>
                        Ressources
                    </Button>
                    <Button sx={{ color: 'white', display: 'block' }} onClick={() => alert('Bientôt disponible !')}>
                        Événements
                    </Button>
                </Box>

                {user ? (
                    <Box sx={{ flexGrow: 0 }}>
                        <Tooltip title="Ouvrir les paramètres">
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                <Avatar sx={{ bgcolor: 'orange' }}>
                                    {getInitials(user.firstName, user.lastName)}
                                </Avatar>
                            </IconButton>
                        </Tooltip>
                        <Menu
                            sx={{ mt: '45px' }}
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                            keepMounted
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                        >
                            <Box sx={{ px: 2, py: 1 }}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    {user.firstName} {user.lastName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" noWrap>
                                    {user.email}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                    Membre
                                </Typography>
                            </Box>
                            <Divider />
                            <MenuItem onClick={handleCloseUserMenu}>
                                <ListItemIcon>
                                    <Person fontSize="small" />
                                </ListItemIcon>
                                Mon Profil
                            </MenuItem>
                            <MenuItem onClick={handleCloseUserMenu}>
                                <ListItemIcon>
                                    <Settings fontSize="small" />
                                </ListItemIcon>
                                Paramètres
                            </MenuItem>
                            <Divider />
                            <MenuItem onClick={handleLogout}>
                                <ListItemIcon>
                                    <Logout fontSize="small" />
                                </ListItemIcon>
                                Se déconnecter
                            </MenuItem>
                        </Menu>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button color="inherit" component={Link} to="/login">
                            Se connecter
                        </Button>
                        <Button variant="contained" color="secondary" component={Link} to="/register">
                            S'inscrire
                        </Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
}
