import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Award, Check, Heart, Shield, Star, Zap, Utensils, BarChart3, Brain, Users, Smartphone } from 'lucide-react';
import { faqSchema } from '@/lib/schema';

// Metadata for SEO optimization
export const metadata: Metadata = {
  title: 'About Calorie Tracker | #1 Nutrition Tracking App in India',
  description: 'Learn about Calorie Tracker, India\'s leading AI-powered nutrition tracking app. Track your calories, macros, and achieve your fitness goals with personalized insights.',
  keywords: 'calorie tracker India, Indian nutrition app, diet tracking India, fitness app India, weight loss app India, macro tracking, Indian diet plan',
  alternates: {
    canonical: 'https://calorietracker.in/about',
  },
  openGraph: {
    title: 'About Calorie Tracker | #1 Nutrition Tracking App in India',
    description: 'India\'s leading AI-powered nutrition tracking app. Track your calories and achieve your fitness goals.',
    url: 'https://calorietracker.in/about',
    type: 'website',
  }
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema)
        }}
      />
      
      {/* Hero Section */}
      <section className="py-16 px-4 md:py-24">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/80 text-transparent bg-clip-text">
              India's Premier Calorie Tracking Solution
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Founded with a mission to make nutrition tracking simple, intelligent, and tailored to Indian dietary habits.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground mb-6">
                At Calorie Tracker, we're committed to helping Indians achieve their health and fitness goals through smart nutrition tracking that understands local food habits, regional cuisines, and the unique nutritional challenges faced by our community.
              </p>
              
              <h2 className="text-2xl font-bold mb-4">What Sets Us Apart</h2>
              <ul className="space-y-3">
                {[
                  { icon: Utensils, text: "Comprehensive database of Indian foods from all regions" },
                  { icon: Brain, text: "AI that recognizes Indian foods and regional cuisines" },
                  { icon: Check, text: "Nutrition data calibrated for Indian dietary patterns" },
                  { icon: Shield, text: "Privacy-focused approach with local data processing" },
                  { icon: Heart, text: "Health insights tailored to Indian health concerns" },
                  { icon: Star, text: "Designed by nutritionists who understand Indian diets" }
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="mr-3 h-6 w-6 text-primary flex-shrink-0 mt-0.5">
                      <item.icon size={20} />
                    </div>
                    <span className="text-foreground">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-6 bg-card rounded-xl border border-border/50 shadow-lg">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Award className="mr-2 h-5 w-5 text-primary" />
                Trusted by Health Professionals
              </h3>
              <p className="text-muted-foreground mb-6">
                Recommended by leading nutritionists and fitness experts across India. Our app integrates the latest research in nutrition science with an understanding of Indian dietary habits.
              </p>
              
              <div className="p-4 bg-muted rounded-lg mb-6">
                <p className="italic text-muted-foreground">
                  "As a nutritionist working with Indian clients, I find Calorie Tracker's database of Indian foods incredibly valuable. It's the only app that accurately captures the nutritional profile of our regional cuisines."
                </p>
                <p className="mt-2 font-medium">— Dr. Meera Sharma, Clinical Nutritionist</p>
              </div>
              
              <Link href="/onboarding" className="w-full">
                <Button className="w-full gap-2">
                  Start Your Nutrition Journey
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Our Story Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="relative h-80 rounded-xl overflow-hidden shadow-lg">
                <Image 
                  src="https://images.unsplash.com/photo-1505576399279-565b52d4ac71?ixlib=rb-4.0.3" 
                  alt="Indian food and nutrition planning"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <p className="text-muted-foreground mb-4">
                Calorie Tracker was founded in 2021 by a team of nutritionists, fitness experts, and software developers who recognized a significant gap in the market: most nutrition apps failed to understand Indian dietary habits and regional cuisines.
              </p>
              <p className="text-muted-foreground mb-4">
                As health-conscious Indians ourselves, we struggled with international apps that didn't recognize our staple foods or provide accurate nutritional information for Indian dishes. We set out to build a solution specifically designed for the Indian population.
              </p>
              <p className="text-muted-foreground mb-4">
                After two years of research, development, and testing with thousands of users across India, we've created a nutrition tracking platform that truly understands the unique needs of Indians striving for better health.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Key Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Powerful <span className="text-primary">Features</span> for Your Nutrition Journey
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Utensils,
                title: "Comprehensive Indian Food Database",
                description: "Over 20,000 Indian foods and recipes from all regions with accurate nutritional information."
              },
              {
                icon: BarChart3,
                title: "Personalized Goal Setting",
                description: "Set customized targets based on your body metrics, activity level, and specific health objectives."
              },
              {
                icon: Brain,
                title: "AI-Powered Insights",
                description: "Smart recommendations and pattern analysis to help optimize your nutrition and achieve your goals faster."
              },
              {
                icon: Smartphone,
                title: "Easy Food Logging",
                description: "Quick search, barcode scanning, photo recognition, and voice input for effortless meal tracking."
              },
              {
                icon: Users,
                title: "Community Support",
                description: "Connect with others on similar health journeys, share recipes, and motivate each other."
              },
              {
                icon: Heart,
                title: "Health Monitoring",
                description: "Track your progress beyond calories: monitor macros, micros, hydration, and health indicators."
              }
            ].map((feature, index) => (
              <div key={index} className="p-6 bg-card rounded-lg border border-border/50 transition-all hover:shadow-md hover:-translate-y-1 flex flex-col">
                <feature.icon className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground flex-1">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* User Success Stories */}
      <section className="py-16 bg-muted/30 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Real Success <span className="text-primary">Stories</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                name: "Anjali Mehta",
                location: "Mumbai",
                achievement: "Lost 15kg and reversed pre-diabetes",
                image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3",
                quote: "I tried several international apps before, but none understood my vegetarian diet needs. Calorie Tracker made it easy to log my home-cooked meals and provided actionable insights that helped me lose weight while still enjoying my favorite foods."
              },
              {
                name: "Vikram Singh",
                location: "Delhi",
                achievement: "Gained 10kg of muscle mass",
                image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3",
                quote: "As someone looking to build muscle on a vegetarian diet, I struggled to meet my protein goals. The personalized recommendations from Calorie Tracker helped me discover new protein sources and optimize my nutrition for muscle growth."
              },
              {
                name: "Priya Nair",
                location: "Bangalore",
                achievement: "Maintained healthy weight during pregnancy",
                image: "https://images.unsplash.com/photo-1569913486515-b74bf7751574?ixlib=rb-4.0.3",
                quote: "During my pregnancy, I needed to ensure I was getting the right nutrients while managing gestational diabetes risk. The app's specialized tracking features for pregnancy were invaluable for my health and my baby's development."
              },
              {
                name: "Rajesh Kumar",
                location: "Hyderabad",
                achievement: "Improved cholesterol levels & heart health",
                image: "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?ixlib=rb-4.0.3",
                quote: "After my heart health scare, my doctor recommended tracking my nutrition. The detailed reports and heart-healthy recommendations helped me make gradual changes to my diet that significantly improved my lipid profile in just 3 months."
              }
            ].map((story, index) => (
              <div key={index} className="p-6 bg-card rounded-lg border border-border/50 shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="relative h-14 w-14 rounded-full overflow-hidden mr-4">
                    <Image 
                      src={story.image} 
                      alt={story.name}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{story.name}</h3>
                    <p className="text-sm text-muted-foreground">{story.location} • {story.achievement}</p>
                  </div>
                </div>
                <p className="italic text-muted-foreground">"{story.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto max-w-5xl px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Developed for <span className="text-primary">Indian Nutrition Needs</span>
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Regional Food Database",
                description: "Extensive database of Indian foods from all regions, including homemade recipes, street foods, and restaurant meals."
              },
              {
                title: "Festival & Occasion Planning",
                description: "Special tools to help you navigate festive seasons and social gatherings without compromising your goals."
              },
              {
                title: "Ayurvedic Insights",
                description: "Integration of traditional Ayurvedic principles with modern nutrition science for a holistic approach."
              },
              {
                title: "Vegetarian & Vegan Friendly",
                description: "Specialized tracking for plant-based diets with Indian protein alternatives and supplements."
              },
              {
                title: "Local Health Metrics",
                description: "Health insights calibrated to Indian health standards and common health concerns in our population."
              },
              {
                title: "Multi-language Support",
                description: "Available in English, Hindi, Tamil, Telugu, Malayalam, Kannada, Bengali, and Marathi for accessibility across the country."
              }
            ].map((feature, index) => (
              <div key={index} className="p-6 bg-card rounded-lg border border-border/50 transition-all hover:shadow-md hover:-translate-y-1">
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary/5 rounded-lg mx-4 my-8">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Nutrition Journey?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of Indians who have already improved their health, achieved their fitness goals, and developed better eating habits with Calorie Tracker.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/onboarding">
              <Button size="lg" className="gap-2">
                Get Started Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/goals">
              <Button variant="outline" size="lg">
                Explore Features
              </Button>
            </Link>
          </div>
          
          <p className="text-xs text-muted-foreground mt-6">
            Calorie Tracker is committed to your privacy. Read our <Link href="/privacy" className="underline">Privacy Policy</Link> and <Link href="/terms" className="underline">Terms of Service</Link>.
          </p>
        </div>
      </section>
    </div>
  );
} 