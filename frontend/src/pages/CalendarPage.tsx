import { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import fr from 'date-fns/locale/fr';
import isToday from 'date-fns/isToday';
import isSameMonth from 'date-fns/isSameMonth';
import axios from 'axios';
import {
  Container, Paper, Typography, Box, Button, Dialog, DialogTitle,
  DialogContent, TextField, DialogActions, MenuItem, Select,
  FormControl, InputLabel, Snackbar, Alert, Chip, Stack, Divider,
  IconButton, Tooltip, Badge,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import EventIcon from '@mui/icons-material/Event';
import VideocamIcon from '@mui/icons-material/Videocam';
import PeopleIcon from '@mui/icons-material/People';
import TodayIcon from '@mui/icons-material/Today';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const locales = { fr };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });
const DnDCalendar = withDragAndDrop(Calendar as any) as any;

const EVENT_TYPES = [
  { value: 'enligne',    label: 'En ligne',    color: '#1976d2', icon: '💻' },
  { value: 'presentiel', label: 'Présentiel',  color: '#2e7d32', icon: '🌳' },
  { value: 'atelier',   label: 'Atelier',     color: '#ed6c02', icon: '🛠️' },
  { value: 'social',    label: 'Social',      color: '#9c27b0', icon: '🎉' },
];

const FORM_DEFAULTS = { title: '', start: '', end: '', type: 'enligne', description: '', location: '' };

function getEventColor(type: string) {
  return EVENT_TYPES.find(t => t.value === type)?.color ?? '#1976d2';
}

function getEventIcon(type: string) {
  return EVENT_TYPES.find(t => t.value === type)?.icon ?? '📅';
}

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [notification, setNotification] = useState<{ msg: string; severity: 'success' | 'error' } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [mode, setMode] = useState<'create' | 'view' | 'edit'>('create');
  const [formData, setFormData] = useState(FORM_DEFAULTS);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<string>(Views.WEEK);
  const [filterType, setFilterType] = useState<string>('all');

  const notify = (msg: string, severity: 'success' | 'error' = 'success') =>
    setNotification({ msg, severity });

  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://localhost:3000/events');
      setEvents(res.data.map((ev: any) => ({
        ...ev,
        start: new Date(ev.start),
        end: new Date(ev.end),
      })));
    } catch { notify('Erreur lors du chargement des événements', 'error'); }
  };

  useEffect(() => { fetchEvents(); }, []);

  // Statistiques
  const now = new Date();
  const eventsToday = events.filter(e => isToday(new Date(e.start)));
  const eventsThisMonth = events.filter(e => isSameMonth(new Date(e.start), now));
  const eventsFiltered = filterType === 'all' ? events : events.filter(e => e.type === filterType);

  // Ouvrir créer en cliquant sur un créneau vide
  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setMode('create');
    setSelectedEvent(null);
    setFormData({
      ...FORM_DEFAULTS,
      start: format(start, "yyyy-MM-dd'T'HH:mm"),
      end: format(end, "yyyy-MM-dd'T'HH:mm"),
    });
    setOpenModal(true);
  };

  const handleOpenCreate = () => {
    setMode('create');
    setSelectedEvent(null);
    setFormData(FORM_DEFAULTS);
    setOpenModal(true);
  };

  const handleSelectEvent = (event: any) => {
    setMode('view');
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      start: format(new Date(event.start), "yyyy-MM-dd'T'HH:mm"),
      end: format(new Date(event.end), "yyyy-MM-dd'T'HH:mm"),
      type: event.type || 'enligne',
      description: event.description || '',
      location: event.location || '',
    });
    setOpenModal(true);
  };

  const onEventDrop = useCallback(async ({ event, start, end }: any) => {
    setEvents(prev => prev.map(e => e.id === event.id ? { ...e, start, end } : e));
    try {
      await axios.patch(`http://localhost:3000/events/${event.id}`, { start, end });
      notify('Événement déplacé');
    } catch { fetchEvents(); }
  }, [events]);

  const onEventResize = useCallback(async ({ event, start, end }: any) => {
    setEvents(prev => prev.map(e => e.id === event.id ? { ...e, start, end } : e));
    try {
      await axios.patch(`http://localhost:3000/events/${event.id}`, { start, end });
      notify('Durée modifiée');
    } catch { fetchEvents(); }
  }, [events]);

  const handleSubmit = async () => {
    if (!formData.title || !formData.start || !formData.end) {
      return notify('Titre, début et fin sont obligatoires', 'error');
    }
    const userString = localStorage.getItem('user');
    if (!userString) return notify('Veuillez vous connecter', 'error');
    const user = JSON.parse(userString);

    try {
      if (mode === 'create') {
        await axios.post('http://localhost:3000/events', { ...formData, user: { id: user.id } });
        notify('Événement créé !');
      } else if (mode === 'edit' && selectedEvent) {
        await axios.patch(`http://localhost:3000/events/${selectedEvent.id}`, formData);
        notify('Événement modifié !');
      }
      setOpenModal(false);
      fetchEvents();
    } catch { notify('Erreur lors de l\'enregistrement', 'error'); }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    if (!window.confirm('Supprimer cet événement ?')) return;
    try {
      await axios.delete(`http://localhost:3000/events/${selectedEvent.id}`);
      notify('Événement supprimé');
      setOpenModal(false);
      fetchEvents();
    } catch { notify('Erreur suppression', 'error'); }
  };

  const eventStyleGetter = (event: any) => ({
    style: {
      backgroundColor: getEventColor(event.type),
      borderRadius: '6px',
      color: 'white',
      border: 'none',
      fontSize: '0.8rem',
      padding: '2px 6px',
    },
  });

  // Composant custom pour afficher les événements
  const EventComponent = ({ event }: any) => (
    <Box sx={{ overflow: 'hidden', lineHeight: 1.3 }}>
      <span style={{ marginRight: 4 }}>{getEventIcon(event.type)}</span>
      <strong>{event.title}</strong>
      {event.location && (
        <span style={{ fontSize: '0.7em', opacity: 0.85, marginLeft: 4 }}>📍 {event.location}</span>
      )}
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa', pb: 4 }}>

      {/* ── HEADER ── */}
      <Box sx={{ background: 'linear-gradient(135deg, #0d47a1 0%, #1976d2 60%, #42a5f5 100%)', pt: 5, pb: 4, color: 'white' }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CalendarMonthIcon sx={{ fontSize: 38 }} />
              <Box>
                <Typography variant="h4" fontWeight={800}>Planning Communautaire</Typography>
                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                  Organisez et partagez vos activités avec la communauté Junia
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={handleOpenCreate}
              sx={{ bgcolor: 'white', color: '#1565c0', fontWeight: 700, borderRadius: 3, px: 3, '&:hover': { bgcolor: '#e3f2fd' } }}
            >
              Planifier
            </Button>
          </Box>

          {/* Statistiques */}
          <Box sx={{ display: 'flex', gap: 2, mt: 3, flexWrap: 'wrap' }}>
            {[
              { icon: <TodayIcon />, label: "Aujourd'hui", value: eventsToday.length },
              { icon: <EventIcon />, label: 'Ce mois', value: eventsThisMonth.length },
              { icon: <CalendarMonthIcon />, label: 'Total', value: events.length },
            ].map(stat => (
              <Paper key={stat.label} sx={{ px: 2.5, py: 1.5, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
                <Box sx={{ color: 'white', opacity: 0.85 }}>{stat.icon}</Box>
                <Box>
                  <Typography variant="h6" fontWeight={800} color="white" lineHeight={1}>{stat.value}</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>{stat.label}</Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: 3 }}>

        {/* ── FILTRES PAR TYPE ── */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>Filtrer :</Typography>
          <Chip
            label="Tous"
            onClick={() => setFilterType('all')}
            color={filterType === 'all' ? 'primary' : 'default'}
            variant={filterType === 'all' ? 'filled' : 'outlined'}
            sx={{ fontWeight: 600 }}
          />
          {EVENT_TYPES.map(t => (
            <Chip
              key={t.value}
              label={`${t.icon} ${t.label}`}
              onClick={() => setFilterType(t.value)}
              variant={filterType === t.value ? 'filled' : 'outlined'}
              sx={{
                fontWeight: 600,
                bgcolor: filterType === t.value ? t.color : 'transparent',
                color: filterType === t.value ? 'white' : t.color,
                borderColor: t.color,
                '&:hover': { bgcolor: t.color, color: 'white' },
              }}
            />
          ))}
          {filterType !== 'all' && (
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              {eventsFiltered.length} événement{eventsFiltered.length !== 1 ? 's' : ''}
            </Typography>
          )}
        </Box>

        {/* ── CALENDRIER ── */}
        <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: '75vh' }}>
          <DnDCalendar
            localizer={localizer}
            events={eventsFiltered}
            startAccessor="start"
            endAccessor="end"
            defaultView={Views.WEEK}
            view={currentView}
            onView={setCurrentView}
            date={currentDate}
            onNavigate={setCurrentDate}
            views={['month', 'week', 'day', 'agenda']}
            step={30}
            timeslots={2}
            selectable
            resizable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            onEventDrop={onEventDrop}
            onEventResize={onEventResize}
            style={{ height: '100%' }}
            culture="fr"
            eventPropGetter={eventStyleGetter}
            components={{ event: EventComponent }}
            messages={{
              next: 'Suivant',
              previous: 'Précédent',
              today: "Aujourd'hui",
              month: 'Mois',
              week: 'Semaine',
              day: 'Jour',
              agenda: 'Agenda',
              noEventsInRange: 'Aucun événement sur cette période',
              showMore: (total: number) => `+${total} de plus`,
            }}
          />
        </Paper>

        {/* ── LÉGENDE ── */}
        <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>Légende :</Typography>
          {EVENT_TYPES.map(t => (
            <Box key={t.value} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: t.color }} />
              <Typography variant="caption">{t.icon} {t.label}</Typography>
            </Box>
          ))}
          <Typography variant="caption" color="text.disabled" sx={{ ml: 'auto', alignSelf: 'center' }}>
            💡 Cliquez sur un créneau pour créer • Glissez pour déplacer
          </Typography>
        </Box>
      </Container>

      {/* ── MODAL INTELLIGENTE ── */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EventIcon color="primary" />
            <Typography fontWeight={700} fontSize="1.1rem">
              {mode === 'create' && 'Planifier une activité'}
              {mode === 'view' && selectedEvent?.title}
              {mode === 'edit' && "Modifier l'événement"}
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setOpenModal(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <Divider />

        <DialogContent sx={{ pt: 2 }}>

          {/* VUE DÉTAIL */}
          {mode === 'view' && selectedEvent && (
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={`${getEventIcon(selectedEvent.type)} ${EVENT_TYPES.find(t => t.value === selectedEvent.type)?.label ?? selectedEvent.type}`}
                  size="small"
                  sx={{ bgcolor: getEventColor(selectedEvent.type), color: 'white', fontWeight: 600 }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1, bgcolor: '#f0f4ff', borderRadius: 2, p: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">Début</Typography>
                  <Typography fontWeight={600} fontSize="0.9rem">
                    {format(new Date(selectedEvent.start), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, bgcolor: '#f0f4ff', borderRadius: 2, p: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">Fin</Typography>
                  <Typography fontWeight={600} fontSize="0.9rem">
                    {format(new Date(selectedEvent.end), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
                  </Typography>
                </Box>
              </Box>
              {selectedEvent.location && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">📍 {selectedEvent.location}</Typography>
                </Box>
              )}
              {selectedEvent.description && (
                <Box sx={{ bgcolor: '#fafafa', borderRadius: 2, p: 2, border: '1px solid #eee' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {selectedEvent.description}
                  </Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', gap: 1, pt: 1 }}>
                <Button fullWidth variant="outlined" startIcon={<EditIcon />} onClick={() => setMode('edit')}>
                  Modifier
                </Button>
                <Button fullWidth variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleDelete}>
                  Supprimer
                </Button>
              </Box>
            </Stack>
          )}

          {/* FORMULAIRE CRÉER / MODIFIER */}
          {(mode === 'create' || mode === 'edit') && (
            <Stack spacing={2} sx={{ mt: 0.5 }}>
              <TextField
                label="Titre de l'événement *"
                fullWidth
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                autoFocus
              />
              <FormControl fullWidth>
                <InputLabel>Type d'événement</InputLabel>
                <Select
                  value={formData.type}
                  label="Type d'événement"
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                >
                  {EVENT_TYPES.map(t => (
                    <MenuItem key={t.value} value={t.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: t.color }} />
                        {t.icon} {t.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Lieu (optionnel)"
                fullWidth
                placeholder="Ex : Salle A101, Teams, Discord..."
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
              />
              <TextField
                label="Description (optionnel)"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Début *"
                  type="datetime-local"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.start}
                  onChange={e => setFormData({ ...formData, start: e.target.value })}
                />
                <TextField
                  label="Fin *"
                  type="datetime-local"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.end}
                  onChange={e => setFormData({ ...formData, end: e.target.value })}
                />
              </Box>
            </Stack>
          )}
        </DialogContent>

        {(mode === 'create' || mode === 'edit') && (
          <>
            <Divider />
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button onClick={() => setOpenModal(false)}>Annuler</Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!formData.title || !formData.start || !formData.end}
                sx={{ borderRadius: 2, px: 3 }}
              >
                {mode === 'create' ? 'Créer l\'événement' : 'Enregistrer'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ── SNACKBAR ── */}
      <Snackbar
        open={!!notification}
        autoHideDuration={3500}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={notification?.severity ?? 'success'} variant="filled" onClose={() => setNotification(null)}>
          {notification?.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
