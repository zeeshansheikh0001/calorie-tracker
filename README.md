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

# AdSense Compliance Guide for CalorieTracker.in

## Policy Violations Identified

Google AdSense has identified the following policy violations on our website:

1. **Google-served ads on screens without publisher-content**
   - AdSense does not allow ads on pages with low-value content or pages under construction
   
2. **Low value content**
   - The site does not meet minimum content requirements to join the Google publisher network

## Fixes Implemented

### 1. Added High-Quality Blog Content

- Created a dedicated `src/data/blog-content.ts` file with 4 in-depth, original articles
- Each article contains 1000+ words of valuable, informative content
- Topics focus on nutrition, fitness, and health, which align with our site's purpose
- Content is properly structured with headings, paragraphs, and lists for readability

### 2. Enhanced About Page

- Added detailed, original content about the app's features and benefits
- Included user success stories with real-world examples
- Added company story and mission information
- Provided comprehensive information about what makes our app unique

### 3. Improved Site Structure

- Updated the sitemap to include all content pages and blog posts
- Ensured robots.txt allows search engines to index all content pages
- Fixed navigation to make all content easily accessible

### 4. Replaced Mock Data with Real Content

- Replaced placeholder/mock blog data with real, valuable content
- Updated blog detail pages to display full articles instead of lorem ipsum text
- Ensured all page content is properly implemented and not "under construction"

## Next Steps for AdSense Approval

1. **Additional Content Enhancement**
   - Add more blog articles (aim for at least 10 high-quality posts)
   - Create dedicated feature pages with detailed information
   - Add FAQ section with comprehensive answers

2. **Technical Improvements**
   - Ensure all pages load quickly and correctly
   - Implement proper schema markup for better SEO
   - Fix any remaining accessibility issues

3. **User Engagement Elements**
   - Add comment functionality to blog posts
   - Implement social sharing options
   - Create newsletter signup to build audience

4. **Verify Ownership**
   - Complete the Google Search Console verification process
   - Link AdSense account with Search Console

5. **Request Review**
   - Once all issues are fixed, request a review in the AdSense dashboard
   - Be prepared to make additional changes if required

## Content Guidelines

When creating additional content, ensure it follows these principles:

- **Original & Valuable**: All content must be original, not copied from other sources
- **In-Depth**: Articles should be comprehensive (1000+ words) and provide real value
- **Targeted**: Content should be relevant to our target audience of health-conscious Indians
- **Well-Structured**: Use proper headings, paragraphs, and formatting
- **Media-Rich**: Include relevant images with proper attribution
- **Accurate**: All health and nutrition information must be factually correct
- **Engaging**: Content should be written in an engaging, clear style

## Advertising Placement Guidelines

Once approved, follow these guidelines for ad placement:

- Do not place ads near navigation elements or in a way that might lead to accidental clicks
- Maintain a good content-to-ad ratio (never let ads dominate content)
- Ensure ads are clearly distinguishable from content
- Do not place ads on pages with minimal content
- Avoid placing ads on error pages or thank you pages

By following this guide, we should be able to successfully address the AdSense policy violations and get our site approved for serving ads.
