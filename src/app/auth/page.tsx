
"use client";

import { AuthForm } from "@/components/auth/auth-form";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push("/"); // Redirect to dashboard if already logged in
      } else {
        setLoading(false);
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        router.push("/");
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 to-indigo-600">
        <Loader2 className="h-12 w-12 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Background Gradient Animation */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-800 opacity-90"></div>
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            x: ["0%", "100%", "0%"],
            y: ["0%", "100%", "0%"],
            scale: [1, 1.2, 1],
            rotate: [0, 360, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            x: ["0%", "-100%", "0%"],
            y: ["0%", "-100%", "0%"],
            scale: [1, 1.1, 1],
            rotate: [0, -360, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Content Card */}
      <motion.div
        className="relative z-10 bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl p-8 border border-white/20 max-w-md w-full"
        initial={{ y: -50, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.5, type: "spring", stiffness: 100 }}
      >
        <h1 className="text-4xl font-bold text-white text-center mb-6 drop-shadow-lg">
          Calorie Tracker
        </h1>
        <AuthForm />
      </motion.div>
    </div>
  );
}
