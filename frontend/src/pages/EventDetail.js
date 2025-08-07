import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Event as EventIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  People as PeopleIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

const MotionCard = motion(Card);

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [ticketUrl, setTicketUrl] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [checkingTicket, setCheckingTicket] = useState(false);

  console.log(user);
  useEffect(() => {
    fetchEvent();
  }, [id]);
  
  useEffect(() => {
    if (event && user && isAuthenticated) {
      setIsRegistered(event.registeredUsers?.some(
        u => u._id === user._id || u === user._id
      ));
    } else {
      setIsRegistered(false);
    }
  }, [event, user, isAuthenticated]);

  useEffect(() => {
    if (isRegistered && event && user) {
      setCheckingTicket(true);
      const tickets = JSON.parse(localStorage.getItem('etickets') || '{}');
      if (tickets[event._id]) {
        setTicketUrl(tickets[event._id]);
        setCheckingTicket(false);
      } else {
        // Generate ticket on the fly if not in localStorage
        generateETicket().then(() => setCheckingTicket(false));
      }
    } else {
      setTicketUrl(null);
    }
  }, [isRegistered, event, user]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/events/${id}`);
      setEvent(response.data);
      // Check if user is registered for this event
      console.log(isAuthenticated);
      console.log(user);
      if (isAuthenticated && user) {
        setIsRegistered(response.data.registeredUsers?.some(
          u => u._id === user._id || u === user._id
        ));
      } else {
        setIsRegistered(false);
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('You must be logged in to view this event.');
      } else {
        setError('Failed to fetch event details');
      }
      console.error('Error fetching event:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setConfirmDialogOpen(true);
  };

  const confirmRegister = async () => {
    try {
      setRegistering(true);
      if (isRegistered) {
        await api.delete(`/events/${id}/register`);
        setIsRegistered(false);
        setTicketUrl(null);
        setSuccessMessage('You have been unregistered from the event.');
      } else {
        await api.post(`/events/${id}/register`);
        setIsRegistered(true);
        generateETicket();
        setSuccessMessage('You have been successfully registered for this event!');
      }
      await fetchEvent();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register for event');
      setSuccessMessage('');
      console.error('Error registering for event:', err);
    } finally {
      setRegistering(false);
      setConfirmDialogOpen(false);
    }
  };

  const generateETicket = async () => {
    if (!event || !user) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('E-Ticket', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Event: ${event.title}`, 20, 40);
    doc.text(`Date: ${formatDate(event.date)}`, 20, 50);
    doc.text(`Location: ${typeof event.location === 'object' && event.location !== null ? `${event.location.address || ''}, ${event.location.city || ''}, ${event.location.state || ''} ${event.location.zipCode || ''}`.replace(/^, |, , |, $| $/g, '').trim() : event.location || ''}`, 20, 60);
    doc.text(`Name: ${user.name}`, 20, 70);
    doc.text(`Email: ${user.email}`, 20, 80);
    doc.text(`Ticket ID: ${user._id}-${event._id}`, 20, 90);
    doc.text('Show this ticket at the event entrance.', 20, 110);

    // QR Code data
    const qrData = JSON.stringify({
      user: { name: user.name, email: user.email, id: user._id },
      event: { title: event.title, id: event._id, date: event.date }
    });
    const qrUrl = await QRCode.toDataURL(qrData);
    doc.addImage(qrUrl, 'PNG', 140, 40, 50, 50);

    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    setTicketUrl(url);
    // Store in localStorage for profile page access
    let tickets = JSON.parse(localStorage.getItem('etickets') || '{}');
    tickets[event._id] = url;
    localStorage.setItem('etickets', JSON.stringify(tickets));
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

  const canManageEvent = () => {
    return user?.role === 'admin' || event?.organizer?._id === user?._id;
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

  if (error || !event) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Event Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {error || 'The event you are looking for does not exist.'}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/events')}
            sx={{ mt: 2 }}
          >
            Back to Events
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 8, mb: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/events')}
            sx={{ mr: 2 }}
          >
            Back to Events
          </Button>
          {canManageEvent() && (
            <Button
              startIcon={<EditIcon />}
              variant="outlined"
              onClick={() => navigate(`/events/${id}/edit`)}
              sx={{ ml: 'auto' }}
            >
              Edit Event
            </Button>
          )}
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Event Details */}
          <Grid item xs={12} md={8}>
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Typography variant="h4" component="h1" gutterBottom>
                    {event.title}
                  </Typography>
                  <Chip
                    label={event.status}
                    color={getStatusColor(event.status)}
                    size="medium"
                  />
                </Box>

                {event.featured && (
                  <Chip
                    label="Featured Event"
                    color="secondary"
                    sx={{ mb: 2 }}
                  />
                )}

                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  {event.description}
                </Typography>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <ScheduleIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {formatDate(event.date)}
                      </Typography>
                    </Box>
                  </Grid>
                  {event.location && (
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {typeof event.location === 'object' && event.location !== null
                            ? `${event.location.address || ''}, ${event.location.city || ''}, ${event.location.state || ''} ${event.location.zipCode || ''}`.replace(/^, |, , |, $| $/g, '').trim()
                            : event.location}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        Organized by {event.organizer?.name || 'Unknown'}
                      </Typography>
                    </Box>
                  </Grid>
                  {event.category && (
                    <Grid item xs={12} sm={6}>
                      <Chip
                        label={event.category}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </Grid>
                  )}
                </Grid>

                {/* Registration Button */}
                {event.status === 'published' && (
                  <Box sx={{ mt: 3 }}>
                    {successMessage && (
                      <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>
                    )}
                    <Button
                      variant={isRegistered ? "outlined" : "contained"}
                      size="large"
                      onClick={handleRegister}
                      disabled={registering}
                      startIcon={registering ? <CircularProgress size={20} /> : <PeopleIcon />}
                    >
                      {registering
                        ? 'Processing...'
                        : isRegistered
                          ? 'Unregister'
                          : 'Register for Event'
                      }
                    </Button>
                    {isRegistered && !checkingTicket && ticketUrl && (
                      <Button
                        variant="contained"
                        color="success"
                        sx={{ ml: 2 }}
                        onClick={() => window.open(ticketUrl, '_blank')}
                      >
                        Download E-Ticket
                      </Button>
                    )}
                    <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
                      <DialogTitle>{isRegistered ? 'Confirm Unregistration' : 'Confirm Registration'}</DialogTitle>
                      <DialogContent>
                        <Typography>
                          {isRegistered
                            ? 'Are you sure you want to unregister from this event?'
                            : 'Are you sure you want to register for this event?'}
                        </Typography>
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
                        <Button onClick={confirmRegister} variant="contained" color="primary" disabled={registering}>
                          Confirm
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </Box>
                )}
              </CardContent>
            </MotionCard>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <MotionCard
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Event Information
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Registered Attendees
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {event.registeredUsers?.length || 0}
                    {event.maxAttendees && ` / ${event.maxAttendees}`}
                  </Typography>
                </Box>

                {event.maxAttendees && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Available Spots
                    </Typography>
                    <Typography variant="h6">
                      {Math.max(0, event.maxAttendees - (event.registeredUsers?.length || 0))}
                    </Typography>
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                {event.registeredUsers && event.registeredUsers.length > 0 && (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Attendees
                    </Typography>
                    <List dense>
                      {event.registeredUsers.slice(0, 5).map((attendee, index) => (
                        <ListItem key={attendee._id || index}>
                          <ListItemAvatar>
                            <Avatar>
                              <PersonIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={attendee.name || 'Unknown User'}
                            secondary={attendee.email}
                          />
                        </ListItem>
                      ))}
                      {event.registeredUsers.length > 5 && (
                        <ListItem>
                          <ListItemText
                            secondary={`+${event.registeredUsers.length - 5} more attendees`}
                          />
                        </ListItem>
                      )}
                    </List>
                  </>
                )}
              </CardContent>
            </MotionCard>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default EventDetail;
