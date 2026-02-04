# Productive Dashboard 🚀

![Version](https://img.shields.io/badge/version-1.17-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

A modern, high-performance productivity dashboard built with React 19, Vite, and Supabase. Designed to help you plan, prioritize, and accomplish your tasks with ease.

## ✨ Features

- **✅ Task Management**: Create, edit, prioritize, and categorize tasks.
- **🔥 Habit Tracking**: Track daily habits, maintain streaks, and visualize progress with heatmaps.
- **📝 Smart Notes**: Markdown-supported note-taking with cloud sync.
- **📊 Analytics**: Visual insights into your productivity and completion rates.
- **🌗 Dark Mode**: Beautifully crafted dark theme mixed with glassmorphism UI.
- **⚡ Real-time Sync**: Data persists across devices using Supabase.
- **🔔 Notifications**: Deadline alerts and push notifications.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, Shadcn UI (inspired)
- **Animations**: Framer Motion
- **Database & Auth**: Supabase
- **Charts**: Recharts
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- A Supabase project

### Installation

1. **Clone the repository**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Database Setup**
   Run the SQL migration script in your Supabase SQL Editor to set up tables and permissions:
   - Use `db-fix-policies.sql` (found in project root or artifacts) to create `tasks`, `habits`, `notes`, and `profiles` tables with Row Level Security (RLS).

5. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
