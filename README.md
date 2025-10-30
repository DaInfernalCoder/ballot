# Ballot

A React Native mobile app built with Expo Router for discovering and curating local political and civic events. Features card-based browsing with advanced gesture interactions (swipe, flip, delete) and saved events management.

## ✨ Features

- 🤖 **AI-Powered Discovery**: Find civic events using Perplexity AI (via OpenRouter)
- 📍 **Location-Based Search**: GPS-enabled event discovery in your area
- 🎴 **Card Interface**: Tinder-style swipe interface for browsing events
- 💾 **Save Events**: Curate your personal collection of events
- 🖼️ **Dynamic Images**: Event images powered by Unsplash API
- ⚡ **Smooth Animations**: 60fps gesture-driven animations with Reanimated
- 🌙 **Dark Mode**: Sleek dark theme interface

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** (comes with Node.js)
- **Xcode** (latest version) - Required for iOS development
  - Download from the Mac App Store
  - After installation, open Xcode and install Command Line Tools
- **iOS Simulator** - Installed with Xcode
- **Expo CLI** - Will be installed with dependencies

### System Requirements

- **macOS** (required for iOS development)
- At least 8GB RAM (16GB recommended)
- 10GB+ free disk space

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/DaInfernalCoder/ballot.git
cd ballot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
OPENROUTER_API_KEY=your_openrouter_api_key_here
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_key_here
```

**Note**: If you don't configure API keys, the app will fall back to 3 sample events.

### 4. Run on iOS Simulator (iPhone 16 Pro Recommended)

The app is optimized for **iPhone 16 Pro** for best results.

**Option A: Start development server first (Recommended)**

```bash
npm start
```

Then press `i` to open in iOS simulator, or scan the QR code to open on a physical device.

**Option B: Direct iOS launch with iPhone 16 Pro**

```bash
npm run ios
```

This command is configured to automatically launch with iPhone 16 Pro simulator.

**Option C: Choose a different simulator**

```bash
# List available simulators
xcrun simctl list devices available

# Start Expo with a specific device
expo start --ios --device-id="DEVICE_ID_HERE"
```

### 5. First Launch Setup

1. The simulator will launch automatically
2. The app will open and request location permissions
3. Grant location access for the best experience
4. Start discovering civic events in your area!

## 🎮 Usage

### Home Screen (Discovery)
- **Swipe Right**: Save event to your collection
- **Swipe Left**: Dismiss event
- **Tap Card**: Flip to see event details
- **Scroll Vertically**: Browse through events

### Events Screen (Saved)
- View your saved events
- **Swipe Left**: Delete saved event
- **Tap Card**: View detailed information

## 🛠️ Development Commands

```bash
# Start development server
npm start

# Run on iOS (iPhone 16 Pro)
npm run ios

# Run on Android
npm run android

# Run on web browser
npm run web
```

## 🏗️ Tech Stack

- **Framework**: React Native 0.81.5 with Expo ~54.0.18
- **Routing**: Expo Router ~6.0.13 (file-based routing)
- **Language**: TypeScript (strict mode)
- **Animations**: react-native-reanimated ~4.1.1 (60fps native thread)
- **Gestures**: react-native-gesture-handler ~2.22.1
- **State Management**: Context API + useReducer
- **Storage**: AsyncStorage (event caching & persistence)
- **AI**: OpenRouter API with Perplexity Sonar Pro model
- **Images**: Unsplash API for dynamic event imagery

## 🧪 Testing

The app currently focuses on manual testing. Test infrastructure is not yet implemented.

## 📱 Deployment

### iOS App Store

```bash
# Build for iOS production
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios --profile production
```

### Android Play Store

```bash
# Build for Android production
eas build --platform android --profile production

# Submit to Google Play Store
eas submit --platform android --profile production
```

### Web Deployment

```bash
# Export web app
npx expo export --platform web

# Deploy to EAS Hosting
eas deploy
```

## 🐛 Troubleshooting

### iOS Simulator Issues

**Simulator not found:**
```bash
# Open Xcode and install iOS simulators
xcode-select --install
```

**iPhone 16 Pro not available:**
```bash
# Open Xcode > Settings > Platforms
# Download iOS 18.0+ runtime
```

**Metro bundler issues:**
```bash
# Clear cache and restart
npm start -- --clear
```

**Build errors:**
```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
```

### API Key Issues

If events aren't loading:
1. Check `.env.local` file exists
2. Verify `OPENROUTER_API_KEY` is set correctly
3. Restart the development server after changing environment variables

## 📚 Additional Documentation

- **CLAUDE.md**: Comprehensive technical documentation for AI assistants
- **USAGE_GUIDE.md**: Detailed swipe-to-delete usage guide
- **backend.md**: Backend integration notes

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!

## 📄 License

This project is private and not currently licensed for public use.

## 🙏 Acknowledgments

- **Expo**: For the amazing React Native framework
- **OpenRouter**: For unified AI model access
- **Perplexity**: For powerful search capabilities
- **Unsplash**: For beautiful event imagery

## 📞 Support

For issues or questions, please open an issue on the GitHub repository.

---

Built with ❤️ using React Native and Expo
