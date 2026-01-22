# 🚀 Project Management System

<p align="center">
  <strong>Jabalpur Engineering College - Academic & Non-Academic Project Management</strong>
</p>

<p align="center">
  A modern, full-stack project management system built with Next.js 16 and Supabase for managing academic projects, mentorship, and student-mentor collaboration.
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#tech-stack"><strong>Tech Stack</strong></a> ·
  <a href="#getting-started"><strong>Getting Started</strong></a> ·
  <a href="#environment-variables"><strong>Environment Variables</strong></a>
</p>

---

## ✨ Features

### 👨‍🎓 For Students
- Complete onboarding with academic details (Department, Roll No, Year)
- Browse and apply for projects
- Track project progress
- Connect with mentors

### 👨‍🏫 For Mentors
- Create and manage projects
- Guide students through project lifecycle
- Review and approve project submissions
- Skill-based profile management

### 🔐 Authentication & Security
- Email/Password authentication via Supabase Auth
- Role-based access control (Student, Mentor, Admin)
- Protected routes with middleware
- Secure session management with cookies

### 🎨 User Experience
- Modern, responsive UI with Tailwind CSS
- Dark/Light theme support
- Form validation with Zod v4
- Toast notifications with Sonner
- Smooth loading states

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth |
| **Styling** | Tailwind CSS |
| **UI Components** | shadcn/ui + Radix UI |
| **Forms** | React Hook Form + Zod v4 |
| **State** | React Server Components |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/siddhant385/project-management.git
   cd project-management
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   
   Visit [http://localhost:3000](http://localhost:3000)

---

## 🔑 Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key |

> **Note:** Both legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` and new `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are supported.

---

## 📁 Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard
│   ├── auth/              # Authentication pages
│   ├── mentor/            # Mentor dashboard & onboarding
│   ├── profile/           # User profile management
│   ├── projects/          # Project pages
│   └── student/           # Student dashboard & onboarding
├── actions/               # Server Actions
├── components/            # React components
│   ├── auth/             # Auth-related components
│   ├── profile/          # Profile components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utility functions
│   └── supabase/         # Supabase client setup
└── schemas/              # Zod validation schemas
```

---

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ for Jabalpur Engineering College
</p>
