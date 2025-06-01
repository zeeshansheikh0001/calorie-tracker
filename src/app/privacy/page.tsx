import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Calorie Tracker',
  description: 'Learn how Calorie Tracker protects your privacy and handles your data in compliance with Indian privacy laws.',
  keywords: 'privacy policy, data protection, user privacy, PDPA India, calorie tracker privacy',
  alternates: {
    canonical: 'https://calorietracker.in/privacy',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen py-12 px-4 md:px-6 lg:px-8 max-w-4xl mx-auto">
      <Link href="/" className="inline-block mb-8">
        <Button variant="ghost" className="group">
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Button>
      </Link>
      
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Privacy Policy</h1>
      <p className="text-muted-foreground mb-4">Last Updated: July 1, 2023</p>
      
      <div className="space-y-8 text-foreground/90">
        <section>
          <h2 className="text-xl font-semibold mb-4">Introduction</h2>
          <p>
            At Calorie Tracker ("we", "our", or "us"), we respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our calorie tracking application and website (collectively, the "Service").
          </p>
          <p className="mt-2">
            We comply with all applicable Indian data protection laws, including the Personal Data Protection Act (PDPA) and Information Technology Act, 2000.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-4">Information We Collect</h2>
          <p>We collect the following types of information:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>
              <span className="font-medium">Personal Information:</span> Name, email address, and profile picture if you choose to provide them.
            </li>
            <li>
              <span className="font-medium">Health Information:</span> Height, weight, age, gender, fitness goals, and dietary preferences.
            </li>
            <li>
              <span className="font-medium">Usage Information:</span> Food logs, calorie intake, exercise data, and other nutrition-related information you input.
            </li>
            <li>
              <span className="font-medium">Device Information:</span> IP address, device type, operating system, and browser type.
            </li>
            <li>
              <span className="font-medium">Cookies and Similar Technologies:</span> We use cookies to enhance your experience and collect information about how you use our Service.
            </li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-4">How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>To provide, maintain, and improve our Service</li>
            <li>To personalize your experience and provide tailored nutrition recommendations</li>
            <li>To analyze usage patterns and optimize our Service</li>
            <li>To communicate with you about updates, features, or support</li>
            <li>To ensure the security and integrity of our Service</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-4">Data Storage and Security</h2>
          <p>
            We store your data on secure servers in India. We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.
          </p>
          <p className="mt-2">
            While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security. We encourage you to use strong passwords and to keep your login credentials confidential.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-4">Data Sharing and Disclosure</h2>
          <p>We do not sell your personal information to third parties. We may share your information in the following circumstances:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>With service providers who help us operate, maintain, and improve our Service</li>
            <li>To comply with legal obligations or protect our rights</li>
            <li>In connection with a business transaction such as a merger or acquisition</li>
            <li>With your consent or at your direction</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-4">Your Rights</h2>
          <p>Under Indian data protection laws, you have the right to:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Access the personal information we hold about you</li>
            <li>Correct inaccurate or incomplete information</li>
            <li>Delete your personal information</li>
            <li>Withdraw your consent at any time</li>
            <li>Object to the processing of your personal information</li>
            <li>Lodge a complaint with the appropriate regulatory authority</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-4">Changes to This Privacy Policy</h2>
          <p>
            We may update our privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last Updated" date.
          </p>
          <p className="mt-2">
            We encourage you to review this privacy policy periodically for any changes. Your continued use of the Service after we post changes to this privacy policy will constitute your acceptance of those changes.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
          <p>
            If you have any questions about this privacy policy or our data practices, please contact us at:
          </p>
          <div className="mt-2">
            <p className="font-medium">Calorie Tracker</p>
            <p>123 Health Street, Bengaluru, Karnataka 560001</p>
            <p>Email: privacy@calorietracker.in</p>
            <p>Phone: +91 7275722307</p>
          </div>
        </section>

        <section className="space-y-3 mt-6">
          <h2 className="text-xl font-semibold">Analytics and Cookies</h2>
          <p>
            We use Google Analytics to help us understand how our users interact with the website. 
            Google Analytics uses cookies and similar technologies to collect information about 
            how you use our website. This information includes:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
            <li>Pages you visit on our website</li>
            <li>Time spent on each page</li>
            <li>Links you click while using our service</li>
            <li>Your device information and geographical location</li>
          </ul>
          <p>
            The information generated by Google Analytics cookies about your use of the website will be 
            transmitted to and stored by Google on servers in the United States. Google will use this 
            information to evaluate your use of the website, compiling reports on website activity for 
            us and providing other services relating to website activity and internet usage.
          </p>
          <p>
            You can opt-out of Google Analytics tracking by using the Google Analytics Opt-out 
            Browser Add-on available at <a href="https://tools.google.com/dlpage/gaoptout" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://tools.google.com/dlpage/gaoptout</a>.
          </p>
        </section>
      </div>
    </div>
  );
} 