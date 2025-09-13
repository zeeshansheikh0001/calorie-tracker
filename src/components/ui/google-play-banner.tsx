"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Star, Users, Smartphone } from "lucide-react";
import Image from "next/image";

interface GooglePlayBannerProps {
  variant?: "default" | "compact" | "minimal";
  className?: string;
  showOnMobile?: boolean;
}

export function GooglePlayBanner({ 
  variant = "default", 
  className = "",
  showOnMobile = true 
}: GooglePlayBannerProps) {
  const playStoreUrl = "https://play.google.com/store/apps/details?id=com.calorietracker.app";

  if (variant === "minimal") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`${className} ${!showOnMobile ? 'hidden md:block' : ''}`}
      >
        <Button
          asChild
          variant="outline"
          className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-green-600 hover:border-green-700 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <a
            href={playStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3"
          >
            <Download className="h-5 w-5" />
            <span className="font-semibold">Download on Google Play</span>
          </a>
        </Button>
      </motion.div>
    );
  }

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`${className} ${!showOnMobile ? 'hidden md:block' : ''}`}
      >
        <Card className="border-2 border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-200">Get the Mobile App</h3>
                  <p className="text-sm text-green-600 dark:text-green-400">Enhanced experience on your phone</p>
                </div>
              </div>
              <Button
                asChild
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <a
                  href={playStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Install
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Default variant - full featured banner
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring" }}
      className={`${className} ${!showOnMobile ? 'hidden md:block' : ''}`}
    >
      <Card className="relative overflow-hidden border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 via-green-100 to-emerald-100 dark:from-green-950/30 dark:via-green-900/20 dark:to-emerald-950/20 shadow-xl hover:shadow-2xl transition-all duration-300">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-green-400/20 to-emerald-400/20 animate-pulse" />
          <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-green-300/30 animate-bounce" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full bg-emerald-300/30 animate-bounce" style={{ animationDelay: '2s' }} />
        </div>

        <CardContent className="relative p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Left side - App info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                <motion.div
                  className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Smartphone className="h-6 w-6 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold text-green-800 dark:text-green-200">
                    CalorieTracker Mobile
                  </h3>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Available on Google Play
                  </p>
                </div>
              </div>

              <p className="text-green-700 dark:text-green-300 mb-4 text-sm leading-relaxed">
                Get the full mobile experience with AI-powered food detection, 
                offline tracking, and push notifications. Perfect for on-the-go nutrition tracking.
              </p>

              {/* App stats */}
              <div className="flex items-center justify-center md:justify-start gap-4 text-xs text-green-600 dark:text-green-400 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="font-medium">4.8 Rating</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">10K+ Downloads</span>
                </div>
              </div>
            </div>

            {/* Right side - Download button */}
            <div className="flex-shrink-0">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  asChild
                  size="lg"
                  className="h-14 px-8 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                >
                  <a
                    href={playStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3"
                  >
                    <Download className="h-6 w-6" />
                    <div className="text-left">
                      <div className="text-sm font-medium">Download on</div>
                      <div className="text-lg font-bold">Google Play</div>
                    </div>
                  </a>
                </Button>
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
