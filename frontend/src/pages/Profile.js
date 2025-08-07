import React from 'react';
import { Container, Typography, Box, Avatar, Grid, Card, CardContent, List, ListItem, ListItemAvatar, ListItemText, Divider } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import CalendarIcon from '@mui/icons-material/CalendarToday';
import jsPDF from 'jspdf';
import { useEvent } from '../context/EventContext';
import { Button, Alert } from '@mui/material';
import QRCode from 'qrcode';

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const { registeredEvents, getRegisteredEvents } = useEvent();
  const [ticketUrls, setTicketUrls] = React.useState({});
  const [successMessage, setSuccessMessage] = React.useState('');

  React.useEffect(() => {
    getRegisteredEvents();
  }, []);

  React.useEffect(() => {
    // Load ticket URLs from localStorage for registered events, generate if missing
    const tickets = JSON.parse(localStorage.getItem('etickets') || '{}');
    const urls = {};
    async function ensureTickets() {
      if (registeredEvents && registeredEvents.length > 0 && user) {
        for (const event of registeredEvents) {
          if (tickets[event._id]) {
            urls[event._id] = tickets[event._id];
          } else {
            // Generate ticket on the fly
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
            urls[event._id] = url;
            tickets[event._id] = url;
          }
        }
        setTicketUrls(urls);
        localStorage.setItem('etickets', JSON.stringify(tickets));
      }
    }
    ensureTickets();
  }, [registeredEvents, user]);

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

  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Please log in to view your profile.
          </Typography>
        </Box>
      </Container>
    );
  }
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            {user?.name?.[0]}
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {user?.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {user?.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Role: {user?.role}
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ my: 4 }} />
        <Typography variant="h5" gutterBottom>Registered Events</Typography>
        {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
        {registeredEvents && registeredEvents.length > 0 ? (
          <List>
            {registeredEvents.map((event) => (
              <ListItem key={event._id} alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar>
                    <CalendarIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={event.title}
                  secondary={formatDate(event.date)}
                />
                {ticketUrls[event._id] && (
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => window.open(ticketUrls[event._id], '_blank')}
                    sx={{ ml: 2 }}
                  >
                    Download E-Ticket
                  </Button>
                )}
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">You have not registered for any events yet.</Typography>
        )}
      </Box>
    </Container>
  );
};

export default Profile;
