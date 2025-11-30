import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Chip,
  AppBar,
  Toolbar,
  Button,
  TextField,
  Box,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Avatar,
  Menu,
  Tooltip,
  IconButton,
  Divider,
  ListItemIcon
} from '@mui/material';
import { Logout, Person, Settings } from '@mui/icons-material';

// Interface des données
interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

function Home() {
  const navigate = useNavigate();
  const [annonces, setAnnonces] = useState<MarketplaceItem[]>([]);
  const [recherche, setRecherche] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [annonceToEdit, setAnnonceToEdit] = useState<MarketplaceItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    category: '',
    imageUrl: '',
  });

  // État pour le menu utilisateur
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  // États pour la création
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    description: '',
    price: 0,
    category: '',
    imageUrl: '',
  });

  // Fonction pour charger les annonces
  const loadAnnonces = () => {
    axios.get('http://localhost:3000/marketplace')
      .then((response) => {
        const data = Array.isArray(response.data) ? response.data : [];
        setAnnonces(data);
      })
      .catch((error) => {
        console.error("Erreur API:", error);
        setAnnonces([]);
      });
  };

  // Chargement des données au démarrage
  useEffect(() => {
    loadAnnonces();

    // Lire l'identité de l'utilisateur depuis le localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Erreur lecture user localStorage", e);
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Gestion du Menu Utilisateur
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  // Déconnexion
  const handleLogout = () => {
    handleCloseUserMenu();
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    setCurrentUser(null);
    alert("Vous avez été déconnecté.");
    navigate('/');
  };

  // Ouvrir la modal de modification
  const handleOpenEditDialog = (annonce: MarketplaceItem) => {
    setAnnonceToEdit(annonce);
    setFormData({
      title: annonce.title,
      description: annonce.description,
      price: annonce.price,
      category: annonce.category,
      imageUrl: annonce.imageUrl || '',
    });
    setOpenDialog(true);
  };

  // Fermer la modal
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setAnnonceToEdit(null);
    setFormData({
      title: '',
      description: '',
      price: 0,
      category: '',
      imageUrl: '',
    });
  };

  // Gérer la soumission du formulaire de modification
  const handleUpdateAnnonce = async () => {
    if (!annonceToEdit) return;

    try {
      await axios.patch(`http://localhost:3000/marketplace/${annonceToEdit.id}`, {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        imageUrl: formData.imageUrl || undefined,
      });

      loadAnnonces();
      handleCloseDialog();
      alert('Annonce modifiée avec succès !');
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      alert('Erreur lors de la modification de l\'annonce');
    }
  };

  // Gérer la suppression d'une annonce
  const handleDeleteAnnonce = async (annonce: MarketplaceItem) => {
    const confirmDelete = window.confirm(
      `Êtes-vous sûr de vouloir supprimer l'annonce "${annonce.title}" ?\n\nCette action est irréversible.`
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:3000/marketplace/${annonce.id}`);
      loadAnnonces();
      alert('Annonce supprimée avec succès !');
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert('Erreur lors de la suppression de l\'annonce');
    }
  };

  // --- GESTION DE LA CRÉATION ---

  const handleOpenCreateDialog = () => {
    setOpenCreateDialog(true);
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    setNewAnnouncement({
      title: '',
      description: '',
      price: 0,
      category: '',
      imageUrl: '',
    });
  };

  const handleCreateAnnouncement = async () => {
    if (!currentUser) {
      alert("Vous devez être connecté pour publier.");
      return;
    }

    try {
      await axios.post('http://localhost:3000/marketplace', {
        title: newAnnouncement.title,
        description: newAnnouncement.description,
        price: newAnnouncement.price,
        category: newAnnouncement.category,
        imageUrl: newAnnouncement.imageUrl || undefined,
        user: { id: currentUser.id }
      });

      alert("Annonce créée avec succès !");
      loadAnnonces();
      handleCloseCreateDialog();
    } catch (error) {
      console.error("Erreur création:", error);
      alert("Erreur lors de la création de l'annonce.");
    }
  };

  // Filtre de recherche
  const annoncesFiltrees = Array.isArray(annonces)
    ? annonces.filter((annonce) =>
      annonce.title?.toLowerCase().includes(recherche.toLowerCase()) ||
      annonce.category?.toLowerCase().includes(recherche.toLowerCase())
    )
    : [];

  // Helper pour les initiales
  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName ? firstName.charAt(0) : '';
    const last = lastName ? lastName.charAt(0) : '';
    return `${first}${last}`.toUpperCase() || '?';
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#f5f5f5' }}>

      {/* 1. BARRE DE NAVIGATION */}
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

          {currentUser ? (
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Ouvrir les paramètres">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar sx={{ bgcolor: 'orange' }}>
                    {getInitials(currentUser.firstName, currentUser.lastName)}
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
                    {currentUser.firstName} {currentUser.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {currentUser.email}
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

      {/* 2. SECTION HÉROS */}
      <Box sx={{
        bgcolor: 'white',
        pt: { xs: 4, sm: 6, md: 8 },
        pb: { xs: 4, sm: 5, md: 6 },
        mb: { xs: 2, sm: 3, md: 4 },
        textAlign: 'center',
        boxShadow: 1
      }}>
        <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
          <Typography
            component="h1"
            variant="h2"
            color="text.primary"
            gutterBottom
            sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}
          >
            Marketplace & Ressources
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            paragraph
            sx={{ fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}
          >
            Échangez des compétences, partagez des ressources et collaborez
            au sein de la communauté Santé & Bien-être.
          </Typography>

          <TextField
            variant="outlined"
            placeholder="Rechercher (ex: Yoga, Matériel...)"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            sx={{
              mt: 2,
              width: '100%',
              maxWidth: { xs: '100%', sm: '500px' },
              bgcolor: 'white'
            }}
          />

          {currentUser && (
            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleOpenCreateDialog}
                sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
              >
                + Publier une annonce
              </Button>
            </Box>
          )}
        </Container>
      </Box>

      {/* 3. GRILLE DES RÉSULTATS */}
      <Container
        maxWidth="xl"
        sx={{
          pb: { xs: 4, sm: 6, md: 8 },
          px: { xs: 2, sm: 3, md: 4 }
        }}
      >
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
            xl: 'repeat(5, 1fr)'
          },
          gap: { xs: 2, sm: 3, md: 4 }
        }}>
          {annoncesFiltrees.map((annonce) => (
            <Card
              key={annonce.id}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: '0.3s',
                boxShadow: 2,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{
                  height: { xs: 180, sm: 200, md: 220 },
                  width: '100%',
                  backgroundColor: '#e0e0e0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {annonce.imageUrl ? (
                  <CardMedia
                    component="img"
                    height="140"
                    image={annonce.imageUrl}
                    alt={annonce.title}
                    onError={(e) => {
                      if (!(e.currentTarget as HTMLElement).dataset.errorHandled) {
                        (e.currentTarget as HTMLElement).dataset.errorHandled = 'true';
                        e.currentTarget.style.display = 'none';
                      }
                    }}
                    sx={{
                      objectFit: 'cover',
                      width: '100%',
                      height: '100%',
                      transition: 'transform 0.3s',
                      '&:hover': {
                        transform: 'scale(1.1)'
                      }
                    }}
                  />
                ) : (
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#666',
                      fontWeight: 500,
                      textAlign: 'center',
                      px: 2
                    }}
                  >
                    {annonce.category}
                  </Typography>
                )}
              </Box>

              <CardContent sx={{ flexGrow: 1, px: { xs: 1.5, sm: 2 }, py: { xs: 1.5, sm: 2 } }}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1.5}
                  flexWrap="wrap"
                  gap={1}
                >
                  <Chip
                    label={annonce.category}
                    color="primary"
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 500 }}
                  />
                  <Typography
                    variant="h6"
                    color="secondary"
                    fontWeight="bold"
                    sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                  >
                    {annonce.price === 0 ? "Gratuit" : `${annonce.price} €`}
                  </Typography>
                </Box>

                <Typography
                  gutterBottom
                  variant="h5"
                  component="h2"
                  sx={{
                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                    fontWeight: 600,
                    mb: 1,
                    lineHeight: 1.3,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    minHeight: { xs: '2.6em', sm: '3em' }
                  }}
                >
                  {annonce.title}
                </Typography>
                <Typography
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    lineHeight: 1.5,
                    minHeight: { xs: '3.9em', sm: '4.5em' }
                  }}
                >
                  {annonce.description}
                </Typography>
              </CardContent>

              <CardActions
                sx={{
                  bgcolor: '#fafafa',
                  px: { xs: 1, sm: 2 },
                  py: { xs: 1, sm: 1.5 },
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'stretch', sm: 'center' },
                  gap: { xs: 1, sm: 0 }
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontStyle: 'italic',
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    mb: { xs: 0.5, sm: 0 },
                    textAlign: { xs: 'center', sm: 'left' },
                    flexGrow: 1
                  }}
                >
                  Proposé par {annonce.user?.firstName} {annonce.user?.lastName}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    gap: { xs: 0.5, sm: 1 },
                    flexWrap: 'wrap',
                    justifyContent: { xs: 'center', sm: 'flex-end' },
                    width: { xs: '100%', sm: 'auto' }
                  }}
                >
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    onClick={() => handleOpenEditDialog(annonce)}
                    sx={{
                      fontSize: { xs: '0.7rem', sm: '0.875rem' },
                      px: { xs: 1, sm: 2 },
                      minWidth: { xs: '70px', sm: 'auto' }
                    }}
                  >
                    Modifier
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={() => handleDeleteAnnonce(annonce)}
                    sx={{
                      fontSize: { xs: '0.7rem', sm: '0.875rem' },
                      px: { xs: 1, sm: 2 },
                      minWidth: { xs: '70px', sm: 'auto' }
                    }}
                  >
                    Supprimer
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    sx={{
                      fontSize: { xs: '0.7rem', sm: '0.875rem' },
                      px: { xs: 1, sm: 2 },
                      minWidth: { xs: '70px', sm: 'auto' }
                    }}
                  >
                    Voir l'offre
                  </Button>
                </Box>
              </CardActions>
            </Card>
          ))}
        </Box>

        {annoncesFiltrees.length === 0 && (
          <Paper
            sx={{
              p: { xs: 3, sm: 4 },
              textAlign: 'center',
              mt: { xs: 2, sm: 4 },
              borderRadius: 2,
              boxShadow: 2
            }}
          >
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}
            >
              {recherche
                ? `Aucun résultat trouvé pour "${recherche}" 🧐`
                : 'Aucune annonce disponible pour le moment'
              }
            </Typography>
          </Paper>
        )}
      </Container>

      {/* MODAL DE MODIFICATION */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Modifier l'annonce</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Titre"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Prix (€)"
                type="number"
                fullWidth
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
              <FormControl fullWidth required>
                <InputLabel>Catégorie</InputLabel>
                <Select
                  value={formData.category}
                  label="Catégorie"
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <MenuItem value="Santé">Santé</MenuItem>
                  <MenuItem value="Bien-être">Bien-être</MenuItem>
                  <MenuItem value="Matériel">Matériel</MenuItem>
                  <MenuItem value="Coaching">Coaching</MenuItem>
                  <MenuItem value="Informatique">Informatique</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <TextField
              label="URL de l'image (optionnel)"
              fullWidth
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
              helperText="Collez ici le lien d'une image depuis Google Images ou autre"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Annuler
          </Button>
          <Button
            onClick={handleUpdateAnnonce}
            variant="contained"
            color="primary"
            disabled={!formData.title || !formData.description || !formData.category}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL DE CRÉATION */}
      <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog} maxWidth="md" fullWidth>
        <DialogTitle>Publier une nouvelle annonce</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Titre de l'annonce"
              fullWidth
              value={newAnnouncement.title}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
              required
            />
            <TextField
              label="Description détaillée"
              fullWidth
              multiline
              rows={4}
              value={newAnnouncement.description}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, description: e.target.value })}
              required
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Prix (€)"
                type="number"
                fullWidth
                value={newAnnouncement.price}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, price: parseFloat(e.target.value) || 0 })}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
              <FormControl fullWidth required>
                <InputLabel>Catégorie</InputLabel>
                <Select
                  value={newAnnouncement.category}
                  label="Catégorie"
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, category: e.target.value })}
                >
                  <MenuItem value="Santé">Santé</MenuItem>
                  <MenuItem value="Bien-être">Bien-être</MenuItem>
                  <MenuItem value="Matériel">Matériel</MenuItem>
                  <MenuItem value="Coaching">Coaching</MenuItem>
                  <MenuItem value="Informatique">Informatique</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <TextField
              label="URL de l'image (optionnel)"
              fullWidth
              value={newAnnouncement.imageUrl}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
              helperText="Lien vers une image externe"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog} color="inherit">
            Annuler
          </Button>
          <Button
            onClick={handleCreateAnnouncement}
            variant="contained"
            color="success"
            disabled={!newAnnouncement.title || !newAnnouncement.description || !newAnnouncement.category}
          >
            Publier
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Home;
