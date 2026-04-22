"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Award,
  Check,
  Heart,
  Shield,
  Star,
  Utensils,
  BarChart3,
  Brain,
  Users,
  Smartphone,
} from "lucide-react";
import { faqSchema } from "@/lib/schema";
import { useLanguage } from "@/lib/i18n/provider";
import type { SupportedLocale } from "@/lib/i18n/translations";

type AboutContentData = {
  heroTitle: string;
  heroSubtitle: string;
  missionTitle: string;
  missionText: string;
  apartTitle: string;
  apartItems: string[];
  trustedTitle: string;
  trustedText: string;
  trustedQuote: string;
  trustedAuthor: string;
  startJourney: string;
  storyTitle: string;
  storyParagraphs: string[];
  featuresTitlePrefix: string;
  featuresTitleHighlight: string;
  featuresTitleSuffix: string;
  features: { title: string; description: string }[];
  storiesTitlePrefix: string;
  storiesTitleHighlight: string;
  stories: {
    name: string;
    location: string;
    achievement: string;
    image: string;
    quote: string;
  }[];
  localizedNeedsPrefix: string;
  localizedNeedsHighlight: string;
  localizedNeedsFeatures: { title: string; description: string }[];
  ctaTitle: string;
  ctaText: string;
  ctaPrimary: string;
  ctaSecondary: string;
  ctaPrivacyPrefix: string;
  ctaPrivacyLink: string;
  ctaAnd: string;
  ctaTermsLink: string;
  imageAlt: string;
};

const storyImages = [
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1569913486515-b74bf7751574?ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?ixlib=rb-4.0.3",
];

const content: Record<SupportedLocale, AboutContentData> = {
  en: {
    heroTitle: "India's Premier Calorie Tracking Solution",
    heroSubtitle:
      "Founded with a mission to make nutrition tracking simple, intelligent, and tailored to Indian dietary habits.",
    missionTitle: "Our Mission",
    missionText:
      "At Calorie Tracker, we help people achieve health and fitness goals with smart nutrition tracking that understands local foods and regional cuisine patterns.",
    apartTitle: "What Sets Us Apart",
    apartItems: [
      "Comprehensive database of Indian foods from all regions",
      "AI that recognizes Indian foods and regional cuisines",
      "Nutrition data calibrated for Indian dietary patterns",
      "Privacy-focused approach with local data processing",
      "Health insights tailored to common Indian concerns",
      "Designed by nutrition experts familiar with Indian diets",
    ],
    trustedTitle: "Trusted by Health Professionals",
    trustedText:
      "Recommended by nutritionists and fitness experts. We blend modern nutrition science with practical local eating habits.",
    trustedQuote:
      "This is one of the few apps that reflects real Indian meal patterns accurately.",
    trustedAuthor: "Dr. Meera Sharma, Clinical Nutritionist",
    startJourney: "Start Your Nutrition Journey",
    storyTitle: "Our Story",
    storyParagraphs: [
      "Calorie Tracker was founded in 2021 by nutrition experts and engineers who saw that most nutrition apps ignored Indian dietary patterns.",
      "We experienced this ourselves: many global apps missed staple foods and gave poor nutrition estimates for local dishes.",
      "After years of research and real-user testing, we built a platform designed around Indian food reality and everyday goals.",
    ],
    featuresTitlePrefix: "Powerful",
    featuresTitleHighlight: "Features",
    featuresTitleSuffix: "for Your Nutrition Journey",
    features: [
      {
        title: "Comprehensive Indian Food Database",
        description:
          "Thousands of Indian foods and recipes with accurate nutritional values.",
      },
      {
        title: "Personalized Goal Setting",
        description:
          "Targets tailored to your body metrics, activity, and fitness outcomes.",
      },
      {
        title: "AI-Powered Insights",
        description:
          "Smart recommendations that help improve consistency and outcomes.",
      },
      {
        title: "Easy Food Logging",
        description:
          "Quick search, barcode scan, photo recognition, and manual logging.",
      },
      {
        title: "Community Support",
        description:
          "Learn from others, share practical tips, and stay motivated together.",
      },
      {
        title: "Health Monitoring",
        description:
          "Track calories, macros, hydration, and progress trends over time.",
      },
    ],
    storiesTitlePrefix: "Real Success",
    storiesTitleHighlight: "Stories",
    stories: [
      {
        name: "Anjali Mehta",
        location: "Mumbai",
        achievement: "Lost 15kg and improved blood sugar health",
        image: storyImages[0],
        quote:
          "The app helped me track home-cooked meals realistically and stay consistent.",
      },
      {
        name: "Vikram Singh",
        location: "Delhi",
        achievement: "Gained 10kg of muscle mass",
        image: storyImages[1],
        quote:
          "I finally found practical protein planning that works with my regular diet.",
      },
      {
        name: "Priya Nair",
        location: "Bangalore",
        achievement: "Maintained healthy weight during pregnancy",
        image: storyImages[2],
        quote:
          "The structured tracking made it much easier to stay on top of daily nutrition.",
      },
      {
        name: "Rajesh Kumar",
        location: "Hyderabad",
        achievement: "Improved cholesterol and heart health markers",
        image: storyImages[3],
        quote:
          "The reports made it easier to take small diet decisions that produced visible change.",
      },
    ],
    localizedNeedsPrefix: "Developed for",
    localizedNeedsHighlight: "Indian Nutrition Needs",
    localizedNeedsFeatures: [
      {
        title: "Regional Food Database",
        description: "Coverage of regional meals, home recipes, and local staples.",
      },
      {
        title: "Festival Planning Support",
        description:
          "Practical strategies to stay on track during celebrations and events.",
      },
      {
        title: "Ayurvedic Context",
        description:
          "Nutrition guidance that can align with traditional wellness preferences.",
      },
      {
        title: "Vegetarian and Vegan Friendly",
        description: "Better support for plant-based Indian dietary patterns.",
      },
      {
        title: "Local Health Metrics",
        description:
          "Insights tuned to common risk profiles and nutritional concerns.",
      },
      {
        title: "Multi-language Experience",
        description: "Built to be accessible for users across language preferences.",
      },
    ],
    ctaTitle: "Ready to Transform Your Nutrition Journey?",
    ctaText:
      "Join users who are improving daily habits, hitting goals, and building long-term health.",
    ctaPrimary: "Get Started Now",
    ctaSecondary: "Explore Features",
    ctaPrivacyPrefix: "Calorie Tracker is committed to your privacy. Read our",
    ctaPrivacyLink: "Privacy Policy",
    ctaAnd: "and",
    ctaTermsLink: "Terms of Service",
    imageAlt: "Indian food and nutrition planning",
  },
  ar: {
    heroTitle: "الحل الرائد في الهند لتتبع السعرات الحرارية",
    heroSubtitle:
      "تأسسنا بهدف جعل تتبع التغذية بسيطًا وذكيًا ومناسبًا للعادات الغذائية الهندية.",
    missionTitle: "مهمتنا",
    missionText:
      "نساعد المستخدمين على تحقيق أهداف الصحة واللياقة عبر تتبع غذائي ذكي يفهم الأطعمة المحلية وأنماط المطبخ الإقليمي.",
    apartTitle: "ما الذي يميزنا",
    apartItems: [
      "قاعدة بيانات شاملة للأطعمة الهندية من جميع المناطق",
      "ذكاء اصطناعي يتعرف على الأطعمة والمطابخ الهندية",
      "بيانات غذائية مضبوطة وفق الأنماط الغذائية الهندية",
      "نهج يركز على الخصوصية ومعالجة بيانات محلية",
      "رؤى صحية موجهة للتحديات الشائعة",
      "مصمم بالتعاون مع خبراء تغذية يفهمون النظام الهندي",
    ],
    trustedTitle: "موثوق من خبراء الصحة",
    trustedText:
      "موصى به من قبل مختصي التغذية واللياقة. نجمع بين علم التغذية الحديث وعادات الأكل المحلية.",
    trustedQuote:
      "من التطبيقات القليلة التي تعكس أنماط الوجبات الهندية بدقة.",
    trustedAuthor: "د. ميرا شارما، أخصائية تغذية سريرية",
    startJourney: "ابدأ رحلتك الغذائية",
    storyTitle: "قصتنا",
    storyParagraphs: [
      "تأسس Calorie Tracker عام 2021 عندما لاحظ الفريق أن أغلب تطبيقات التغذية لا تفهم النمط الغذائي الهندي.",
      "واجهنا المشكلة بأنفسنا، إذ كانت التطبيقات العالمية لا تتعرف على أطعمة أساسية محلية.",
      "بعد بحث وتجارب واسعة، بنينا منصة مصممة لواقع الأكل اليومي والأهداف الصحية.",
    ],
    featuresTitlePrefix: "ميزات",
    featuresTitleHighlight: "قوية",
    featuresTitleSuffix: "لرحلتك الغذائية",
    features: [
      { title: "قاعدة أطعمة هندية شاملة", description: "آلاف الأطعمة والوصفات بقيم غذائية دقيقة." },
      { title: "تحديد أهداف مخصص", description: "أهداف مبنية على بيانات جسمك ونشاطك." },
      { title: "رؤى مدعومة بالذكاء الاصطناعي", description: "توصيات عملية لتحسين الالتزام والنتائج." },
      { title: "تسجيل طعام سهل", description: "بحث سريع، باركود، صورة، وإدخال يدوي." },
      { title: "دعم المجتمع", description: "تعلم من الآخرين وشارك النصائح وحافظ على الحافز." },
      { title: "متابعة صحية", description: "تتبع السعرات والمغذيات والماء والتقدم مع الوقت." },
    ],
    storiesTitlePrefix: "قصص",
    storiesTitleHighlight: "نجاح حقيقية",
    stories: [
      { name: "أنجالي ميهتا", location: "مومباي", achievement: "فقدت 15 كجم وحسنت السكر", image: storyImages[0], quote: "ساعدني التطبيق على تتبع الوجبات المنزلية بواقعية." },
      { name: "فيكرام سينغ", location: "دلهي", achievement: "اكتسب 10 كجم كتلة عضلية", image: storyImages[1], quote: "أصبحت خطة البروتين مناسبة لنظامي اليومي." },
      { name: "بريا ناير", location: "بنغالورو", achievement: "حافظت على وزن صحي أثناء الحمل", image: storyImages[2], quote: "المتابعة المنظمة سهلت إدارة التغذية اليومية." },
      { name: "راجيش كومار", location: "حيدر آباد", achievement: "تحسن الكوليسترول وصحة القلب", image: storyImages[3], quote: "التقارير ساعدتني على قرارات غذائية أفضل." },
    ],
    localizedNeedsPrefix: "تم تطويره لاحتياجات",
    localizedNeedsHighlight: "التغذية الهندية",
    localizedNeedsFeatures: [
      { title: "قاعدة أطعمة إقليمية", description: "يشمل وجبات المناطق والوصفات المنزلية." },
      { title: "دعم المواسم والمناسبات", description: "استراتيجيات عملية للاستمرار خلال المناسبات." },
      { title: "سياق أيورفيدي", description: "إرشادات غذائية تتماشى مع التفضيلات التقليدية." },
      { title: "مناسب للنباتيين", description: "دعم أفضل للأنماط الغذائية النباتية." },
      { title: "مؤشرات صحية محلية", description: "رؤى موجهة للمخاطر الصحية الشائعة." },
      { title: "تجربة متعددة اللغات", description: "مصمم لتجربة متاحة لعدة لغات." },
    ],
    ctaTitle: "جاهز لتحويل رحلتك الغذائية؟",
    ctaText: "انضم إلى مستخدمين يطورون عاداتهم ويحققون أهدافهم الصحية.",
    ctaPrimary: "ابدأ الآن",
    ctaSecondary: "استكشف الميزات",
    ctaPrivacyPrefix: "نلتزم بخصوصيتك. اقرأ",
    ctaPrivacyLink: "سياسة الخصوصية",
    ctaAnd: "و",
    ctaTermsLink: "شروط الخدمة",
    imageAlt: "تخطيط تغذية وطعام هندي",
  },
  es: {
    heroTitle: "La principal solucion de India para calorias",
    heroSubtitle:
      "Nacimos para hacer el seguimiento nutricional simple, inteligente y adaptado a habitos alimentarios indios.",
    missionTitle: "Nuestra mision",
    missionText:
      "Ayudamos a lograr objetivos de salud y fitness con seguimiento nutricional que entiende comidas locales y cocinas regionales.",
    apartTitle: "Que nos diferencia",
    apartItems: [
      "Base completa de alimentos indios de todas las regiones",
      "IA que reconoce comidas y cocinas indias",
      "Datos nutricionales calibrados a patrones locales",
      "Enfoque de privacidad con procesamiento local",
      "Insights de salud adaptados a necesidades comunes",
      "Disenado con expertos en nutricion india",
    ],
    trustedTitle: "Confiado por profesionales de salud",
    trustedText:
      "Recomendado por nutricionistas y expertos fitness. Combinamos ciencia moderna y habitos reales.",
    trustedQuote:
      "Es de las pocas apps que refleja de verdad los patrones de comida india.",
    trustedAuthor: "Dra. Meera Sharma, Nutricionista Clinica",
    startJourney: "Empieza tu viaje nutricional",
    storyTitle: "Nuestra historia",
    storyParagraphs: [
      "Calorie Tracker nacio en 2021 cuando vimos que muchas apps ignoraban patrones dietarios indios.",
      "Las apps globales no reconocian alimentos basicos ni platos regionales con precision.",
      "Tras anos de investigacion y pruebas, construimos una plataforma hecha para la realidad local.",
    ],
    featuresTitlePrefix: "Funciones",
    featuresTitleHighlight: "potentes",
    featuresTitleSuffix: "para tu viaje nutricional",
    features: [
      { title: "Base completa de alimentos indios", description: "Miles de comidas y recetas con valores precisos." },
      { title: "Objetivos personalizados", description: "Metas adaptadas a cuerpo, actividad y resultados." },
      { title: "Insights con IA", description: "Recomendaciones practicas para mejorar consistencia." },
      { title: "Registro de comidas facil", description: "Busqueda, codigo de barras, foto y carga manual." },
      { title: "Apoyo comunitario", description: "Comparte practicas y mantente motivado." },
      { title: "Monitoreo de salud", description: "Sigue calorias, macros, hidratacion y progreso." },
    ],
    storiesTitlePrefix: "Historias reales de",
    storiesTitleHighlight: "exito",
    stories: [
      { name: "Anjali Mehta", location: "Mumbai", achievement: "Perdio 15kg y mejoro su glucosa", image: storyImages[0], quote: "Pude registrar mis comidas caseras con mucha mas precision." },
      { name: "Vikram Singh", location: "Delhi", achievement: "Gano 10kg de masa muscular", image: storyImages[1], quote: "Por fin encontre una planificacion de proteina que si funciona." },
      { name: "Priya Nair", location: "Bangalore", achievement: "Mantuvo peso saludable en embarazo", image: storyImages[2], quote: "La estructura diaria facilito mucho el control nutricional." },
      { name: "Rajesh Kumar", location: "Hyderabad", achievement: "Mejoro colesterol y salud cardiaca", image: storyImages[3], quote: "Los reportes me ayudaron a decidir mejor cada dia." },
    ],
    localizedNeedsPrefix: "Desarrollado para",
    localizedNeedsHighlight: "necesidades nutricionales de India",
    localizedNeedsFeatures: [
      { title: "Base regional", description: "Cobertura de comidas regionales y recetas caseras." },
      { title: "Soporte en festividades", description: "Estrategias para mantener objetivos en eventos." },
      { title: "Contexto ayurvedico", description: "Orientacion compatible con preferencias tradicionales." },
      { title: "Apto vegetariano y vegano", description: "Mejor soporte para dietas vegetales locales." },
      { title: "Metricas locales", description: "Insights ajustados a riesgos y patrones comunes." },
      { title: "Multilenguaje", description: "Experiencia accesible para distintos idiomas." },
    ],
    ctaTitle: "Listo para transformar tu nutricion?",
    ctaText: "Unete a usuarios que mejoran habitos y alcanzan metas de salud.",
    ctaPrimary: "Empezar ahora",
    ctaSecondary: "Explorar funciones",
    ctaPrivacyPrefix: "Calorie Tracker cuida tu privacidad. Lee nuestra",
    ctaPrivacyLink: "Politica de privacidad",
    ctaAnd: "y",
    ctaTermsLink: "Terminos de servicio",
    imageAlt: "Planificacion de nutricion india",
  },
  fr: {
    heroTitle: "La solution leader en Inde pour les calories",
    heroSubtitle:
      "Notre mission: rendre le suivi nutritionnel simple, intelligent et adapte aux habitudes alimentaires indiennes.",
    missionTitle: "Notre mission",
    missionText:
      "Nous aidons a atteindre des objectifs sante et fitness avec un suivi qui comprend les aliments locaux.",
    apartTitle: "Ce qui nous distingue",
    apartItems: [
      "Base complete d'aliments indiens regionaux",
      "IA qui reconnait la cuisine indienne",
      "Donnees nutritionnelles adaptees aux habitudes locales",
      "Approche orientee confidentialite",
      "Insights adaptes aux besoins frequents",
      "Concu avec des experts en nutrition indienne",
    ],
    trustedTitle: "Recommande par des professionnels",
    trustedText:
      "Recommande par des nutritionnistes et coachs. Nous allions science moderne et habitudes reelles.",
    trustedQuote:
      "C'est l'une des rares apps qui reflète reellement les repas indiens.",
    trustedAuthor: "Dr Meera Sharma, Nutritionniste Clinique",
    startJourney: "Commencer votre parcours nutrition",
    storyTitle: "Notre histoire",
    storyParagraphs: [
      "Calorie Tracker est ne en 2021 en reponse au manque d'applications adaptees aux regimes indiens.",
      "Beaucoup d'apps mondiales ne reconnaissaient pas les aliments du quotidien.",
      "Apres de longues phases de recherche et tests, nous avons cree une plateforme orientee terrain.",
    ],
    featuresTitlePrefix: "Des",
    featuresTitleHighlight: "fonctionnalites puissantes",
    featuresTitleSuffix: "pour votre parcours nutrition",
    features: [
      { title: "Base alimentaire indienne complete", description: "Des milliers d'aliments et recettes avec donnees fiables." },
      { title: "Objectifs personnalises", description: "Cibles adaptees a vos mesures et activite." },
      { title: "Insights IA", description: "Recommandations utiles pour progresser durablement." },
      { title: "Journal alimentaire facile", description: "Recherche rapide, scan, photo et saisie manuelle." },
      { title: "Soutien communautaire", description: "Partagez, apprenez et restez motive." },
      { title: "Suivi sante", description: "Calories, macros, hydratation et tendances." },
    ],
    storiesTitlePrefix: "Histoires reelles de",
    storiesTitleHighlight: "reussite",
    stories: [
      { name: "Anjali Mehta", location: "Mumbai", achievement: "Perte de 15kg et meilleure glycemie", image: storyImages[0], quote: "J'ai enfin pu suivre mes repas maison de facon realiste." },
      { name: "Vikram Singh", location: "Delhi", achievement: "Gain de 10kg de masse musculaire", image: storyImages[1], quote: "Le planning proteines est devenu concret et applicable." },
      { name: "Priya Nair", location: "Bangalore", achievement: "Poids stable pendant la grossesse", image: storyImages[2], quote: "Le suivi quotidien m'a aidee a mieux gerer ma nutrition." },
      { name: "Rajesh Kumar", location: "Hyderabad", achievement: "Amelioration du cholesterol et du coeur", image: storyImages[3], quote: "Les rapports m'ont aide a faire de meilleurs choix." },
    ],
    localizedNeedsPrefix: "Developpe pour les",
    localizedNeedsHighlight: "besoins nutritionnels indiens",
    localizedNeedsFeatures: [
      { title: "Base regionale", description: "Plats regionaux et recettes maison couvertes." },
      { title: "Support periodes festives", description: "Rester sur les objectifs pendant les celebrations." },
      { title: "Contexte ayurvedique", description: "Compatibilite avec des preferences traditionnelles." },
      { title: "Vegetarien et vegan", description: "Support renforce pour les regimes vegetaux." },
      { title: "Metriques locales", description: "Insights adaptes aux risques les plus frequents." },
      { title: "Experience multilingue", description: "Interface accessible selon la langue choisie." },
    ],
    ctaTitle: "Pret a transformer votre nutrition ?",
    ctaText: "Rejoignez des utilisateurs qui construisent de meilleures habitudes.",
    ctaPrimary: "Commencer maintenant",
    ctaSecondary: "Explorer les fonctionnalites",
    ctaPrivacyPrefix: "Calorie Tracker respecte votre vie privee. Consultez notre",
    ctaPrivacyLink: "Politique de confidentialite",
    ctaAnd: "et",
    ctaTermsLink: "Conditions d'utilisation",
    imageAlt: "Planification nutrition indienne",
  },
  de: {
    heroTitle: "Indiens fuehrende Loesung fuer Kalorientracking",
    heroSubtitle:
      "Unsere Mission: Ernaehrungstracking einfach, intelligent und passend zu indischen Essgewohnheiten machen.",
    missionTitle: "Unsere Mission",
    missionText:
      "Wir helfen bei Gesundheits- und Fitnesszielen mit smartem Tracking, das lokale Lebensmittel versteht.",
    apartTitle: "Was uns unterscheidet",
    apartItems: [
      "Umfassende Datenbank indischer Lebensmittel",
      "KI erkennt indische Gerichte und regionale Kuechen",
      "Naehrwerte passend zu lokalen Ernaehrungsmustern",
      "Datenschutzorientierter Ansatz mit lokaler Verarbeitung",
      "Gesundheits-Insights fuer haeufige Beduerfnisse",
      "Entwickelt mit Experten fuer indische Ernaehrung",
    ],
    trustedTitle: "Vertrauen von Gesundheitsexperten",
    trustedText:
      "Empfohlen von Ernaehrungs- und Fitnessexperten. Moderne Wissenschaft trifft alltagstaugliche Praxis.",
    trustedQuote:
      "Eine der wenigen Apps, die indische Mahlzeiten realistisch abbildet.",
    trustedAuthor: "Dr. Meera Sharma, Klinische Ernaehrungsberaterin",
    startJourney: "Starte deine Ernaehrungsreise",
    storyTitle: "Unsere Geschichte",
    storyParagraphs: [
      "Calorie Tracker wurde 2021 gegruendet, weil viele Apps indische Ernaehrungsmuster ignorierten.",
      "Globale Apps erkannten oft Grundnahrungsmittel und regionale Gerichte nicht korrekt.",
      "Nach viel Forschung und Praxistests entstand eine Plattform fuer den realen Alltag.",
    ],
    featuresTitlePrefix: "Starke",
    featuresTitleHighlight: "Funktionen",
    featuresTitleSuffix: "fuer deine Ernaehrungsreise",
    features: [
      { title: "Umfassende indische Lebensmitteldatenbank", description: "Tausende Lebensmittel und Rezepte mit verlaesslichen Werten." },
      { title: "Personalisierte Zielsetzung", description: "Ziele passend zu Koerperdaten, Aktivitaet und Ergebnis." },
      { title: "KI-gestuetzte Insights", description: "Praktische Empfehlungen fuer bessere Konstanz." },
      { title: "Einfaches Food-Logging", description: "Suche, Barcode, Fotoerkennung und manuelle Eingabe." },
      { title: "Community-Unterstuetzung", description: "Lernen, teilen und gemeinsam motiviert bleiben." },
      { title: "Gesundheitsmonitoring", description: "Kalorien, Makros, Hydration und Verlauf im Blick." },
    ],
    storiesTitlePrefix: "Echte",
    storiesTitleHighlight: "Erfolgsgeschichten",
    stories: [
      { name: "Anjali Mehta", location: "Mumbai", achievement: "15kg abgenommen, Blutzucker verbessert", image: storyImages[0], quote: "Ich konnte meine hausgemachten Mahlzeiten endlich realistisch erfassen." },
      { name: "Vikram Singh", location: "Delhi", achievement: "10kg Muskelmasse aufgebaut", image: storyImages[1], quote: "Meine Proteinplanung passt jetzt endlich zum Alltag." },
      { name: "Priya Nair", location: "Bangalore", achievement: "Gesundes Gewicht in der Schwangerschaft", image: storyImages[2], quote: "Die strukturierte Verfolgung hat meine Ernaehrung deutlich erleichtert." },
      { name: "Rajesh Kumar", location: "Hyderabad", achievement: "Cholesterin und Herzwerte verbessert", image: storyImages[3], quote: "Die Berichte halfen mir bei besseren Tagesentscheidungen." },
    ],
    localizedNeedsPrefix: "Entwickelt fuer",
    localizedNeedsHighlight: "indische Ernaehrungsbeduerfnisse",
    localizedNeedsFeatures: [
      { title: "Regionale Datenbank", description: "Regionale Gerichte und Hausrezepte umfassend erfasst." },
      { title: "Support fuer Festzeiten", description: "Praktische Strategien fuer Feiern und Events." },
      { title: "Ayurvedischer Kontext", description: "Hinweise kompatibel mit traditionellen Praeferenzen." },
      { title: "Vegetarisch und vegan", description: "Bessere Unterstuetzung fuer pflanzliche Ernaehrung." },
      { title: "Lokale Gesundheitsmetriken", description: "Insights fuer haeufige lokale Risikoprofile." },
      { title: "Mehrsprachige Erfahrung", description: "Zugaenglich ueber verschiedene Sprachen hinweg." },
    ],
    ctaTitle: "Bereit, deine Ernaehrung zu transformieren?",
    ctaText: "Schliesse dich Nutzern an, die Gewohnheiten verbessern und Ziele erreichen.",
    ctaPrimary: "Jetzt starten",
    ctaSecondary: "Funktionen entdecken",
    ctaPrivacyPrefix: "Calorie Tracker nimmt Datenschutz ernst. Lies unsere",
    ctaPrivacyLink: "Datenschutzrichtlinie",
    ctaAnd: "und",
    ctaTermsLink: "Nutzungsbedingungen",
    imageAlt: "Indische Ernaehrungsplanung",
  },
};

const apartIcons = [Utensils, Brain, Check, Shield, Heart, Star];
const featureIcons = [Utensils, BarChart3, Brain, Smartphone, Users, Heart];

export default function AboutContent() {
  const { locale } = useLanguage();
  const c = content[locale] || content.en;

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <section className="py-16 px-4 md:py-24">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/80 text-transparent bg-clip-text">
              {c.heroTitle}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {c.heroSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-4">{c.missionTitle}</h2>
              <p className="text-muted-foreground mb-6">{c.missionText}</p>

              <h2 className="text-2xl font-bold mb-4">{c.apartTitle}</h2>
              <ul className="space-y-3">
                {c.apartItems.map((item, index) => {
                  const Icon = apartIcons[index] || Check;
                  return (
                    <li key={index} className="flex items-start">
                      <div className="mr-3 h-6 w-6 text-primary flex-shrink-0 mt-0.5">
                        <Icon size={20} />
                      </div>
                      <span className="text-foreground">{item}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="p-6 bg-card rounded-xl border border-border/50 shadow-lg">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Award className="mr-2 h-5 w-5 text-primary" />
                {c.trustedTitle}
              </h3>
              <p className="text-muted-foreground mb-6">{c.trustedText}</p>

              <div className="p-4 bg-muted rounded-lg mb-6">
                <p className="italic text-muted-foreground">"{c.trustedQuote}"</p>
                <p className="mt-2 font-medium">- {c.trustedAuthor}</p>
              </div>

              <Link href="/onboarding" className="w-full">
                <Button className="w-full gap-2">
                  {c.startJourney}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="relative h-80 rounded-xl overflow-hidden shadow-lg">
                <Image
                  src="https://images.unsplash.com/photo-1505576399279-565b52d4ac71?ixlib=rb-4.0.3"
                  alt={c.imageAlt}
                  fill
                  style={{ objectFit: "cover" }}
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl font-bold mb-6">{c.storyTitle}</h2>
              {c.storyParagraphs.map((p, i) => (
                <p key={i} className="text-muted-foreground mb-4">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            {c.featuresTitlePrefix}{" "}
            <span className="text-primary">{c.featuresTitleHighlight}</span>{" "}
            {c.featuresTitleSuffix}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {c.features.map((feature, index) => {
              const Icon = featureIcons[index] || Check;
              return (
                <div
                  key={index}
                  className="p-6 bg-card rounded-lg border border-border/50 transition-all hover:shadow-md hover:-translate-y-1 flex flex-col"
                >
                  <Icon className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground flex-1">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            {c.storiesTitlePrefix}{" "}
            <span className="text-primary">{c.storiesTitleHighlight}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {c.stories.map((story, index) => (
              <div
                key={index}
                className="p-6 bg-card rounded-lg border border-border/50 shadow-lg"
              >
                <div className="flex items-center mb-4">
                  <div className="relative h-14 w-14 rounded-full overflow-hidden mr-4">
                    <Image src={story.image} alt={story.name} fill style={{ objectFit: "cover" }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{story.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {story.location} • {story.achievement}
                    </p>
                  </div>
                </div>
                <p className="italic text-muted-foreground">"{story.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto max-w-5xl px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            {c.localizedNeedsPrefix}{" "}
            <span className="text-primary">{c.localizedNeedsHighlight}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {c.localizedNeedsFeatures.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-card rounded-lg border border-border/50 transition-all hover:shadow-md hover:-translate-y-1"
              >
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-primary/5 rounded-lg mx-4 my-8">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-6">{c.ctaTitle}</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">{c.ctaText}</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/onboarding">
              <Button size="lg" className="gap-2">
                {c.ctaPrimary}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/goals">
              <Button variant="outline" size="lg">
                {c.ctaSecondary}
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground mt-6">
            {c.ctaPrivacyPrefix}{" "}
            <Link href="/privacy" className="underline">
              {c.ctaPrivacyLink}
            </Link>{" "}
            {c.ctaAnd}{" "}
            <Link href="/terms" className="underline">
              {c.ctaTermsLink}
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
