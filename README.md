# Mobile Movie App 📱🎬

A modern, cross-platform mobile application for discovering, browsing, and managing your favorite movies. Built with React Native and Expo, this app provides an intuitive interface to explore movie databases, view details, and keep track of your watchlist.

## 🚀 Features

- **Movie Discovery**: Browse trending, popular, and top-rated movies
- **Detailed Movie Information**: View comprehensive movie details including cast, crew, ratings, and trailers
- **Search Functionality**: Find movies by title, genre, or actor
- **Watchlist Management**: Save movies to your personal watchlist for later viewing
- **Offline Support**: Cache movie data for offline browsing
- **Cross-Platform**: Works seamlessly on iOS and Android devices
- **Dark/Light Theme**: Automatic theme switching based on device preferences
- **Responsive Design**: Optimized for various screen sizes and orientations

## 📸 Screenshots

*Add screenshots of your app here*

## 🛠️ Tech Stack

- **Framework**: [Expo](https://expo.dev) - React Native framework
- **Language**: TypeScript
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) - File-based routing
- **UI Components**: Custom themed components with React Native
- **State Management**: React hooks and context
- **API**: The Movie Database (TMDb) API
- **Styling**: Tailwind CSS-inspired theming system

## 📋 Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager
- Expo CLI
- iOS Simulator (for iOS development) or Android Studio (for Android development)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mobile_movie_app.git
   cd mobile_movie_app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Create a `.env` file in the root directory
   - Add your TMDb API key:
     ```
     TMDB_API_KEY=your_api_key_here
     ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on device/simulator**
   - For Expo Go: Scan the QR code with the Expo Go app
   - For development build: Follow Expo's development build guide

## 📖 Usage

### Navigation
- **Home**: Browse trending movies
- **Explore**: Search and discover new movies
- **Watchlist**: View your saved movies

### Adding to Watchlist
1. Open a movie details page
2. Tap the bookmark icon to add/remove from watchlist

### Searching Movies
1. Navigate to the Explore tab
2. Use the search bar to find movies by title or keywords

## 🏗️ Project Structure

```
mobile_movie_app/
├── app/                    # Main application code (file-based routing)
│   ├── _layout.tsx        # Root layout
│   ├── modal.tsx          # Modal screens
│   └── (tabs)/            # Tab-based navigation
│       ├── _layout.tsx
│       ├── index.tsx      # Home screen
│       └── explore.tsx    # Explore screen
├── assets/                # Static assets (images, fonts)
├── components/            # Reusable UI components
│   ├── ui/               # UI-specific components
│   └── ...               # Other components
├── constants/             # App constants and themes
├── hooks/                 # Custom React hooks
└── scripts/               # Utility scripts
```

## 🔄 Development

### Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device
- `npm run web` - Run in web browser
- `npm run reset-project` - Reset to a fresh project state

### Code Style

This project uses ESLint for code linting. Run `npm run lint` to check for issues.

### Testing

*Add testing instructions here*

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [The Movie Database (TMDb)](https://www.themoviedb.org/) for providing movie data
- [Expo](https://expo.dev) for the amazing React Native framework
- [React Native Community](https://github.com/react-native-community) for various libraries

## 📞 Support

If you have any questions or issues, please open an issue on GitHub or contact the development team.

---

*Built with ❤️ using Expo and React Native*
