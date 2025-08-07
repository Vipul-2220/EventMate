const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Event title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Event description is required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Event category is required'],
        enum: ['Technology', 'Business', 'Education', 'Entertainment', 'Sports', 'Health', 'Other']
    },
    date: {
        type: Date,
        required: [true, 'Event date is required']
    },
    time: {
        type: String,
        required: [true, 'Event time is required']
    },
    location: {
        address: {
            type: String,
            required: [true, 'Event address is required']
        },
        city: {
            type: String,
            required: [true, 'City is required']
        },
        state: {
            type: String,
            required: [true, 'State is required']
        },
        zipCode: {
            type: String,
            required: [true, 'Zip code is required']
        }
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    image: {
        type: String,
        default: ''
    },
    capacity: {
        type: Number,
        required: [true, 'Event capacity is required'],
        min: [1, 'Capacity must be at least 1']
    },
    registeredUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    price: {
        type: Number,
        default: 0,
        min: [0, 'Price cannot be negative']
    },
    isFree: {
        type: Boolean,
        default: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    status: {
        type: String,
        enum: ['draft', 'published', 'cancelled', 'completed'],
        default: 'draft'
    },
    featured: {
        type: Boolean,
        default: false
    },
    contactInfo: {
        email: String,
        phone: String,
        website: String
    },
    socialLinks: {
        facebook: String,
        twitter: String,
        instagram: String,
        linkedin: String
    }
}, {
    timestamps: true
});

// Virtual for remaining capacity
eventSchema.virtual('remainingCapacity').get(function() {
    return this.capacity - (Array.isArray(this.registeredUsers) ? this.registeredUsers.length : 0);
});

// Virtual for registration status
eventSchema.virtual('isFull').get(function() {
    return (Array.isArray(this.registeredUsers) ? this.registeredUsers.length : 0) >= this.capacity;
});

// Index for search functionality
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Ensure virtuals are serialized
eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);
