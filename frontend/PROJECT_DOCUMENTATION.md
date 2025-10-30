# My-App (Next.js Frontend) - Complete Documentation

## Project Overview
**My-App** is a modern Next.js 15 frontend application for a social media platform called "Jaifriend". It's built with TypeScript, Tailwind CSS, and React 19, providing a responsive and interactive user interface.

## Technology Stack
- **Framework**: Next.js 15.2.4
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4.1.10
- **Icons**: Lucide React, React Icons
- **HTTP Client**: Axios
- **State Management**: React Context API

## Project Structure

### 📁 Root Directory Files
```
my-app/
├── package.json          # Dependencies and scripts
├── package-lock.json     # Locked dependency versions
├── next.config.ts        # Next.js configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
├── postcss.config.mjs    # PostCSS configuration
├── next-env.d.ts         # Next.js TypeScript definitions
├── README.md             # Basic project information
├── setup-env.md          # Environment setup instructions
└── .gitignore            # Git ignore rules
```

### 📁 Public Directory (`/public/`)
Contains static assets accessible directly via URL:
```
public/
├── avatars/              # User avatar images (1.png.png to 20.png.png)
├── default-avatar.svg    # Default avatar for users
├── file.svg              # File icon
├── globe.svg             # Globe icon
├── illustration.svg      # Illustration graphics
├── next.svg              # Next.js logo
├── vercel.svg            # Vercel logo
└── window.svg            # Window icon
```

### 📁 Source Directory (`/src/`)

#### 📁 App Directory (`/src/app/`)
Next.js 13+ App Router structure:

**Main Pages:**
- `page.tsx` - **Landing/Home page** with login functionality
- `layout.tsx` - **Root layout** component
- `globals.css` - **Global styles**
- `favicon.ico` - **Site favicon**

**Route Pages:**
- `register/page.tsx` - **User registration page**
- `start-up/page.tsx` - **User onboarding/setup page**
- `dashboard/` - **Main dashboard** (80 files - complete dashboard system)

#### 📁 Components Directory (`/src/components/`)
Reusable React components (28 files):
- UI components for forms, modals, buttons
- Layout components for headers, sidebars
- Feature-specific components for posts, profiles, etc.

#### 📁 Contexts Directory (`/src/contexts/`)
React Context providers:
- `DarkModeContext.tsx` - **Dark mode state management**
- `PrivacyContext.tsx` - **Privacy settings management**

#### 📁 Utils Directory (`/src/utils/`)
Utility functions and API helpers:
- `api.ts` - **Main API client** for backend communication
- `auth.ts` - **Authentication utilities** (token management)
- `config.ts` - **Configuration constants**
- `adminApi.ts` - **Admin-specific API calls**
- `reelsApi.ts` - **Reels feature API**
- `storyApi.ts` - **Stories feature API**
- `websiteSettingsApi.ts` - **Website settings API**
- `darkModeUtils.ts` - **Dark mode utilities**
- `privacyUtils.ts` - **Privacy utilities**

#### 📁 Styles Directory (`/src/styles/`)
- `globals.css` - **Global CSS styles**

## Key Features

### 🔐 Authentication System
- **Login/Register**: Email-based authentication
- **Social Login**: Facebook, Google, Apple integration (UI ready)
- **Token Management**: JWT token storage and validation
- **Auth Guard**: Route protection component

### 🎨 User Interface
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Toggle between light/dark themes
- **Modern UI**: Gradient backgrounds, smooth animations
- **Avatar System**: Custom avatar upload and management

### 📱 Pages Overview

#### 1. **Home Page** (`/src/app/page.tsx`)
- **Purpose**: Landing page with login functionality
- **Features**:
  - Hero section with branding
  - Login form (email/password)
  - Social login buttons
  - Avatar showcase
  - Feature highlights
  - Trending tags section
- **API Integration**: Login API calls
- **State Management**: Form data, loading states, modals

#### 2. **Register Page** (`/src/app/register/page.tsx`)
- **Purpose**: User registration
- **Features**: Registration form, validation, API integration

#### 3. **Start-up Page** (`/src/app/start-up/page.tsx`)
- **Purpose**: User onboarding after registration
- **Features**: Profile setup, preferences configuration

#### 4. **Dashboard** (`/src/app/dashboard/`)
- **Purpose**: Main application interface (80 files)
- **Features**: Complete social media dashboard
- **Components**: Posts, profiles, messaging, notifications

## API Integration

### Backend Connection
- **Base URL**: `https://jaifriend-backend.hgdjlive.com`
- **Environment**: Configurable via `NEXT_PUBLIC_API_URL`
- **Authentication**: JWT token-based
- **CORS**: Configured for cross-origin requests

### API Utilities (`/src/utils/`)
- **api.ts**: Main API client with Axios
- **auth.ts**: Token management and auth helpers
- **Specialized APIs**: Admin, reels, stories, website settings

## Configuration Files

### `next.config.ts`
- Next.js configuration
- Environment variables setup
- Build optimizations

### `tailwind.config.js`
- Tailwind CSS configuration
- Custom color schemes
- Responsive breakpoints
- Dark mode support

### `tsconfig.json`
- TypeScript configuration
- Path mapping
- Strict type checking

## Development Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Environment Setup

### Required Environment Variables
```env
NEXT_PUBLIC_API_URL=https://jaifriend-backend.hgdjlive.com
```

### Development Setup
1. Install dependencies: `npm install`
2. Set up environment variables
3. Start development server: `npm run dev`
4. Access at: `http://localhost:3000`

## Key Components

### AuthGuard Component
- **Purpose**: Route protection
- **Features**: Authentication checking, redirects
- **Usage**: Wraps protected routes

### Modal Component
- **Purpose**: Reusable modal dialog
- **Features**: Escape key handling, overlay, animations
- **Usage**: Login modals, confirmations, forms

### Dark Mode Context
- **Purpose**: Theme management
- **Features**: Toggle functionality, persistence
- **Usage**: Throughout the application

## File Naming Conventions
- **Components**: PascalCase (e.g., `AuthGuard.tsx`)
- **Pages**: lowercase (e.g., `page.tsx`)
- **Utilities**: camelCase (e.g., `api.ts`)
- **Styles**: kebab-case (e.g., `globals.css`)

## Dependencies

### Production Dependencies
- `next`: Next.js framework
- `react`: React library
- `react-dom`: React DOM
- `axios`: HTTP client
- `lucide-react`: Icon library
- `react-icons`: Additional icons

### Development Dependencies
- `typescript`: TypeScript support
- `tailwindcss`: CSS framework
- `@types/*`: TypeScript definitions
- `autoprefixer`: CSS autoprefixer
- `postcss`: CSS processor

## Performance Optimizations
- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic route-based splitting
- **Bundle Analysis**: Built-in bundle analyzer
- **Caching**: Static generation and ISR

## Security Features
- **XSS Protection**: Built-in Next.js security
- **CSRF Protection**: API token validation
- **Input Validation**: Client-side validation
- **Secure Headers**: Security headers configuration

## Browser Support
- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile**: iOS Safari, Chrome Mobile
- **Responsive**: All screen sizes

## Deployment
- **Platform**: Vercel (recommended)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Environment**: Production variables required

## Maintenance
- **Updates**: Regular dependency updates
- **Monitoring**: Error tracking and analytics
- **Performance**: Bundle size monitoring
- **Security**: Regular security audits

---

*This documentation covers the complete structure and functionality of the My-App Next.js frontend. For backend documentation, see the my-express-app documentation.*
