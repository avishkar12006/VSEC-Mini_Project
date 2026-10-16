const mongoose = require('mongoose');
const { Schema } = mongoose;

const CATEGORIES = ['ctf', 'cybersecurity', 'hackathons', 'web-tech', 'workshops'];
const BADGES = [
  'Participant', 'Completed', 'Qualified', 'Internship',
  'Achievement', 'Speaker', 'Winner', '3rd Place', '2nd Place', '1st Place'
];

const certificateSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    issuer: { type: String, default: '', trim: true, maxlength: 200 },
    category: { type: String, required: true, enum: CATEGORIES },
    badge: { type: String, default: 'Participant', enum: BADGES },
    date: { type: String, default: '', maxlength: 60 },
    featured: { type: Boolean, default: false },
    image: { type: String, default: null },
    thumb: { type: String, default: null },
    images: [{ _id: false, src: String, caption: String }],
    prize: { type: String, default: null },
    description: { type: String, default: '', maxlength: 600 },
    note: { type: String, default: '' }, // private to-do for the owner, never sent to the public API
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const projectSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    summary: { type: String, default: '' },
    status: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    problem: { type: String, default: '' },
    built: [String],
    outcome: { type: String, default: '' },
    stack: [String],
    links: [{ _id: false, label: String, url: String }],
    role: { type: String, default: '' },
    image: { type: String, default: '' },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const experienceSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    role: { type: String, required: true },
    org: { type: String, required: true },
    type: { type: String, default: 'internship' },
    range: { type: String, default: '' },
    status: { type: String, default: '' },
    points: [String],
    proof: [String], // certificate slugs that back this entry up
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const messageSchema = new Schema(
  {
    name: { type: String, required: true, maxlength: 80 },
    email: { type: String, required: true, maxlength: 120 },
    message: { type: String, required: true, maxlength: 2000 }
  },
  { timestamps: true }
);

module.exports = {
  CATEGORIES,
  BADGES,
  Certificate: mongoose.model('Certificate', certificateSchema),
  Project: mongoose.model('Project', projectSchema),
  Experience: mongoose.model('Experience', experienceSchema),
  Message: mongoose.model('Message', messageSchema)
};
