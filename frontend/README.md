# Smart Grocery Housekeeping Frontend

A grocery inventory tracking app built with Expo Router, React Native, and TypeScript. Runs on iOS, Android, and Web.

## Tech Stack

- **Framework:** Expo SDK 54 with Expo Router v6 (file-based routing)
- **Language:** TypeScript 5.9
- **UI:** React Native 0.81 + React Native Web
- **Navigation:** React Navigation v7 (bottom tabs)
- **Styling:** React Native StyleSheet with a custom design token system
- **Linting:** Biome + ESLint

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- pnpm (this guide uses this) or npm
- or npx
- For iOS: macOS with Xcode installed
- For Android: Android Studio with an emulator configured
- Both XCode and Android Studio have mobile operating system simulators that allow you to run this frontend on locally and without a physical mobile device. You need to download the IDEs to set that up.
- For physical device testing, you need to download Expo Go from the Google Play Store or the Apple App Store. 

## Getting Started

### 1. Install dependencies

```bash
cd frontend
pnpm install
```

### 2. Run on Web

```bash
pnpm run web
```

Opens the app in your browser via Expo's web bundler.

### 3. Run on Mobile

Start the Expo dev server:

```bash
pnpm start
```

From the interactive menu, press:

- `i` to open in the iOS Simulator (macOS only, requires Xcode)
- `a` to open in the Android Emulator (requires Android Studio)

Alternatively, run platform-specific builds directly:

```bash
npm run ios      # Build and run on iOS simulator
npm run android  # Build and run on Android emulator
```

You can also scan the QR code with [Expo Go](https://expo.dev/go) on a physical device to preview.

![qr code in terminal](<Screenshot 2026-02-04 at 1.50.07 AM.png>)

## Project Structure

```
frontend/
├── app/                    # Pages (file-based routing)
│   ├── (tabs)/             # Tab navigation group
│   │   ├── index.tsx       # Home / Dashboard
│   │   ├── inventory.tsx   # Items list
│   │   ├── add.tsx         # Add new item
│   │   ├── history.tsx     # Activity history
│   │   ├── recipes.tsx     # Recipes
│   │   └── _layout.tsx     # Tab bar layout
│   ├── settings.tsx        # Settings screen
│   ├── reports.tsx         # Insights / Reports screen
│   └── _layout.tsx         # Root stack layout
├── components/
│   ├── ui/                 # Reusable UI components (Button, Card, Badge, etc.)
│   └── grocery/            # Domain components (ProductCard, StatusBadge, etc.)
├── constants/
│   ├── theme.ts            # Design tokens (colors, spacing, typography, shadows)
│   └── styles.ts           # Shared StyleSheet presets
├── hooks/                  # Custom React hooks
└── assets/                 # Images, icons, splash screen
```

## Available Scripts

| Command                   | Description                           |
| ------------------------- | ------------------------------------- |
| `npm start`               | Start Expo dev server                 |
| `npm run web`             | Run the web version                   |
| `npm run ios`             | Build and run on iOS simulator        |
| `npm run android`         | Build and run on Android emulator     |
| `npm run lint`            | Run ESLint                            |
| `npx biome check`         | Run Biome linter and formatter        |
| `npx biome check --write` | Auto-fix Biome lint and format issues |

## Linting and Formatting

The project uses two tools:

- **ESLint** (`npm run lint`) -- Expo-specific lint rules.
- **Biome** (`npx biome check`) -- Linting, formatting (tabs, double quotes, 120-char line width), and import organization. Config is in `biome.json`.

## Design System

All styling is driven by design tokens defined in `constants/theme.ts`. Use these tokens instead of hardcoded values when building or modifying components.

- **Colors** -- backgrounds, text, borders, status colors (green/orange/red/amber/blue), and interactive states.
- **Typography** -- `FontSizes` (xs through 3xl), `FontWeights` (medium, semibold, bold), and platform-aware `Fonts`.
- **Spacing** -- consistent scale from `xs` (4) to `4xl` (64).
- **BorderRadius** -- `sm` (8), `md` (12), `lg` (16), `full` (9999).
- **Shadows** -- four levels: `subtle`, `medium`, `elevated`, `floating` (with iOS shadow props and Android elevation).

Shared layout and typography presets are in `constants/styles.ts`.

## Notes

- The app uses a light-only theme (no dark mode).
- Typed routes and React Compiler are enabled as experimental features.
- The backend is a FastAPI service with PostgreSQL -- see the `backend/` directory for setup.