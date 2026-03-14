import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  Container, Card, CardContent, CardMedia, CardActions,
  Typography, Chip, Button, TextField, Box, Dialog,
  DialogTitle, DialogContent, DialogActions, MenuItem,
  Select, FormControl, InputLabel, Snackbar, Alert,
  IconButton, Stack, Divider, CircularProgress, Paper, Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  ShoppingBag as ShoppingBagIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  user: {
    id?: string;
    firstName?: string;
    lastName?: string;
  };
}

const FORM_DEFAULTS = { title: '', description: '', price: 0, category: '', imageUrl: '' };

function ItemForm({ data, onChange }: { data: typeof FORM_DEFAULTS; onChange: (k: string, v: string | number) => void }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
      <TextField
        label="Titre du produit"
        fullWidth
        value={data.title}
        onChange={e => onChange('title', e.target.value)}
        required
      />
      <TextField
        label="Description"
        fullWidth
        multiline
        rows={3}
        value={data.description}
        onChange={e => onChange('description', e.target.value)}
        required
      />
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          label="Prix (€)"
          type="number"
          fullWidth
          value={data.price}
          onChange={e => onChange('price', parseFloat(e.target.value) || 0)}
          inputProps={{ min: 0, step: 0.01 }}
        />
        <TextField
          label="Catégorie"
          fullWidth
          value={data.category}
          onChange={e => onChange('category', e.target.value)}
          required
        />
      </Box>
      <TextField
        label="URL de l'image (optionnel)"
        fullWidth
        value={data.imageUrl}
        onChange={e => onChange('imageUrl', e.target.value)}
        placeholder="https://..."
      />
    </Box>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [sortOrder, setSortOrder] = useState('');

  // Dialogs state
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [form, setForm] = useState(FORM_DEFAULTS);

  // Snackbar
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' as 'success' | 'error' });
  const notify = (msg: string, severity: 'success' | 'error' = 'success') =>
    setSnack({ open: true, msg, severity });

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3000/marketplace');
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch {
      notify('Erreur lors du chargement des annonces', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadItems(); }, []);

  // Unique categories from data
  const categories = useMemo(() => {
    const cats = [...new Set(items.map(i => i.category))].filter(Boolean).sort();
    return ['Tous', ...cats];
  }, [items]);

  // Filtered + sorted items
  const filtered = useMemo(() => {
    let result = items;
    if (activeCategory !== 'Tous') result = result.filter(i => i.category === activeCategory);
    if (search) result = result.filter(i =>
      i.title?.toLowerCase().includes(search.toLowerCase()) ||
      i.category?.toLowerCase().includes(search.toLowerCase())
    );
    if (sortOrder === 'asc') result = [...result].sort((a, b) => Number(a.price) - Number(b.price));
    if (sortOrder === 'desc') result = [...result].sort((a, b) => Number(b.price) - Number(a.price));
    return result;
  }, [items, activeCategory, search, sortOrder]);

  // CRUD
  const handleCreate = async () => {
    if (!user) return notify('Connectez-vous pour publier', 'error');
    try {
      await axios.post('http://localhost:3000/marketplace', { ...form, user: { id: user.id } });
      notify('Annonce publiée avec succès !');
      setCreateOpen(false);
      setForm(FORM_DEFAULTS);
      loadItems();
    } catch {
      notify('Erreur lors de la création', 'error');
    }
  };

  const handleUpdate = async () => {
    if (!selectedItem) return;
    try {
      await axios.patch(`http://localhost:3000/marketplace/${selectedItem.id}`, form);
      notify('Annonce modifiée avec succès !');
      setEditOpen(false);
      loadItems();
    } catch {
      notify('Erreur lors de la modification', 'error');
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      await axios.delete(`http://localhost:3000/marketplace/${selectedItem.id}`);
      notify('Annonce supprimée');
      setDeleteOpen(false);
      loadItems();
    } catch {
      notify('Erreur lors de la suppression', 'error');
    }
  };

  const openEdit = (item: MarketplaceItem) => {
    setSelectedItem(item);
    setForm({ title: item.title, description: item.description, price: item.price, category: item.category, imageUrl: item.imageUrl || '' });
    setEditOpen(true);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6f8' }}>

      {/* ── HERO ── */}
      <Box sx={{
        background: 'linear-gradient(135deg, #0d47a1 0%, #1976d2 60%, #42a5f5 100%)',
        pt: { xs: 6, md: 10 }, pb: { xs: 5, md: 8 },
        textAlign: 'center', color: 'white',
      }}>
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 2 }}>
            <ShoppingBagIcon sx={{ fontSize: 40 }} />
            <Typography variant="h3" fontWeight={800} sx={{ fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
              Marketplace Communautaire
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ opacity: 0.85, mb: 4, fontWeight: 400 }}>
            Achetez, vendez et échangez des ressources au sein de la communauté Junia
          </Typography>

          {/* Search bar */}
          <Paper sx={{ display: 'flex', alignItems: 'center', px: 2.5, py: 0.8, borderRadius: 4, maxWidth: 580, mx: 'auto', boxShadow: 4 }}>
            <SearchIcon sx={{ color: 'text.disabled', mr: 1 }} />
            <TextField
              fullWidth variant="standard"
              placeholder="Rechercher un produit, une catégorie..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              InputProps={{ disableUnderline: true, sx: { fontSize: '1rem' } }}
            />
          </Paper>

          {user && (
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => { setForm(FORM_DEFAULTS); setCreateOpen(true); }}
              sx={{ mt: 3, bgcolor: 'white', color: '#1565c0', fontWeight: 700, borderRadius: 3, px: 4, '&:hover': { bgcolor: '#e3f2fd' } }}
            >
              Publier une annonce
            </Button>
          )}
        </Container>
      </Box>

      {/* ── FILTERS + STATS ── */}
      <Container maxWidth="xl" sx={{ pt: 4, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body1" color="text.secondary">
            <strong style={{ color: '#1976d2' }}>{filtered.length}</strong> produit{filtered.length !== 1 ? 's' : ''} disponible{filtered.length !== 1 ? 's' : ''}
          </Typography>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Trier par</InputLabel>
            <Select value={sortOrder} label="Trier par" onChange={e => setSortOrder(e.target.value)}>
              <MenuItem value="">Par défaut</MenuItem>
              <MenuItem value="asc">Prix croissant</MenuItem>
              <MenuItem value="desc">Prix décroissant</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Category chips */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
          {categories.map(cat => (
            <Chip
              key={cat}
              label={cat}
              onClick={() => setActiveCategory(cat)}
              color={activeCategory === cat ? 'primary' : 'default'}
              variant={activeCategory === cat ? 'filled' : 'outlined'}
              sx={{ cursor: 'pointer', textTransform: 'capitalize', fontWeight: activeCategory === cat ? 600 : 400 }}
            />
          ))}
        </Box>

        {/* ── GRID ── */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress size={48} />
          </Box>
        ) : filtered.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="h6" color="text.secondary">
              {search ? `Aucun résultat pour "${search}"` : 'Aucune annonce disponible'}
            </Typography>
          </Paper>
        ) : (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)', lg: 'repeat(4,1fr)', xl: 'repeat(5,1fr)' },
            gap: 3,
          }}>
            {filtered.map(item => (
              <Card key={item.id} sx={{
                display: 'flex', flexDirection: 'column', borderRadius: 3, overflow: 'hidden',
                boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                transition: 'all 0.25s ease',
                '&:hover': { boxShadow: '0 12px 28px rgba(0,0,0,0.15)', transform: 'translateY(-5px)' },
                bgcolor: 'white',
              }}>

                {/* Image */}
                <Box sx={{ position: 'relative', height: 200, bgcolor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {item.imageUrl ? (
                    <CardMedia
                      component="img"
                      image={item.imageUrl}
                      alt={item.title}
                      sx={{ height: '100%', width: '100%', objectFit: 'contain', p: 1.5, transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.06)' } }}
                    />
                  ) : (
                    <Typography fontSize={56}>📦</Typography>
                  )}
                  <Chip
                    label={item.category}
                    size="small"
                    sx={{ position: 'absolute', top: 8, left: 8, bgcolor: 'rgba(255,255,255,0.92)', fontSize: '0.68rem', fontWeight: 600, textTransform: 'capitalize' }}
                  />
                </Box>

                {/* Content */}
                <CardContent sx={{ flexGrow: 1, px: 2, pt: 2, pb: 1 }}>
                  <Typography
                    fontWeight={700} fontSize="0.92rem" gutterBottom
                    sx={{ lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '2.7em' }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body2" color="text.secondary"
                    sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 1.5, lineHeight: 1.5, minHeight: '3em', fontSize: '0.82rem' }}
                  >
                    {item.description}
                  </Typography>
                  <Typography variant="h6" fontWeight={800} color="primary.main" fontSize="1.1rem">
                    {Number(item.price) === 0 ? 'Gratuit' : `${Number(item.price).toFixed(2)} €`}
                  </Typography>
                </CardContent>

                <Divider />

                {/* Actions */}
                <CardActions sx={{ px: 1.5, py: 1, justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.disabled" noWrap sx={{ maxWidth: '50%', fontSize: '0.7rem' }}>
                    {item.user?.firstName} {item.user?.lastName}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Voir les détails">
                      <IconButton size="small" color="primary" onClick={() => { setSelectedItem(item); setViewOpen(true); }}>
                        <VisibilityIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Modifier">
                      <IconButton size="small" sx={{ color: '#ed6c02' }} onClick={() => openEdit(item)}>
                        <EditIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton size="small" color="error" onClick={() => { setSelectedItem(item); setDeleteOpen(true); }}>
                        <DeleteIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardActions>
              </Card>
            ))}
          </Box>
        )}
      </Container>

      {/* ── DIALOG : CRÉER ── */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Publier une annonce</DialogTitle>
        <DialogContent>
          <ItemForm data={form} onChange={(k, v) => setForm(prev => ({ ...prev, [k]: v }))} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateOpen(false)}>Annuler</Button>
          <Button variant="contained" color="success" onClick={handleCreate} disabled={!form.title || !form.description || !form.category}>
            Publier
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── DIALOG : MODIFIER ── */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Modifier l'annonce</DialogTitle>
        <DialogContent>
          <ItemForm data={form} onChange={(k, v) => setForm(prev => ({ ...prev, [k]: v }))} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleUpdate} disabled={!form.title || !form.description || !form.category}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── DIALOG : VOIR ── */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, pr: 6 }}>{selectedItem?.title}</DialogTitle>
        <DialogContent dividers>
          {selectedItem?.imageUrl && (
            <Box sx={{ textAlign: 'center', mb: 3, bgcolor: '#fafafa', borderRadius: 2, p: 2 }}>
              <img src={selectedItem.imageUrl} alt={selectedItem.title} style={{ maxHeight: 260, maxWidth: '100%', objectFit: 'contain' }} />
            </Box>
          )}
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip label={selectedItem?.category} size="small" color="primary" variant="outlined" sx={{ textTransform: 'capitalize' }} />
            </Box>
            <Typography variant="h5" color="primary" fontWeight={800}>
              {Number(selectedItem?.price) === 0 ? 'Gratuit' : `${Number(selectedItem?.price).toFixed(2)} €`}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              {selectedItem?.description}
            </Typography>
            <Divider />
            <Typography variant="body2" color="text.secondary">
              Proposé par <strong>{selectedItem?.user?.firstName} {selectedItem?.user?.lastName}</strong>
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setViewOpen(false)}>Fermer</Button>
          <Button variant="contained">Contacter le vendeur</Button>
        </DialogActions>
      </Dialog>

      {/* ── DIALOG : SUPPRIMER ── */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Voulez-vous vraiment supprimer <strong>"{selectedItem?.title}"</strong> ?
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)}>Annuler</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Supprimer</Button>
        </DialogActions>
      </Dialog>

      {/* ── SNACKBAR ── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack(s => ({ ...s, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
