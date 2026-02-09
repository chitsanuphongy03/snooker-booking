# 🎱 Snooker Booking System

Online Snooker Table Booking System with comprehensive Admin Management.

![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase&logoColor=white)

## ✨ Features

### 👤 Customer

- 📋 Real-time table availability
- 📅 Book tables with specific date and time selection
- 💳 Payment options (Pay at Shop / Bank Transfer)
- 🔍 Check booking status via phone number
- 📱 Fully Mobile Responsive

### 👨‍💼 Admin

- 🔐 Secure Login with Email/Password
- 📊 Dashboard with booking statistics
- 📋 Booking Management (Confirm, Cancel, Change Status)
- 🎱 Table Management (Add, Edit, Maintenance Mode)
- 📸 QR Code Scanning for booking verification
- ⚙️ Shop Settings (Pricing, Opening Hours, Bank Account)
- 📈 Revenue Reports

## 🛠️ Tech Stack

| Category | Technology                   |
| -------- | ---------------------------- |
| Frontend | React 18, TypeScript, Vite   |
| Styling  | Tailwind CSS                 |
| Backend  | Supabase (PostgreSQL + Auth) |
| Icons    | Lucide React                 |
| QR Code  | qrcode.react, html5-qrcode   |
| Testing  | Playwright                   |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase Account

### Installation

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/snooker-booking.git
cd snooker-booking

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env and add your Supabase credentials

# Run development server
npm run dev
```

### Environment Variables

Create a `.env` file and add the following variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📁 Project Structure

```
snooker-booking/
├── src/
│   ├── components/     # UI Components
│   ├── pages/          # Page Components
│   │   ├── admin/      # Admin Pages
│   │   └── customer/   # Customer Pages
│   ├── services/       # API Services
│   ├── hooks/          # Custom React Hooks
│   └── lib/            # Utilities & Supabase Client
└── public/             # Static Assets
```

## 📦 Scripts

| Script            | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start development server |
| `npm run build`   | Build for production     |
| `npm run preview` | Preview production build |
| `npm run lint`    | Run ESLint               |

## 📄 License

This project is licensed under the MIT License.

---

Made with ❤️ using React + Vite + Supabase
