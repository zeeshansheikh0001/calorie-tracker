# Calorie Tracker

A modern, responsive web application for tracking calories, nutrients, and achieving your fitness goals.

## Features

- Track daily food intake and calories
- Monitor macronutrient targets (protein, carbs, fat)
- Visualize progress with interactive charts
- Personalized goal setting
- Mobile-friendly design with responsive UI
- Dark/light mode support

## Tech Stack

- **Framework**: Next.js 13 (App Router)
- **Styling**: Tailwind CSS
- **Components**: Shadcn UI
- **Animations**: Framer Motion
- **State Management**: React Context and Hooks
- **Analytics**: Google Analytics 4

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Google Analytics Setup

This application includes Google Analytics 4 integration. To enable analytics:

1. Create a Google Analytics 4 property in your Google Analytics account
2. Get your Measurement ID (starts with G-)
3. Create a `.env.local` file in the root of your project:
   ```
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```
   Replace `G-XXXXXXXXXX` with your actual Google Analytics Measurement ID

4. Analytics tracking is automatically implemented for:
   - Page views across the application
   - Navigation between tabs
   - Onboarding completion
   - Custom events for food logging, goal setting, etc.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 Measurement ID |

## License

MIT
