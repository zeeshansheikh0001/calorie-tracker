import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service | Calorie Tracker',
  description: 'Read the Terms of Service for Calorie Tracker, explaining the rules and guidelines for using our nutrition tracking application.',
  keywords: 'terms of service, terms and conditions, user agreement, legal terms, calorie tracker terms',
  alternates: {
    canonical: 'https://calorietracker.in/terms',
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen py-12 px-4 md:px-6 lg:px-8 max-w-4xl mx-auto">
      <Link href="/" className="inline-block mb-8">
        <Button variant="ghost" className="group">
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Button>
      </Link>
      
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Terms of Service</h1>
      <p className="text-muted-foreground mb-4">Last Updated: July 1, 2023</p>
      
      <div className="space-y-8 text-foreground/90">
        <section>
          <h2 className="text-xl font-semibold mb-4">Introduction</h2>
          <p>
            Welcome to Calorie Tracker. These Terms of Service ("Terms") govern your use of the Calorie Tracker application and website (collectively, the "Service") operated by Calorie Tracker ("we", "us", or "our").
          </p>
          <p className="mt-2">
            By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the Terms, you may not access the Service.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-4">Use of the Service</h2>
          <p>By using our Service, you agree to:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>
              Use the Service only for lawful purposes and in accordance with these Terms
            </li>
            <li>
              Not use the Service in any way that violates any applicable local, state, national, or international law or regulation
            </li>
            <li>
              Not attempt to probe, scan, or test the vulnerability of the Service or any related system or network
            </li>
            <li>
              Not use any automated system, including "robots," "spiders," or "offline readers," to access the Service
            </li>
            <li>
              Not interfere with or disrupt the Service or servers or networks connected to the Service
            </li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-4">Account Registration</h2>
          <p>
            When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
          </p>
          <p className="mt-2">
            You are responsible for safeguarding the password used to access the Service and for any activities or actions taken under your password. You agree not to disclose your password to any third party.
          </p>
          <p className="mt-2">
            You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-4">Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are and will remain the exclusive property of Calorie Tracker and its licensors. The Service is protected by copyright, trademark, and other laws of both India and foreign countries.
          </p>
          <p className="mt-2">
            Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Calorie Tracker.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-4">User Content</h2>
          <p>
            Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, or other material ("Content"). You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.
          </p>
          <p className="mt-2">
            By posting Content to the Service, you grant us the right to use, modify, publicly perform, publicly display, reproduce, and distribute such Content on and through the Service. You retain any and all of your rights to any Content you submit, post, or display on or through the Service and you are responsible for protecting those rights.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-4">Health Disclaimer</h2>
          <p>
            The Content provided through the Service is for informational and educational purposes only and is not intended as medical advice. The Service is not a substitute for professional medical advice, diagnosis, or treatment.
          </p>
          <p className="mt-2">
            Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition or your dietary needs. Never disregard professional medical advice or delay in seeking it because of something you have read on the Service.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-4">Limitation of Liability</h2>
          <p>
            In no event shall Calorie Tracker, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Your access to or use of or inability to access or use the Service</li>
            <li>Any conduct or content of any third party on the Service</li>
            <li>Any content obtained from the Service</li>
            <li>Unauthorized access, use, or alteration of your transmissions or content</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-4">Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </p>
          <p className="mt-2">
            Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service or contact us to request account deletion.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-4">Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of changes by posting the updated Terms on this page with a new effective date.
          </p>
          <p className="mt-2">
            Your continued use of the Service after any such changes constitutes your acceptance of the new Terms. Please review this agreement periodically for changes.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-4">Governing Law</h2>
          <p>
            These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.
          </p>
          <p className="mt-2">
            Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
          </p>
          <div className="mt-2">
            <p className="font-medium">Calorie Tracker</p>
            <p>123 Health Street, Bengaluru, Karnataka 560001</p>
            <p>Email: legal@calorietracker.in</p>
            <p>Phone: +91 98765 43210</p>
          </div>
        </section>
      </div>
    </div>
  );
} 