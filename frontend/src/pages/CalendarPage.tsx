import { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
// --- IMPORT SPÉCIAL DRAG AND DROP ---
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import fr from 'date-fns/locale/fr';
import axios from 'axios';
import {
    Container, Paper, Typography, Box, Button, Dialog, DialogTitle,
    DialogContent, TextField, DialogActions, MenuItem, Select, FormControl, InputLabel, Snackbar, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

// Configuration locale
const locales = { 'fr': fr };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// On enveloppe le calendrier avec la super-pouvoir DragAndDrop
const DnDCalendar = withDragAndDrop(Calendar as any) as any;

export default function CalendarPage() {
    const [events, setEvents] = useState<any[]>([]);

    // Etats pour la gestion des événements
    const [openModal, setOpenModal] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
    const [mode, setMode] = useState<'create' | 'view' | 'edit'>('create');

    // Etat pour le formulaire (création & édition)
    const [formData, setFormData] = useState({
        title: '', start: '', end: '', type: 'enligne', description: ''
    });

    const fetchEvents = async () => {
        try {
            const res = await axios.get('http://localhost:3000/events');
            const formattedEvents = res.data.map((ev: any) => ({
                ...ev,
                start: new Date(ev.start),
                end: new Date(ev.end),
            }));
            setEvents(formattedEvents);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchEvents(); }, []);

    // --- OUVERTURE MODAL POUR CRÉATION ---
    const handleOpenCreate = () => {
        setMode('create');
        setFormData({ title: '', start: '', end: '', type: 'enligne', description: '' });
        setSelectedEvent(null);
        setOpenModal(true);
    };

    // --- OUVERTURE MODAL POUR DÉTAILS ---
    const handleSelectEvent = (event: any) => {
        setMode('view');
        setSelectedEvent(event);
        // On pré-remplit le formulaire au cas où on passe en mode 'edit'
        setFormData({
            title: event.title,
            start: format(new Date(event.start), "yyyy-MM-dd'T'HH:mm", { locale: fr }),
            end: format(new Date(event.end), "yyyy-MM-dd'T'HH:mm", { locale: fr }),
            type: event.type || 'enligne',
            description: event.description || ''
        });
        setOpenModal(true);
    };

    // --- SAUVEGARDE (DÉPLACEMENT) ---
    const onEventDrop = useCallback(async ({ event, start, end }: any) => {
        try {
            const updatedEvents = events.map(existingEv =>
                existingEv.id === event.id ? { ...existingEv, start, end } : existingEv
            );
            setEvents(updatedEvents);
            await axios.patch(`http://localhost:3000/events/${event.id}`, { start, end });
            setNotification("📅 Déplacement enregistré");
        } catch (error) { fetchEvents(); }
    }, [events]);

    const onEventResize = useCallback(async ({ event, start, end }: any) => {
        try {
            const updatedEvents = events.map(existingEv =>
                existingEv.id === event.id ? { ...existingEv, start, end } : existingEv
            );
            setEvents(updatedEvents);
            await axios.patch(`http://localhost:3000/events/${event.id}`, { start, end });
            setNotification("⏱️ Durée modifiée");
        } catch (error) { fetchEvents(); }
    }, [events]);

    // --- ACTIONS DU FORMULAIRE ---
    const handleSubmit = async () => {
        const userString = localStorage.getItem('user');
        if (!userString) return alert("Veuillez vous connecter.");
        const user = JSON.parse(userString);

        try {
            if (mode === 'create') {
                await axios.post('http://localhost:3000/events', { ...formData, user: { id: user.id } });
                setNotification("✅ Événement créé !");
            } else if (mode === 'edit' && selectedEvent) {
                await axios.patch(`http://localhost:3000/events/${selectedEvent.id}`, formData);
                setNotification("✏️ Événement modifié !");
            }
            setOpenModal(false);
            fetchEvents();
        } catch (err) { alert("Erreur lors de l'enregistrement"); }
    };

    const handleDelete = async () => {
        if (!selectedEvent || !window.confirm("Supprimer cet événement ?")) return;
        try {
            await axios.delete(`http://localhost:3000/events/${selectedEvent.id}`);
            setNotification("🗑️ Événement supprimé");
            setOpenModal(false);
            fetchEvents();
        } catch (err) { alert("Erreur suppression"); }
    };

    const eventStyleGetter = (event: any) => {
        const backgroundColor = event.type === 'enligne' ? '#1976d2' : '#2e7d32';
        return { style: { backgroundColor, borderRadius: '6px', opacity: 0.9, color: 'white', border: '0px', display: 'block' } };
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 4 }}>
            <Container maxWidth="xl">
                <Box display="flex" justifyContent="space-between" mb={3} alignItems="center">
                    <Box>
                        <Typography variant="h4" fontWeight="bold" color="primary">Planning Communautaire</Typography>
                        <Typography variant="body2" color="text.secondary">Gérez vos activités en toute simplicité</Typography>
                    </Box>
                    <Button variant="contained" size="large" startIcon={<AddIcon />} onClick={handleOpenCreate} sx={{ borderRadius: 8 }}>
                        Planifier
                    </Button>
                </Box>

                <Paper elevation={4} sx={{ p: 2, height: '80vh', borderRadius: 3 }}>
                    <DnDCalendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        defaultView={Views.WEEK}
                        views={['month', 'week', 'day', 'agenda']}
                        step={30}
                        timeslots={2}
                        onEventDrop={onEventDrop}
                        onEventResize={onEventResize}
                        onSelectEvent={handleSelectEvent} // Clic sur un évent
                        resizable
                        selectable
                        style={{ height: '100%' }}
                        culture='fr'
                        eventPropGetter={eventStyleGetter}
                        messages={{
                            next: "Suivant", previous: "Précédent", today: "Aujourd'hui",
                            month: "Mois", week: "Semaine", day: "Jour", agenda: "Agenda"
                        }}
                    />
                </Paper>

                {/* --- MODAL INTELLIGENTE --- */}
                <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm">
                    <DialogTitle>
                        {mode === 'create' && "Planifier une activité"}
                        {mode === 'view' && "Détails de l'événement"}
                        {mode === 'edit' && "Modifier l'événement"}
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>

                            {/* AFFICHAGE LECTURE SEULE */}
                            {mode === 'view' && selectedEvent && (
                                <Box>
                                    <Typography variant="h5" gutterBottom>{selectedEvent.title}</Typography>
                                    <Typography variant="body1" color="text.secondary" gutterBottom>
                                        📅 {format(selectedEvent.start, "d MMMM yyyy à HH:mm", { locale: fr })}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 2 }}>{selectedEvent.description || "Aucune description"}</Typography>

                                    <Box display="flex" gap={2} mt={3}>
                                        <Button variant="outlined" onClick={() => setMode('edit')} fullWidth>Modifier</Button>
                                        <Button variant="outlined" color="error" onClick={handleDelete} fullWidth>Supprimer</Button>
                                    </Box>
                                </Box>
                            )}

                            {/* AFFICHAGE ÉDITION / CRÉATION */}
                            {(mode === 'create' || mode === 'edit') && (
                                <>
                                    <TextField
                                        label="Titre" fullWidth
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                    <FormControl fullWidth>
                                        <InputLabel>Type</InputLabel>
                                        <Select
                                            value={formData.type}
                                            label="Type"
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            <MenuItem value="enligne">💻 En ligne</MenuItem>
                                            <MenuItem value="presentiel">🌳 Présentiel</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <TextField
                                        label="Description" fullWidth multiline rows={3}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                    <TextField
                                        label="Début" type="datetime-local" InputLabelProps={{ shrink: true }}
                                        value={formData.start}
                                        onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                                    />
                                    <TextField
                                        label="Fin" type="datetime-local" InputLabelProps={{ shrink: true }}
                                        value={formData.end}
                                        onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                                    />
                                </>
                            )}
                        </Box>
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={() => setOpenModal(false)}>Fermer</Button>
                        {(mode === 'create' || mode === 'edit') && (
                            <Button onClick={handleSubmit} variant="contained" color="primary">
                                {mode === 'create' ? "Créer" : "Enregistrer"}
                            </Button>
                        )}
                    </DialogActions>
                </Dialog>

                <Snackbar open={!!notification} autoHideDuration={3000} onClose={() => setNotification(null)}>
                    <Alert severity="success" sx={{ width: '100%' }}>{notification}</Alert>
                </Snackbar>

            </Container>
        </Box>
    );
}