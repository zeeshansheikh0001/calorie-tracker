# Calorie Tracker

A modern, AI-powered calorie and nutrition tracking application built with Next.js and React.

![Calorie Tracker](./public/preview.png)

## Features

- **User-Friendly Dashboard**: Track daily calories, macronutrients, and nutrition goals
- **AI-Powered Food Logging**: Describe your meals in natural language and get instant nutrition estimates
- **Smart Insights**: Get personalized nutrition tips and feedback based on your eating patterns
- **Beautiful UI**: Modern interface with animations, dark mode, and responsive design
- **Goal Setting**: Set and track fitness goals like weight loss, muscle gain, or overall health
- **Customizable Onboarding**: User profile creation with fitness goals, physical attributes, and dietary preferences
- **Nutrition Analysis**: Detailed breakdown of calories, protein, carbs, fat, and micronutrients

## Tech Stack

- **Frontend Framework**: Next.js 14 with App Router
- **UI Library**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Animations**: Framer Motion for smooth transitions and interactions
- **State Management**: React hooks with custom context providers
- **Data Persistence**: Local storage (with option to connect to a backend)
- **AI Integration**: OpenAI for food analysis and nutrition estimation

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/calorie-tracker.git
   cd calorie-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Create a `.env.local` file in the root directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. **Onboarding**: When first using the app, complete the onboarding process to set up your profile
2. **Logging Food**: Use the "Log Food" button to add meals to your daily log
   - Manual entry: Describe your food and let AI analyze the nutrition content
   - Photo entry: Take a photo of your meal (if implemented)
3. **Dashboard**: View your daily calories and nutrition breakdown
4. **Insights**: Check personalized nutrition insights based on your eating patterns
5. **Goals**: Track progress toward your fitness and nutrition goals

## Project Structure

```
calorie-tracker/
├── src/
│   ├── ai/             # AI integration for food analysis
│   ├── app/            # Next.js app router pages
│   ├── components/     # Reusable UI components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions
│   ├── types/          # TypeScript type definitions
│   └── styles/         # Global CSS and Tailwind config
├── public/             # Static assets
└── ...config files
```

## Customization

- **Theme**: Modify the colors in `tailwind.config.js` to change the application theme
- **Units**: Toggle between metric and imperial units in the settings
- **Goals**: Adjust your nutrition goals and targets in the profile section

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
- [OpenAI](https://openai.com/)
