# Cinemate - Premium Movie Discovery Platform 🍿✨

Cinemate is a state-of-the-art mobile application built with **React Native (Expo)**, designed to provide a cinematic movie-watching and discovery experience. It features a stunning "Masterpiece" UI influenced by modern streaming aesthetics, integrated with real-time data and cloud-based user management.

## 🌟 Key Features

### 🎬 Cinematic UI/UX
- **Masterpiece Design System**: Ultra-modern dark theme with glassmorphism, vibrant red accents, and subtle micro-animations.
- **Dynamic Hero Carousel**: Beautifully rendered trending masterpieces with glass rating badges and gradient overlays.
- **Frosted Glass Navigation**: Premium tab bar and header using `BlurView` for a high-end feel.

### 🎭 Intelligent Discovery
- **Mood Suggester**: Feeling "Happy", "Sad", or "Spooky"? Discover movies perfectly matched to your emotional state using our custom genre-mapping engine.
- **Smart Filtering**: Seamlessly toggle between "All", "Movies", and "TV Series" with real-time content updates.
- **Contextual "See All"**: Explore full grids of movies with titles that change based on your active filters or selected mood.

### 🔐 Secure Identity & Data
- **Clerk Authentication**: Robust user authentication featuring Google OAuth and secure session management.
- **Neon Database Integration**: Scalable PostgreSQL backend via Neon for persistent user profiles and personalized data.
- **Automatic Sync**: Real-time synchronization between Clerk auth metadata and your Neon database profile.

## 🛠️ Tech Stack

- **Frontend**: React Native, Expo, Expo Router (File-based routing)
- **Styling**: Vanilla CSS-in-JS, Expo Linear Gradient, Expo Blur
- **Authentication**: [@clerk/clerk-expo](https://clerk.com)
- **Database**: [Neon PostgreSQL](https://neon.tech)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team)
- **API**: TMDB (The Movie Database) API
- **Build**: EAS (Expo Application Services)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or newer)
- npm or yarn
- Expo Go app on your mobile device (for testing)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/hiruy72/mobile_movie_app.git
   cd mobile_movie_app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env` file in the root directory and add your keys:
   ```env
   EXPO_PUBLIC_TMDB_API_KEY=your_tmdb_key
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
   DATABASE_URL=your_neon_postgresql_url
   EXPO_PUBLIC_DATABASE_URL=your_neon_postgresql_url
   ```

4. **Start the development server**:
   ```bash
   npx expo start -c
   ```

### 📱 Building for Production

To build an installable Android APK:
```bash
eas build --platform android --profile preview
```

## 🏗️ Architecture

```
├── app/                  # Expo Router directory (screens & layouts)
│   ├── (tabs)/           # Main tab navigation
│   ├── profile/          # User profile management
│   ├── movie/            # Movie detailed views
│   └── see-all.tsx       # Dynamic grid view
├── utils/                # Service layer & configurations
│   ├── api.ts            # TMDB integration
│   ├── db.ts             # Neon/Drizzle setup
│   ├── schema.ts         # Database models
│   └── userService.ts    # Profile sync logic
├── assets/               # Local images and fonts
├── drizzle.config.ts     # DB migration settings
└── package.json          # Project dependencies
```

## 📜 Database Schema

We use Drizzle ORM to manage our Neon PostgreSQL instance:
- **Users Table**: Stores `id` (linked to Clerk), `email`, `full_name`, `avatar_url`, and `bio`.
- **Automatic Hooks**: Every sign-in triggers a `syncUserToDB` call to ensure local profiles stay updated with the cloud.

## 🤝 Contributing
Feel free to fork this project and submit PRs. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License
This project is licensed under the MIT License.

---
Built with ❤️ by the Cinemate Team.
