# CinePulse - Premium Movie & TV List Manager

CinePulse is a modern, high-performance web application for managing personal movie and TV series watchlists, favorites, custom collections, and viewing history. Powered by **The Movie Database (TMDB) API v3/v4**, CinePulse features authentic TMDB OAuth login, auto-detected regional watch providers, season/episode browsers, and clean Apple Human Interface Guidelines design.

---

## ✨ Features

- **Authentic TMDB OAuth Authentication**: Direct user session login via `themoviedb.org` without password storage.
- **Apple HIG Minimalist Design**: Elegant frosted glass cards, subtle animations, compact touch targets, and full Apple Light & Dark mode support.
- **Automatic Browser Region Auto-Detection**: Detects user's country from browser timezone and locale (e.g. 🇺🇸 US, 🇮🇳 India, 🇬🇧 UK, 🇨🇦 Canada, 🇦🇺 Australia, 🇩🇪 Germany, 🇫🇷 France, 🇯🇵 Japan, 🇰🇷 South Korea) to display local OTT watch providers (Netflix, Prime Video, Disney+, Apple TV+, Hotstar).
- **Infinite Discovery & Filtering**: Filter titles by genre, regional PG certification (US: G/PG/PG-13/R, IN: U/UA/A, UK: 12A/15/18), original language, and cast/director search.
- **TV Series Season & Episode Browser**: Browse episode air dates, stills, and synopses.
- **Share Title Links**: One-click sharing for official TMDB title links & streaming provider links.
- **Custom Collections & Account Sync**: Manage custom user lists, Watchlist, Favorites, and Watched/Seen items.

---

## 🛠️ Built With

- **React 19** + **TypeScript** + **Vite**
- **TanStack Query (React Query v5)**
- **TanStack Router** (File-based routing)
- **Tailwind CSS v4** + **shadcn/ui**
- **Lucide Icons**

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm / pnpm / yarn.

### Installation

1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/your-username/cinepulse.git
   cd cinepulse
   npm install
   ```

2. Set up environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your TMDB API Read Access Token (v4 Bearer Token) in `.env`:
   ```env
   VITE_TMDB_READ_TOKEN=your_v4_bearer_access_token_here
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

---

## 📂 Project Structure

```
cinepulse/
├── src/
│   ├── components/       # Reusable UI components & navigation
│   ├── lib/              # TMDB API client, geo-region detector & utils
│   ├── modules/
│   │   ├── auth/         # TMDB OAuth hooks & login components
│   │   ├── filters/      # Advanced drawer filters state & controls
│   │   ├── lists/        # User lists, watchlist & quick media actions
│   │   └── media/        # Media cards, hero carousel, detail modals
│   ├── routes/           # TanStack file-based routes
│   ├── App.tsx           # Main application root
│   └── index.css         # Apple HIG CSS theme tokens & utilities
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore configuration
└── package.json
```

---

## 📄 License

MIT License.
