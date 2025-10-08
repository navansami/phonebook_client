# Telbook Client - React Frontend

Modern React application built with Vite, Tailwind CSS, and TanStack Query for the Telbook telephone directory.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at **http://localhost:5173**

## 📦 Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **TanStack Query** - Server state management
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications
- **Lucide React** - Icon library
- **EmailJS** - Email service integration

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ContactCard.jsx         # Contact card in grid
│   ├── Sidebar.jsx             # Navigation sidebar
│   ├── SearchOverlay.jsx       # Desktop search overlay
│   ├── SearchBar.jsx           # Mobile search bar
│   ├── TagCloud.jsx            # Tag filter chips
│   ├── LanguageBar.jsx         # Language filter chips
│   ├── Pagination.jsx          # Pagination controls
│   ├── ContactDetailModal.jsx  # Contact details modal
│   ├── ContactFormModal.jsx    # Add/edit contact form
│   ├── ConfirmModal.jsx        # Confirmation dialog
│   ├── EmergencyModal.jsx      # Emergency numbers
│   ├── LocationModal.jsx       # Hotel location info
│   ├── HelpModal.jsx           # Help/instructions
│   ├── WhatsAppButton.jsx      # ERT WhatsApp alert
│   ├── Loader.jsx              # Loading spinner
│   └── ProtectedRoute.jsx      # Route authentication
│
├── contexts/            # React Context providers
│   ├── ThemeContext.jsx        # Dark/light theme
│   ├── FavoritesContext.jsx    # Favorites management
│   └── AuthContext.jsx         # Authentication state
│
├── services/            # API service layer
│   ├── api.js                  # Axios instance
│   ├── contactsApi.js          # Contact endpoints
│   ├── authApi.js              # Auth endpoints
│   └── emailService.js         # EmailJS integration
│
├── pages/               # Page components
│   ├── HomePage.jsx            # Main public directory
│   ├── AdminDashboard.jsx      # Admin panel
│   └── Login.jsx               # Admin login
│
├── layouts/             # Layout components
│   ├── PublicLayout.jsx        # Public pages wrapper
│   └── AdminLayout.jsx         # Admin pages wrapper
│
├── App.jsx              # Main app component
├── main.jsx             # Entry point
└── index.css            # Global styles
```

## 🎨 Styling

### Theme
- **Gold Accent:** #D4AF37
- **Dark Mode:** Default (gray backgrounds)
- **Light Mode:** Off-white backgrounds
- **Fonts:** Playfair Display (headings), Inter (body)

### Responsive Breakpoints
- **Mobile:** < 600px
- **Tablet:** 600px - 899px
- **Desktop:** ≥ 900px

## 🔌 Environment Variables

Create `.env` file:

```bash
# API Base URL
VITE_API_BASE_URL=http://localhost:8000

# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=service_v05kais
VITE_EMAILJS_USER_ID=Q-T5NGrls4U4NKL8q
VITE_EMAILJS_TEMPLATE_NEW=template_qqqsa1t
VITE_EMAILJS_TEMPLATE_EDIT=template_k9r01xb
```

## 📱 Features

### Public App
- Browse all contacts
- Favorite contacts (star icon)
- Advanced search (Tab key)
- Filter by tags & languages
- Sort by name/department/extension
- Contact details modal
- Quick actions (email, Teams, call)
- Dark/light theme toggle
- Emergency numbers
- Location info
- Help modal

### Admin Dashboard
- Secure JWT authentication
- Full CRUD operations
- Data table view
- Search and sort
- Toggle ERT status
- Real-time updates

### Emergency Response Team (ERT)
- Filter ERT members
- WhatsApp emergency alerts
- Visual ERT badges

## 🛠️ Development

```bash
npm install     # Install dependencies
npm run dev     # Start dev server
npm run build   # Build for production
npm run preview # Preview production build
```

## 🐛 Common Issues

**API Connection Errors**
- Check `VITE_API_BASE_URL` in `.env`
- Ensure backend is running on port 8000

**Authentication Issues**
- Clear localStorage and retry
- Verify admin credentials

---

**Built for Fairmont The Palm**

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
