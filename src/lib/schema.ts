/**
 * Schema.org JSON-LD data for SEO optimization
 */

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Calorie Tracker",
  "alternateName": "CalorieTracker.in",
  "url": "https://calorietracker.in",
  "logo": "https://calorietracker.in/logo.png",
  "sameAs": [
    "https://facebook.com/calorietrackerindia",
    "https://twitter.com/calorietrackin",
    "https://instagram.com/calorietracker.in"
  ],
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "IN",
    "addressLocality": "Bangalore"
  },
  "description": "India's leading AI-powered nutrition tracking app designed for Indian foods and dietary patterns."
};

export const applicationSchema = {
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  "name": "Calorie Tracker",
  "applicationCategory": "HealthApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "INR"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "1024",
    "bestRating": "5",
    "worstRating": "1"
  },
  "description": "Track your daily calories, macronutrients, and achieve your fitness goals with our AI-powered nutrition tracking app tailored for Indian foods.",
  "inLanguage": ["en-IN", "hi", "ta", "te", "kn", "ml"]
};

export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Does Calorie Tracker support Indian foods and recipes?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, Calorie Tracker has an extensive database of Indian foods from all regions including homemade recipes, restaurant meals, and street foods with accurate nutritional information."
      }
    },
    {
      "@type": "Question",
      "name": "How accurate is the calorie counting for Indian dishes?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our AI has been specifically trained on Indian cooking methods and ingredients to provide accurate nutritional estimates for traditional Indian dishes, accounting for regional variations."
      }
    },
    {
      "@type": "Question",
      "name": "Can I track festival foods and special occasion meals?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely! We include seasonal and festival-specific foods in our database, helping you make informed choices during celebrations without compromising your nutrition goals."
      }
    },
    {
      "@type": "Question",
      "name": "Is there support for vegetarian and vegan Indian diets?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, we have specialized tracking for plant-based diets with Indian protein alternatives, dairy substitutes, and supplements commonly used in Indian vegetarian and vegan diets."
      }
    },
    {
      "@type": "Question",
      "name": "Does the app work offline in areas with limited connectivity?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, Calorie Tracker includes offline functionality allowing you to log foods and access core features even in areas with limited internet connectivity, a feature designed specifically for diverse Indian connectivity scenarios."
      }
    }
  ]
};

export const getProductSchema = (name: string, description: string, image: string) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": name,
  "description": description,
  "image": image,
  "brand": {
    "@type": "Brand",
    "name": "Calorie Tracker"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "INR",
    "availability": "https://schema.org/InStock"
  }
}); 