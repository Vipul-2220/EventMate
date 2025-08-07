const express = require('express');
const Event = require('../models/Event');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/events
// @desc    Get all events with filtering and pagination
// @access  Public
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            category,
            search,
            featured,
            status = 'published',
            sortBy = 'date',
            sortOrder = 'asc'
        } = req.query;

        const query = { status };

        // Add filters
        if (category) query.category = category;
        if (featured) query.featured = featured === 'true';
        if (search) {
            query.$text = { $search: search };
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const events = await Event.find(query)
            .populate('organizer', 'name email')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const total = await Event.countDocuments(query);

        res.json({
            events,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/events/:id
// @desc    Get single event by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('organizer', 'name email')
            .populate('registeredUsers', 'name email');

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json(event);
    } catch (error) {
        console.error('Get event error:', error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/events
// @desc    Create a new event
// @access  Private/Admin
router.post('/', adminAuth, async (req, res) => {
    try {
        const eventData = {
            ...req.body,
            organizer: req.user._id
        };

        const event = new Event(eventData);
        await event.save();

        // Add event to user's events
        await User.findByIdAndUpdate(
            req.user._id,
            { $push: { events: event._id } }
        );

        const populatedEvent = await Event.findById(event._id)
            .populate('organizer', 'name email');

        res.status(201).json({
            message: 'Event created successfully',
            event: populatedEvent
        });
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/events/:id
// @desc    Update an event
// @access  Private (organizer or admin)
router.put('/:id', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if user is organizer or admin
        if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this event' });
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('organizer', 'name email');

        res.json({
            message: 'Event updated successfully',
            event: updatedEvent
        });
    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/events/:id
// @desc    Delete an event
// @access  Private (organizer or admin)
router.delete('/:id', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if user is organizer or admin
        if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this event' });
        }

        await Event.findByIdAndDelete(req.params.id);

        // Remove event from user's events
        await User.findByIdAndUpdate(
            req.user._id,
            { $pull: { events: req.params.id } }
        );

        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/events/:id/register
// @desc    Register for an event
// @access  Private
router.post('/:id/register', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            console.error('Event not found:', req.params.id);
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.status !== 'published') {
            console.error('Event not published:', event.status);
            return res.status(400).json({ message: 'Event is not available for registration', reason: 'status', status: event.status });
        }

        if (event.isFull) {
            console.error('Event is full:', event.capacity, event.registeredUsers.length);
            return res.status(400).json({ message: 'Event is full', reason: 'full', capacity: event.capacity, registered: event.registeredUsers.length });
        }

        // Check if user is already registered
        if (event.registeredUsers.includes(req.user._id)) {
            console.error('User already registered:', req.user._id);
            return res.status(400).json({ message: 'Already registered for this event', reason: 'already_registered' });
        }

        // Add user to event registrations
        event.registeredUsers.push(req.user._id);
        await event.save();

        // Add event to user's registered events
        await User.findByIdAndUpdate(
            req.user._id,
            { $push: { registeredEvents: event._id } }
        );

        res.json({
            message: 'Successfully registered for event',
            event: await Event.findById(event._id).populate('organizer', 'name email')
        });
    } catch (error) {
        console.error('Register for event error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/events/:id/register
// @desc    Unregister from an event
// @access  Private
router.delete('/:id/register', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if user is registered
        if (!event.registeredUsers.includes(req.user._id)) {
            return res.status(400).json({ message: 'Not registered for this event' });
        }

        // Remove user from event registrations
        event.registeredUsers = event.registeredUsers.filter(
            userId => userId.toString() !== req.user._id.toString()
        );
        await event.save();

        // Remove event from user's registered events
        await User.findByIdAndUpdate(
            req.user._id,
            { $pull: { registeredEvents: event._id } }
        );

        res.json({
            message: 'Successfully unregistered from event',
            event: await Event.findById(event._id).populate('organizer', 'name email')
        });
    } catch (error) {
        console.error('Unregister from event error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/events/user/created
// @desc    Get events created by current user
// @access  Private
router.get('/user/created', auth, async (req, res) => {
    try {
        const events = await Event.find({ organizer: req.user._id })
            .populate('organizer', 'name email')
            .sort({ createdAt: -1 });

        res.json(events);
    } catch (error) {
        console.error('Get user events error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/events/user/registered
// @desc    Get events user is registered for
// @access  Private
router.get('/user/registered', auth, async (req, res) => {
    try {
        const events = await Event.find({ registeredUsers: req.user._id })
            .populate('organizer', 'name email')
            .sort({ date: 1 });

        res.json(events);
    } catch (error) {
        console.error('Get registered events error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
