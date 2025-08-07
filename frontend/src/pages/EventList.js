import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
  Alert,
  Fab,
  Tooltip
} from '@mui/material';
import {
  Event as EventIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import api from '../utils/api';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

const MotionCard = motion(Card);

const EventList = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('asc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState([]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 12,
        sortBy,
        sortOrder,
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter && { category: categoryFilter })
      });

      const response = await axios.get(`/api/events?${params}`);
      setEvents(response.data.events);
      setTotalPages(response.data.totalPages);
      setError(null);
    } catch (err) {
      setError('Failed to fetch events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [page, searchTerm, categoryFilter, sortBy, sortOrder]);

  useEffect(() => {
    // Fetch user's registered events after login or when events change
    const fetchRegisteredEvents = async () => {
      if (isAuthenticated && user) {
        try {
          const res = await api.get('/users/me/registered-events');
          setRegisteredEvents(res.data.events.map(e => e._id));
        } catch (err) {
          setRegisteredEvents([]);
        }
      } else {
        setRegisteredEvents([]);
      }
    };
    fetchRegisteredEvents();
  }, [isAuthenticated, user, events]); // also run when events change

  const handleDeleteEvent = async () => {
    try {
      await axios.delete(`/api/events/${eventToDelete._id}`);
      setEvents(events.filter(event => event._id !== eventToDelete._id));
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    } catch (err) {
      setError('Failed to delete event');
      console.error('Error deleting event:', err);
    }
  };

  const openDeleteDialog = (event) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const canManageEvent = (event) => {
    return user?.role === 'admin' || event.organizer?._id === user?._id;
  };

  const handleRegister = async (eventId, isRegistered) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setRegistering(true);
    try {
      if (isRegistered) {
        await api.delete(`/events/${eventId}/register`);
        setRegisteredEvents(registeredEvents.filter(id => id !== eventId));
      } else {
        await api.post(`/events/${eventId}/register`);
        setRegisteredEvents([...registeredEvents, eventId]);
      }
      fetchEvents();
    } catch (err) {
      setError('Failed to update registration');
    } finally {
      setRegistering(false);
    }
  };

  const generateETicket = async (event, user) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('E-Ticket', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Event: ${event.title}`, 20, 40);
    doc.text(`Date: ${new Date(event.date).toLocaleString()}`, 20, 50);
    doc.text(`Location: ${typeof event.location === 'object' && event.location !== null ? `${event.location.address || ''}, ${event.location.city || ''}, ${event.location.state || ''} ${event.location.zipCode || ''}`.replace(/^, |, , |, $| $/g, '').trim() : event.location || ''}`, 20, 60);
    doc.text(`Name: ${user.name}`, 20, 70);
    doc.text(`Email: ${user.email}`, 20, 80);
    doc.text(`Ticket ID: ${user._id}-${event._id}`, 20, 90);
    doc.text('Show this ticket at the event entrance.', 20, 110);
    const qrData = JSON.stringify({
      user: { name: user.name, email: user.email, id: user._id },
      event: { title: event.title, id: event._id, date: event.date }
    });
    const qrUrl = await QRCode.toDataURL(qrData);
    doc.addImage(qrUrl, 'PNG', 140, 40, 50, 50);
    return doc;
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 8, mb: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Events
          </Typography>
          {user?.role === 'admin' && (
            <Tooltip title="Create New Event">
              <Fab
                color="primary"
                aria-label="add"
                onClick={() => navigate('/create-event')}
                sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}
              >
                <AddIcon />
              </Fab>
            </Tooltip>
          )}
        </Box>

        {/* Search and Filters */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Category"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  <MenuItem value="conference">Conference</MenuItem>
                  <MenuItem value="workshop">Workshop</MenuItem>
                  <MenuItem value="seminar">Seminar</MenuItem>
                  <MenuItem value="meetup">Meetup</MenuItem>
                  <MenuItem value="concert">Concert</MenuItem>
                  <MenuItem value="sports">Sports</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="date">Date</MenuItem>
                  <MenuItem value="title">Title</MenuItem>
                  <MenuItem value="createdAt">Created</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                startIcon={<FilterIcon />}
              >
                {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Events Grid */}
        {events.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <EventIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {"No events found"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm || categoryFilter ? 'Try adjusting your search criteria.' : 'Check back later for new events.'}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {events.map((event, index) => {
              const isRegistered = registeredEvents.map(String).includes(String(event._id));
              return (
                <Grid item xs={12} sm={6} md={4} key={event._id}>
                  <MotionCard
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                        transition: 'all 0.3s ease'
                      }
                    }}
                    onClick={() => navigate(`/events/${event._id}`)}
                  >
                    <Box
                      sx={{
                        height: 200,
                        background: `linear-gradient(135deg, ${event.featured ? '#1976d2' : '#f5f5f5'}, ${event.featured ? '#42a5f5' : '#e0e0e0'})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                      }}
                    >
                      <EventIcon sx={{ fontSize: 64, color: event.featured ? 'white' : 'text.secondary' }} />
                      {event.featured && (
                        <Chip
                          label="Featured"
                          color="secondary"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8
                          }}
                        />
                      )}
                      <Chip
                        label={event.status}
                        color={getStatusColor(event.status)}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8
                        }}
                      />
                    </Box>

                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="h2" gutterBottom noWrap>
                        {event.title || ''}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <ScheduleIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(event.date) || ''}
                        </Typography>
                      </Box>

                      {event.location && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocationIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {typeof event.location === 'object' && event.location !== null
                              ? `${event.location.address || ''}, ${event.location.city || ''}, ${event.location.state || ''} ${event.location.zipCode || ''}`.replace(/^, |, , |, $| $/g, '').trim()
                              : event.location || ''}
                          </Typography>
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <PersonIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {event.organizer?.name || 'Unknown Organizer'}
                        </Typography>
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {event.description || ''}
                      </Typography>

                      {event.category && (
                        <Chip
                          label={event.category}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </CardContent>

                    <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                      <Button size="small" color="primary" onClick={() => navigate(`/events/${event._id}`)}>
                        View Details
                      </Button>
                      {isAuthenticated && (
                        <Button
                          size="small"
                          color={isRegistered ? 'secondary' : 'success'}
                          disabled={registering}
                          onClick={e => {
                            e.stopPropagation();
                            handleRegister(event._id, isRegistered);
                          }}
                        >
                          {isRegistered ? 'Unregister' : 'Register'}
                        </Button>
                      )}
                      {isRegistered && (
                        <Button
                          size="small"
                          color="success"
                          onClick={async e => {
                            e.stopPropagation();
                            const doc = await generateETicket(event, user);
                            doc.save(`e-ticket-${event._id}.pdf`);
                          }}
                        >
                          Download E-Ticket
                        </Button>
                      )}
                      {canManageEvent(event) && (
                        <Box>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/events/${event._id}/edit`);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteDialog(event);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      )}
                    </CardActions>
                  </MotionCard>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
              size="large"
            />
          </Box>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          <Typography>
            {`Are you sure you want to delete "${eventToDelete?.title || ''}"? This action cannot be undone.`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteEvent} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EventList;
