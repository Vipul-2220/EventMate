# EventMate – Development Roadmap

**EventMate** is a full-stack event management platform built with React, Node.js, Express, and MongoDB. This roadmap outlines the current progress, planned features, and areas of improvement for the project.

---

## Project Status: MVP Completed

The Minimum Viable Product (MVP) has been implemented with essential functionality for users and admins.

### Completed Core Modules

| Module                     | Status     | Description                                                                 |
|---------------------------|------------|-----------------------------------------------------------------------------|
| User Registration/Login   | Done       | Auth with JWT and bcrypt-based password hashing                            |
| Role-based Access Control | Done       | Users vs Admin privileges with middleware enforcement                       |
| Event CRUD (Admin only)   | Done       | Admin can create, edit, delete, and manage events                           |
| Event Registration        | Done       | Users can register/unregister from events                                   |
| User Dashboard            | Done       | Personalized dashboard for event tracking                                   |
| Protected Routes          | Done       | Route guards for unauthorized access                                        |
| UI/UX with MUI            | Done       | Responsive and accessible Material UI components                            |
| Context API Integration   | Done       | Efficient state management across the app                                   |
| Test Auth Page            | Done       | A dev utility page to verify JWT/token logic                                |
| Sample Seed Script        | Done       | `npm run setup` script to prefill database with users and events            |

---

## Short-Term Goals (Next 2–4 Weeks)

| Feature                        | Priority | Description                                                         |
|-------------------------------|----------|---------------------------------------------------------------------|
| Pagination for Events         | High     | Handle large event datasets with efficient pagination               |
| Organizer Role                | High     | Introduce a third role to manage only their created events          |
| Email Notifications           | Medium   | Send confirmation emails on registration/unregistration             |
| Event RSVP Limit              | Medium   | Limit max capacity per event with user feedback                     |
| Enhanced Search & Filters     | Medium   | Filter events by date, category, organizer, and registration status |
| UI Polish & Transitions       | Medium   | Add loading spinners, empty state handling, and smoother transitions|

---

## Mid-Term Goals (4–8 Weeks)

| Feature                        | Priority | Description                                                             |
|-------------------------------|----------|-------------------------------------------------------------------------|
| Google OAuth                  | High     | Allow users to sign in using Google                                    |
| Admin Analytics Dashboard     | Medium   | View number of events, users, registrations etc.                        |
| Event Comments & Reviews      | Medium   | Allow feedback and ratings on past events                              |
| Profile Avatar Upload         | Medium   | Users can add or update their profile picture                          |
| Improved Form Validation      | Medium   | UX-friendly validation across all forms                                |
| Accessibility Improvements    | Medium   | WCAG-compliant improvements and keyboard navigation                    |

---

## Deployment Plans

| Task                          | Status        | Description                                   |
|------------------------------|---------------|-----------------------------------------------|
| Environment Variable Cleanup | In Progress   | Use dotenv-safe and .env.example templates    |
| Dockerization                | Planned       | Add Docker support for local development      |
| CI/CD Pipeline               | Planned       | Setup GitHub Actions or Netlify for auto-deploy|
| Hosting                      | Planned       | Deploy on Render / Vercel / Railway / MongoDB Atlas |

---

## Long-Term Feature Ideas

| Idea                             | Description                                                                 |
|----------------------------------|-----------------------------------------------------------------------------|
| Real-Time Updates                | Use WebSockets or SSE to update registration status in real time           |
| QR Code Check-In                 | Generate QR codes for event entry and attendance tracking                  |
| Multi-language Support           | Add i18n support for Hindi and other languages                             |
| Event Categories & Tags         | Categorize events by type (Tech, Culture, Sports)                          |
| Mobile App Version               | Flutter or React Native version for mobile accessibility                   |

---

## Database Schema (v1)

### User Schema
```js
{
  name: String,
  email: String,
  password: String (hashed),
  role: 'user' | 'admin',
  registeredEvents: [EventID]
}
