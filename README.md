# Into The Wild - Adventure Platform

## 🏔️ Adventure Awaits

**Into The Wild** is a comprehensive **Progressive Web App (PWA)** trekking platform that connects adventure seekers with curated trekking experiences across India. Built for the modern explorer, it combines cutting-edge technology with authentic outdoor experiences.

---

## 📊 Current Platform Status

| Metric | Current | Target |
|--------|---------|--------|
| **Active Users** | 65+ | 10,000+ |
| **Treks Completed** | 53+ | 1,000+ |
| **WhatsApp Community** | 200+ | 5,000+ |
| **Platform Type** | Mobile-first PWA | Native-like experience |

---

## 🚀 Quick Start

### For Users
🌐 **Visit**: [intothewild.club](https://intothewild.club)  
📱 **Mobile-first PWA** with offline support and native app-like experience

### For Developers
```bash
# Clone the repository
git clone <your-repository-url>
cd into-the-wild

# Quick setup (5 minutes)
npm install
npm run dev

# Visit: http://localhost:8080
```

---

## 📚 Complete Documentation

All project documentation is organized in the `/docs/` folder:

### 🎯 **Essential Guides**

| Document | Purpose | Key Topics |
|----------|---------|------------|
| **[📖 PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md)** | Complete project setup & fundamentals | Tech stack, dependencies, setup, deployment |
| **[🏗️ TECHNICAL_ARCHITECTURE.md](docs/TECHNICAL_ARCHITECTURE.md)** | Technical implementation details | Code organization, performance, quality, security |
| **[🎨 DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)** | UI/UX design system & components | Colors, typography, accessibility, mobile design |
| **[💬 COMMUNICATION_SYSTEM.md](docs/COMMUNICATION_SYSTEM.md)** | Messaging & notification system | WhatsApp integration, automated reminders, admin tools |

### 🔍 **Quick Navigation**

**New to the project?** → Start with [PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md)  
**Need technical details?** → Check [TECHNICAL_ARCHITECTURE.md](docs/TECHNICAL_ARCHITECTURE.md)  
**Working on UI/UX?** → See [DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)  
**Building communication features?** → Review [COMMUNICATION_SYSTEM.md](docs/COMMUNICATION_SYSTEM.md)

---

## 🏗️ Architecture Highlights

### **Frontend Excellence**
- ⚡ **React 18** with Vite for lightning-fast development
- 🎨 **Golden Hour Design System** with dark mode support
- 📱 **Mobile-first PWA** optimized for Indian market
- 🔒 **TypeScript Strict** with comprehensive type safety
- 🚀 **71.6% bundle size reduction** with advanced optimization

### **Backend & Database**
- 🗄️ **Supabase** for PostgreSQL, Auth, Storage, and Edge Functions
- 🔐 **Row Level Security (RLS)** on all database tables
- 📊 **67+ Database migrations** with comprehensive schema
- ⚡ **Real-time subscriptions** for live updates
- 🌐 **Edge Functions** for serverless processing

### **Quality & Standards**
- 🧪 **Automated testing** with Vitest and comprehensive coverage
- 🎯 **Code quality agents** (7 specialized automation agents)
- ♿ **WCAG 2.1 AA compliance** for accessibility
- 🇮🇳 **Indian market compliance** (₹ currency, DD/MM/YYYY dates, GST)
- 📈 **Performance budgets** with Lighthouse scoring 90+

---

## 🤝 Community & Support

### **For Trekkers**
- 🏔️ **Browse treks** by difficulty, location, and date
- 📝 **Easy registration** with indemnity acceptance
- 💬 **WhatsApp groups** for each trek (200+ active members)
- 📱 **Real-time notifications** for updates and reminders
- 📸 **Photo sharing** and community engagement

### **For Partners & Admins**
- 👥 **User management** with verification workflows
- 📊 **Comprehensive dashboard** with analytics
- 🎯 **Bulk communication tools** across multiple channels
- 🔄 **Automated workflows** for trek lifecycle management
- 📈 **Performance monitoring** and quality metrics

---

## 🛠️ Development

### **Prerequisites**
- **Node.js 22.x** (LTS) - Required for production compatibility
- **npm** - Package management
- **Docker** - Local development environment
- **Supabase CLI** - Database management
- **Deno** - Edge Functions runtime

### **Getting Started**
```bash
# 1. Install dependencies
npm install

# 2. Start local Supabase (database + backend)
npx supabase start

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 4. Run database migrations
npx supabase db reset

# 5. Start development server
npm run dev
```

### **Quality Gates**
```bash
# Pre-commit checks (automated)
npm run precommit          # TypeScript + ESLint + Tests

# Enhanced quality analysis
npm run quality-check:strict  # Strict mode + comprehensive testing

# Full project analysis
npm run full-analysis      # All quality agents in sequence
```

---

## 📄 License

This project is built with ❤️ for the Indian trekking community.

---

**📚 [View Complete Documentation](docs/PROJECT_OVERVIEW.md)** | **🚀 [Start Developing](docs/PROJECT_OVERVIEW.md)** | **🎨 [Design System](docs/DESIGN_SYSTEM.md)**