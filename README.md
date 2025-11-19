# Todo App - Next.js + Supabase

A modern, full-featured todo application built with Next.js 15, Supabase, and shadcn/ui components.

## Features

- ✨ **Modern UI** - Beautiful, responsive design with shadcn/ui components
- 🔐 **Authentication** - Secure sign up/sign in with Supabase Auth
- 📝 **Todo Management** - Create, read, update, and delete todos
- 📊 **Dashboard** - View todos by Today, Completed, and Pending
- 👥 **User Management** - Admin panel for managing users and permissions
- 🚫 **Ban System** - Block users from accessing the application
- 🎨 **Dark Mode** - Full dark mode support
- ⚡ **Real-time** - Live updates using Supabase real-time subscriptions
- 🔒 **SSR** - Server-side rendering for better performance and SEO

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **UI Components:** shadcn/ui
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Notifications:** Sonner

## Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd next-supabase
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project on [Supabase](https://supabase.com)
2. Run the SQL schema from `supabase-schema.sql` in your Supabase SQL Editor
3. Get your project URL and anon key from Project Settings → API

### 4. Configure environment variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

> **Note:** The service role key is required for admin features like deleting users from auth.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   │   ├── login/
│   │   └── signup/
│   ├── (private)/         # Protected routes
│   │   ├── dashboard/
│   │   └── admin/
│   └── api/               # API routes
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   ├── admin/            # Admin panel components
│   ├── ui/               # shadcn/ui components
│   └── context/          # React context providers
├── lib/                  # Utility functions
│   ├── supabase-client.js   # Client-side Supabase
│   └── supabase-server.js   # Server-side Supabase
└── hooks/                # Custom React hooks

```

## Features Overview

### Dashboard
- View all todos with filtering (Today, Completed, Pending)
- Add new todos with title, description, and due date
- Mark todos as complete/incomplete
- Edit existing todos
- Delete todos
- Real-time updates across all tabs

### Admin Panel
- View all registered users
- Grant/revoke admin privileges
- Block/unblock users
- Delete users (including from authentication)
- View user statistics (total, active, blocked)

### Authentication
- User registration with email and password
- User login with credential verification
- Automatic blocking of banned users on login
- Secure session management

## Database Schema

The app uses the following tables:

- **profiles** - User profiles with admin and blocked status
- **todos** - Todo items with title, description, due date, and completion status

All tables have proper foreign key relationships and cascade delete rules.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables in Project Settings
4. Deploy!

### Environment Variables for Production

Make sure to set all three environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Security Notes

- Row Level Security (RLS) is disabled on all tables for simplicity
- The service role key is required for admin operations
- Never expose your service role key in client-side code
- All admin operations are verified server-side

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

If you have any questions or run into issues, please open an issue on GitHub.

---

Built with ❤️ using Next.js and Supabase
