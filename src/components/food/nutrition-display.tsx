
"use client";

import type { AnalyzeFoodPhotoOutput } from "@/ai/flows/analyze-food-photo";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Flame, Drumstick, Droplets, Wheat, List, Info, Sparkles, Orbit,
  ChevronDown, Activity, Heart, MoveUpRight, Bookmark, AlertCircle, Utensils
} from "lucide-react";
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, MotionValue, useMotionValue, useTransform, useSpring, useScroll, useMotionTemplate, useInView } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface NutritionDisplayProps {
  result: AnalyzeFoodPhotoOutput;
  estimatedQuantityNote?: string;
}

// 3D Card effect with mouse tracking
const Card3D: React.FC<{
  children: React.ReactNode;
  className?: string;
  glareIntensity?: number;
  perspective?: number;
  rotationIntensity?: number;
}> = ({ 
  children, 
  className = "", 
  glareIntensity = 0.15,
  perspective = 1000,
  rotationIntensity = 10 
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate position relative to center (values from -1 to 1)
    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);
    
    setMousePosition({ x, y });
  };
  
  // Generate CSS transform based on mouse position
  const transform = isHovered && rotationIntensity > 0
    ? `perspective(${perspective}px) rotateX(${-mousePosition.y * rotationIntensity}deg) rotateY(${mousePosition.x * rotationIntensity}deg)`
    : 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
  
  // Calculate glare position
  const glareX = ((mousePosition.x + 1) / 2) * 100;
  const glareY = ((mousePosition.y + 1) / 2) * 100;
  
  const glareBackground = isHovered && glareIntensity > 0
    ? `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, ${glareIntensity}), transparent 50%)`
    : 'none';
  
  return (
    <div 
      ref={cardRef}
      className={`transition-transform duration-200 will-change-transform relative ${className}`}
      style={{ transform }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glare effect */}
      <div 
        className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300"
        style={{ background: glareBackground, opacity: (isHovered && glareIntensity > 0) ? 1 : 0 }}
      />
      {children}
    </div>
  );
};

// Floating element animation
const FloatingElement: React.FC<{
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  yOffset?: number;
}> = ({ children, delay = 0, duration = 3, className = "", yOffset = 10 }) => {
  return (
    <motion.div
      className={className}
      initial={{ y: 0 }}
      animate={{ 
        y: [-yOffset/2, yOffset/2, -yOffset/2] 
      }}
      transition={{ 
        repeat: Infinity, 
        duration, 
        delay,
        ease: "easeInOut" 
      }}
    >
      {children}
    </motion.div>
  );
};

// Modern radial progress component
const RadialProgress: React.FC<{
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  delay?: number;
  showAnimation?: boolean;
  label?: string;
}> = ({ percentage, size = 60, strokeWidth = 8, color = "#2563eb", delay = 0, showAnimation = true, label }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progressMotion = useMotionValue(0);
  const springProgress = useSpring(progressMotion, { damping: 20, stiffness: 60 });
  const elementRef = useRef(null);
  const isInView = useInView(elementRef, { once: false, amount: 0.3 });
  
  // Convert from motion value to display value
  const strokeDashoffset = useTransform(
    springProgress,
    [0, 100],
    [circumference, 0]
  );
  
  // Blur animation for glow effect
  const blurRadius = useTransform(
    springProgress,
    [0, 50, 100],
    [0, 4, 0]
  );
  
  const glowOpacity = useTransform(
    springProgress,
    [0, 50, 100],
    [0.1, 0.5, 0.2]
  );
  
  const glowStyle = useMotionTemplate`0 0 ${blurRadius}px ${color}`;

  React.useEffect(() => {
    if (isInView && showAnimation) {
      const timer = setTimeout(() => {
        progressMotion.set(percentage);
      }, delay * 1000);
      
      return () => clearTimeout(timer);
    } else if (!showAnimation) {
      progressMotion.set(percentage);
    }
  }, [percentage, delay, progressMotion, isInView, showAnimation]);

  return (
    <div className="relative" style={{ width: size, height: size }} ref={elementRef}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted-foreground/20"
        />
        
        {/* Glow effect */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth + 6}
          strokeDasharray={circumference}
          style={{ 
            strokeDashoffset,
            filter: glowStyle,
            opacity: glowOpacity
          }}
          strokeLinecap="round"
          className="blur-sm"
        />
        
        {/* Main progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
        />
      </svg>
      
      <motion.div 
        className="absolute inset-0 flex items-center justify-center flex-col"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: delay + 0.2, duration: 0.4 }}
      >
        <motion.span 
          className="text-sm font-bold"
          style={{ color }}
        >
          {Math.round(percentage)}%
        </motion.span>
        {label && (
          <motion.span
            className="text-[10px] text-muted-foreground mt-0.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: delay + 0.4 }}
          >
            {label}
          </motion.span>
        )}
      </motion.div>
    </div>
  );
};

const GlowingBadge: React.FC<{
  children: React.ReactNode;
  color?: string;
  delay?: number;
  icon?: React.ReactNode;
  pulse?: boolean;
}> = ({ children, color = "rgba(59, 130, 246, 0.5)", delay = 0, icon, pulse = false }) => {
  const pulseSize = useMotionValue(1);
  const pulseOpacity = useMotionValue(0.4);
  
  useEffect(() => {
    if (pulse) {
      const intervalId = setInterval(() => {
        pulseSize.set(1);
        pulseOpacity.set(0.5);
        setTimeout(() => {
          pulseSize.set(1.3);
          pulseOpacity.set(0);
        }, 100);
      }, 3000);
      
      return () => clearInterval(intervalId);
    }
  }, [pulse, pulseSize, pulseOpacity]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 200, damping: 15 }}
      className="relative inline-block group"
      whileHover={{ scale: 1.05, y: -2 }}
    >
      {/* Pulse effect */}
      {pulse && (
        <motion.div 
          className="absolute inset-0 rounded-full"
          style={{ 
            backgroundColor: color, 
            scale: pulseSize,
            opacity: pulseOpacity,
          }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      )}
      
      {/* Glow effect */}
      <div 
        className="absolute inset-0 rounded-full blur-md transition-opacity duration-300 group-hover:opacity-70"
        style={{ backgroundColor: color, opacity: 0.4 }}
      />
      
      <Badge 
        variant="outline" 
        className="relative bg-background/90 backdrop-blur-md border shadow-lg px-3 py-1.5 text-xs font-medium transition-all duration-300 group-hover:shadow-xl group-hover:border-primary/30"
      >
        {icon && <span className="mr-1.5">{icon}</span>}
        {children}
      </Badge>
    </motion.div>
  );
};

const NutritionItem: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string | number;
  unit?: string;
  colorClass?: string;
  percentage?: number;
  delay?: number;
  showRadial?: boolean;
  highlight?: boolean;
}> = React.memo(({ 
  icon: Icon, 
  label, 
  value, 
  unit, 
  colorClass = "text-primary",
  percentage = 0,
  delay = 0,
  showRadial = false,
  highlight = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const bgColor = colorClass.replace('text-', 'bg-').replace('500', '100');
  const colorHex = getColorHexFromClass(colorClass);
  const itemRef = useRef(null);
  const isInView = useInView(itemRef, { once: false, amount: 0.3 });
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // For spotlight effect
  const spotlightX = useTransform(
    x,
    [-100, 100],
    [0, 100]
  );
  
  const spotlightY = useTransform(
    y,
    [-100, 100],
    [0, 100]
  );
  
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const spotlightBackground = useMotionTemplate`
    radial-gradient(
      circle at ${spotlightX}% ${spotlightY}%,
      ${colorHex}15 0%,
      ${colorHex}05 25%,
      transparent 50%
    )
  `;

  return (
    <motion.div 
      ref={itemRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { 
        opacity: 1, 
        y: 0,
        scale: highlight ? [1, 1.02, 1] : 1
      } : { opacity: 0, y: 20 }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 20, 
        delay: 0.1 + delay,
        scale: {
          repeat: highlight ? Infinity : 0,
          repeatType: "reverse",
          duration: 2
        }
      }}
      className="relative rounded-xl overflow-hidden backdrop-blur-md p-4 border border-border/30"
      style={{
        background: 'var(--bg-card)',
        boxShadow: highlight 
          ? `0 0 20px ${colorHex}40, inset 0 0 10px ${colorHex}10` 
          : `0 4px 15px rgba(0, 0, 0, 0.05)`
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      whileHover={{ 
        y: -5, 
        boxShadow: `0 10px 30px -5px ${colorHex}30`,
        transition: { duration: 0.2 }
      }}
    >
      {/* Spotlight effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: spotlightBackground, opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />
      
      {/* Background gradient effect */}
      <div 
        className="absolute inset-0 opacity-10" 
        style={{ 
          background: `radial-gradient(circle at 50% 0%, ${colorHex}, transparent 70%)`
        }} 
      />
      
      {/* Value indicator line */}
      <motion.div 
        className="absolute top-0 left-0 h-1.5 rounded-t-xl z-10" 
        style={{ backgroundColor: colorHex }}
        initial={{ width: 0 }}
        animate={{ width: isHovered ? '100%' : '30%' }}
        transition={{ duration: 0.4 }}
      />
      
      {/* Animated corner accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 rounded-tl-md" 
        style={{ borderColor: colorHex, opacity: isHovered ? 0.8 : 0.2 }}
      />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 rounded-tr-md" 
        style={{ borderColor: colorHex, opacity: isHovered ? 0.8 : 0.2 }}
      />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 rounded-bl-md" 
        style={{ borderColor: colorHex, opacity: isHovered ? 0.8 : 0.2 }}
      />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 rounded-br-md" 
        style={{ borderColor: colorHex, opacity: isHovered ? 0.8 : 0.2 }}
      />

      <div className="flex items-center justify-between mb-3 relative z-10">
        {/* Icon and label */}
        <div className="flex items-center space-x-3">
          <motion.div 
            className={`p-2.5 rounded-lg ${bgColor} flex items-center justify-center shadow-inner relative`}
            whileHover={{ rotate: [0, -10, 10, -5, 0] }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 rounded-lg opacity-20 bg-white dark:bg-black"></div>
            <Icon className={`h-5 w-5 ${colorClass} relative z-10`} />
            
            {/* Subtle pulse glow effect */}
            <motion.div 
              className="absolute inset-0 rounded-lg"
              style={{ backgroundColor: colorHex }}
              animate={{ 
                opacity: [0.2, 0.4, 0.2],
                scale: [0.8, 1.1, 0.8]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 3 + Math.random() 
              }}
            />
          </motion.div>
          <div>
            <motion.span 
              className="text-md font-medium block"
              animate={{ opacity: isHovered ? 0.7 : 1 }}
            >
              {label}
            </motion.span>
            <motion.span
              className="text-[10px] text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 0.8 : 0.6 }}
            >
              {showRadial ? 'Tap for details' : 'Of daily intake'}
            </motion.span>
          </div>
        </div>

        {/* Value display */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 + delay, type: "spring" }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-full blur-md opacity-20"
            style={{ backgroundColor: colorHex }}
          />
          <motion.div
            className="bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full border border-border/40 shadow-md relative z-10"
            whileHover={{ scale: 1.05 }}
          >
            <span className="font-semibold">{value}</span>
            {unit && <span className="text-xs text-muted-foreground ml-1">{unit}</span>}
          </motion.div>
        </motion.div>
      </div>

      {percentage > 0 && (
        <div className="mt-2 relative z-10">
          <div className="flex justify-between items-center mb-1.5">
            {showRadial ? (
              <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-3">
                <RadialProgress 
                  percentage={percentage}
                  color={colorHex}
                  delay={delay}
                  label="of total"
                />
                <span className="text-xs font-medium text-muted-foreground opacity-70">of total macros</span>
              </div>
            ) : (
              <>
                <span className="text-xs text-muted-foreground">Daily Value</span>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + delay }}
                  className="font-medium text-xs"
                >
                  {Math.round(percentage)}%
                </motion.span>
              </>
            )}
          </div>
          
          {!showRadial && (
            <motion.div
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.2 + delay, duration: 0.8, ease: "easeOut" }}
            >
              <div className="relative">
                <Progress 
                  value={percentage} 
                  className={`h-2.5 rounded-full bg-muted/50 [&>div]:${colorClass}`} 
                />
                
                {/* Animated glow effect */}
                <motion.div 
                  className="absolute top-0 left-0 h-full rounded-full blur-md"
                  style={{ 
                    width: `${percentage}%`, 
                    backgroundColor: colorHex,
                    opacity: isHovered ? 0.5 : 0
                  }}
                  animate={{ opacity: isHovered ? 0.5 : 0 }}
                />
                
                {/* Animated marker at end of progress */}
                <motion.div
                  className="absolute top-50% w-3 h-3 rounded-full translate-y-[-50%] z-10"
                  style={{ 
                    left: `calc(${percentage}% - 6px)`, 
                    backgroundColor: colorHex,
                    boxShadow: `0 0 10px ${colorHex}`
                  }}
                  animate={{
                    scale: isHovered ? [1, 1.2, 1] : 1,
                  }}
                  transition={{
                    repeat: isHovered ? Infinity : 0,
                    duration: 2
                  }}
                />
              </div>
            </motion.div>
          )}
  </div>
      )}
    </motion.div>
  );
});
NutritionItem.displayName = 'NutritionItem';

// Helper function to get hex color from Tailwind class
function getColorHexFromClass(colorClass: string): string {
  if (colorClass.includes('red')) return '#ef4444';
  if (colorClass.includes('blue')) return '#3b82f6';
  if (colorClass.includes('yellow')) return '#eab308';
  if (colorClass.includes('green')) return '#10b981';
  if (colorClass.includes('purple')) return '#8b5cf6';
  if (colorClass.includes('pink')) return '#ec4899';
  if (colorClass.includes('orange')) return '#f97316';
  return '#6366f1'; // Default indigo
}

// Moving particle background component
const ParticleBackground: React.FC<{
  color?: string;
  count?: number;
}> = ({ color = "rgba(var(--primary-hsl), 0.1)", count = 15 }) => {
  const particles = Array.from({ length: count });
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((_, i) => {
        const size = Math.random() * 4 + 1;
        const initialX = Math.random() * 100;
        const initialY = Math.random() * 100;
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              backgroundColor: color,
              left: `${initialX}%`,
              top: `${initialY}%`,
              opacity: 0.3,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration,
              delay,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
};

export default function NutritionDisplay({ result, estimatedQuantityNote }: NutritionDisplayProps) {
  const quantityNote = result.estimatedQuantityNote || estimatedQuantityNote;
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'macros' | 'calories' | 'chart'>('macros');
  const [selectedNutrient, setSelectedNutrient] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  // Parallax effect
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  
  // Calculate total macros for percentages
  const totalMacros = result.proteinEstimate + result.fatEstimate + result.carbEstimate;
  const proteinPercentage = totalMacros > 0 ? (result.proteinEstimate / totalMacros) * 100 : 0;
  const fatPercentage = totalMacros > 0 ? (result.fatEstimate / totalMacros) * 100 : 0;
  const carbPercentage = totalMacros > 0 ? (result.carbEstimate / totalMacros) * 100 : 0;

  // Daily values (rough estimates based on 2000 calorie diet)
  const proteinDV = (result.proteinEstimate / 50) * 100; // ~50g protein
  const fatDV = (result.fatEstimate / 65) * 100; // ~65g fat
  const carbsDV = (result.carbEstimate / 300) * 100; // ~300g carbs

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl overflow-hidden"
    >
      <Card3D className="rounded-xl overflow-hidden" rotationIntensity={10} glareIntensity={0.15}>
        <Card className="bg-background/80 backdrop-blur-md border-2 border-primary/10 shadow-2xl overflow-hidden relative h-full">
          {/* Animated background elements */}
          <ParticleBackground color="rgba(var(--primary-hsl), 0.1)" count={20} />
          
          {/* Moving gradient background */}
          <motion.div 
            className="absolute inset-0 z-0 opacity-20"
            style={{ 
              y: backgroundY,
              background: 'radial-gradient(ellipse at 50% 80%, hsla(var(--primary-hsl), 0.5), transparent 70%)'
            }}
          />
          
          {/* Top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary/30 via-primary/80 to-primary/30 z-10"></div>
          
          {/* Glass effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-background/10 to-background/30 backdrop-blur-sm pointer-events-none z-0" />
          
          <CardHeader className="relative bg-gradient-to-br from-primary/5 via-secondary/5 to-transparent z-10">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <CardTitle className="text-xl font-bold flex items-center justify-center mb-2">
                <FloatingElement 
                  duration={4} 
                  yOffset={5}
                  className="bg-primary/10 p-2.5 rounded-full mr-3 shadow-inner relative"
                >
                  {/* Glow effect */}
                  <motion.div 
                    className="absolute inset-0 rounded-full blur-md"
                    animate={{ 
                      opacity: [0.3, 0.6, 0.3],
                      scale: [0.8, 1.1, 0.8]
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 3 
                    }}
                    style={{ backgroundColor: 'hsl(var(--primary))' }}
                  />
                  <Sparkles className="h-5 w-5 text-primary relative z-10" />
                </FloatingElement>
                <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Nutritional Analysis
                </span>
              </CardTitle>
                            
              {/* Calorie counter highlight */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mt-4 flex justify-center"
                layoutId="calorieCounterNutrition" 
              >
                <div className="relative overflow-hidden rounded-2xl shadow-lg border border-primary/10 px-5 py-3 bg-gradient-to-br from-primary/5 to-background/50">
                  <motion.div
                    className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent"
                    animate={{ 
                      x: ["-100%", "100%"]
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 3,
                      ease: "easeInOut"
                    }}
                  />
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                      <Flame className="h-4 w-4 text-red-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Calories</p>
                      <div className="flex items-baseline">
                        <motion.p 
                          key={result.calorieEstimate}
                          initial={{ y: 20, opacity: 0 }} 
                          animate={{ y: 0, opacity: 1 }}
                          className="text-2xl font-bold text-red-500"
                        >
                          {result.calorieEstimate.toLocaleString()}
                        </motion.p>
                        <span className="text-xs font-normal ml-0.5 text-muted-foreground">kcal</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
      </CardHeader>
          
          <CardContent className="space-y-6 pt-4 relative z-10">
            <AnimatePresence>
        {quantityNote && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-xs text-muted-foreground flex items-start p-3 rounded-lg border border-primary/10 bg-gradient-to-r from-primary/5 to-transparent shadow-inner"
                >
            <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-primary/80" />
            <span>{quantityNote}</span>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Tab navigation */}
            <div className="flex justify-center">
              <div className="bg-muted/30 backdrop-blur-sm rounded-full p-1 flex space-x-1 border border-border/40">
                <motion.button
                  className={`text-xs px-3 py-1 rounded-full transition-colors relative ${activeTab === 'macros' ? 'text-primary font-medium' : 'text-muted-foreground'}`}
                  onClick={() => setActiveTab('macros')}
                  whileTap={{ scale: 0.97 }}
                >
                  {activeTab === 'macros' && (
                    <motion.div 
                      className="absolute inset-0 bg-primary/10 rounded-full -z-10"
                      layoutId="tabHighlightNutrition"
                    />
                  )}
                  Macros
                </motion.button>
                <motion.button
                  className={`text-xs px-3 py-1 rounded-full transition-colors relative ${activeTab === 'calories' ? 'text-primary font-medium' : 'text-muted-foreground'}`}
                  onClick={() => setActiveTab('calories')}
                  whileTap={{ scale: 0.97 }}
                >
                  {activeTab === 'calories' && (
                    <motion.div 
                      className="absolute inset-0 bg-primary/10 rounded-full -z-10"
                      layoutId="tabHighlightNutrition"
                    />
                  )}
                  Calories
                </motion.button>
                <motion.button
                  className={`text-xs px-3 py-1 rounded-full transition-colors relative ${activeTab === 'chart' ? 'text-primary font-medium' : 'text-muted-foreground'}`}
                  onClick={() => setActiveTab('chart')}
                  whileTap={{ scale: 0.97 }}
                >
                  {activeTab === 'chart' && (
                    <motion.div 
                      className="absolute inset-0 bg-primary/10 rounded-full -z-10"
                      layoutId="tabHighlightNutrition"
                    />
                  )}
                  Chart
                </motion.button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'macros' && (
                <motion.div
                  key="macros"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Macronutrient distribution section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-muted/30 rounded-lg p-4 border border-border/50 mb-4"
                  >
                    <h3 className="text-sm font-medium mb-3 flex items-center">
                      <Activity className="h-4 w-4 mr-2 text-primary/70" />
                      Macronutrient Distribution
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex flex-col items-center">
                        <RadialProgress 
                          percentage={proteinPercentage} 
                          color="#3b82f6" 
                          size={70}
                          delay={0.3}
                          label="Protein"
                        />
                        <p className="text-xs font-medium mt-2 text-blue-500">{result.proteinEstimate.toFixed(1)}g</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <RadialProgress 
                          percentage={fatPercentage} 
                          color="#eab308" 
                          size={70}
                          delay={0.4}
                          label="Fat"
                        />
                        <p className="text-xs font-medium mt-2 text-yellow-500">{result.fatEstimate.toFixed(1)}g</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <RadialProgress 
                          percentage={carbPercentage} 
                          color="#10b981" 
                          size={70}
                          delay={0.5}
                          label="Carbs"
                        />
                        <p className="text-xs font-medium mt-2 text-green-500">{result.carbEstimate.toFixed(1)}g</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Main nutrient cards with enhanced visuals */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <NutritionItem 
                      icon={Flame} 
                      label="Calories" 
                      value={result.calorieEstimate.toLocaleString()} 
                      unit="kcal" 
                      colorClass="text-red-500" 
                      delay={0}
                      percentage={Math.min((result.calorieEstimate / 2000) * 100, 100)}
                      highlight={selectedNutrient === 'calories'}
                    />
                    
                    <NutritionItem 
                      icon={Drumstick} 
                      label="Protein" 
                      value={result.proteinEstimate.toLocaleString()} 
                      unit="g" 
                      colorClass="text-blue-500" 
                      percentage={proteinDV}
                      delay={0.1}
                      showRadial={true}
                      highlight={selectedNutrient === 'protein'}
                    />
                    
                    <NutritionItem 
                      icon={Droplets} 
                      label="Fat" 
                      value={result.fatEstimate.toLocaleString()} 
                      unit="g" 
                      colorClass="text-yellow-500" 
                      percentage={fatDV}
                      delay={0.2}
                      showRadial={true}
                      highlight={selectedNutrient === 'fat'}
                    />
                    
                    <NutritionItem 
                      icon={Wheat} 
                      label="Carbohydrates" 
                      value={result.carbEstimate.toLocaleString()} 
                      unit="g" 
                      colorClass="text-green-500" 
                      percentage={carbsDV}
                      delay={0.3}
                      showRadial={true}
                      highlight={selectedNutrient === 'carbs'}
                    />
                  </div>
                </motion.div>
              )}
              
              {activeTab === 'calories' && (
                <motion.div
                  key="calories"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center space-y-4"
                >
                  <FloatingElement 
                    className="w-full max-w-xs"
                    yOffset={10}
                  >
                    <Card3D 
                      className="rounded-xl overflow-hidden"
                      rotationIntensity={15}
                      glareIntensity={0.2}
                    >
                      <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/5 border border-red-500/20">
                        <div className="flex justify-center mb-6">
                          <RadialProgress 
                            percentage={Math.min((result.calorieEstimate / 2000) * 100, 100)} 
                            color="#ef4444"
                            size={120}
                            strokeWidth={10}
                            showAnimation={true}
                            label="of daily value"
                          />
                        </div>
                        
                        <div className="text-center space-y-1">
                          <h3 className="text-lg font-semibold text-red-500">Calorie Breakdown</h3>
                          <p className="text-sm text-muted-foreground">Based on a 2,000 calorie diet</p>
                          
                          <div className="mt-4 text-center">
                            <div className="inline-block px-4 py-2 rounded-lg bg-background/70 backdrop-blur-sm border border-border/30 shadow-lg">
                              <p className="text-3xl font-bold text-red-500">{result.calorieEstimate.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">calories in this meal</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card3D>
                  </FloatingElement>
                  
                  <div className="grid grid-cols-2 gap-3 w-full max-w-md mt-6">
                    <div className="p-3 rounded-lg bg-background/60 border border-border/30 backdrop-blur-sm">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30">
                          <Drumstick className="h-3.5 w-3.5 text-blue-500" />
                        </div>
                        <span className="text-xs">From Protein</span>
                      </div>
                      <p className="text-lg font-semibold mt-1">
                        {Math.round(result.proteinEstimate * 4)} <span className="text-xs text-muted-foreground">kcal</span>
                      </p>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-background/60 border border-border/30 backdrop-blur-sm">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                          <Droplets className="h-3.5 w-3.5 text-yellow-500" />
                        </div>
                        <span className="text-xs">From Fat</span>
                      </div>
                      <p className="text-lg font-semibold mt-1">
                        {Math.round(result.fatEstimate * 9)} <span className="text-xs text-muted-foreground">kcal</span>
                      </p>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-background/60 border border-border/30 backdrop-blur-sm">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/30">
                          <Wheat className="h-3.5 w-3.5 text-green-500" />
                        </div>
                        <span className="text-xs">From Carbs</span>
                      </div>
                      <p className="text-lg font-semibold mt-1">
                        {Math.round(result.carbEstimate * 4)} <span className="text-xs text-muted-foreground">kcal</span>
                      </p>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-background/60 border border-border/30 backdrop-blur-sm">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 rounded-full bg-primary/10">
                          <Heart className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="text-xs">DV Percent</span>
                      </div>
                      <p className="text-lg font-semibold mt-1">
                        {Math.round((result.calorieEstimate / 2000) * 100)}% <span className="text-xs text-muted-foreground">of daily</span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {activeTab === 'chart' && (
                <motion.div
                  key="chart"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="relative h-48 mb-8"
                >
                  <div className="absolute inset-0 bg-muted/30 rounded-lg overflow-hidden backdrop-blur-sm border border-border/30">
                    <div className="absolute left-0 bottom-0 right-0 h-[1px] bg-border/60"></div>
                    <div className="absolute top-0 bottom-0 left-0 w-[1px] bg-border/60"></div>
                    
                    {/* Background grid */}
                    <div className="absolute inset-0" style={{ 
                      backgroundImage: 'linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)',
                      backgroundSize: '20px 20px',
                      opacity: 0.1
                    }}></div>
                    
                    {/* Protein bar */}
                    <motion.div 
                      className="absolute bottom-0 left-[20%] w-[15%] bg-blue-500 rounded-t-lg"
                      initial={{ height: 0 }}
                      animate={{ height: `${(result.proteinEstimate / (result.proteinEstimate + result.fatEstimate + result.carbEstimate)) * 100}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                    >
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                        <span className="text-xs text-blue-500 font-medium">{result.proteinEstimate.toFixed(1)}g</span>
                      </div>
                    </motion.div>
                    
                    {/* Fat bar */}
                    <motion.div 
                      className="absolute bottom-0 left-[45%] w-[15%] bg-yellow-500 rounded-t-lg"
                      initial={{ height: 0 }}
                      animate={{ height: `${(result.fatEstimate / (result.proteinEstimate + result.fatEstimate + result.carbEstimate)) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    >
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                        <span className="text-xs text-yellow-500 font-medium">{result.fatEstimate.toFixed(1)}g</span>
                      </div>
                    </motion.div>
                    
                    {/* Carb bar */}
                    <motion.div 
                      className="absolute bottom-0 left-[70%] w-[15%] bg-green-500 rounded-t-lg"
                      initial={{ height: 0 }}
                      animate={{ height: `${(result.carbEstimate / (result.proteinEstimate + result.fatEstimate + result.carbEstimate)) * 100}%` }}
                      transition={{ duration: 1, delay: 0.7 }}
                    >
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                        <span className="text-xs text-green-500 font-medium">{result.carbEstimate.toFixed(1)}g</span>
                      </div>
                    </motion.div>
                    
                    {/* Labels */}
                    <div className="absolute bottom-2 left-[20%] transform -translate-x-1/2">
                      <span className="text-xs text-muted-foreground">Protein</span>
                    </div>
                    <div className="absolute bottom-2 left-[45%] transform -translate-x-1/2">
                      <span className="text-xs text-muted-foreground">Fat</span>
                    </div>
                    <div className="absolute bottom-2 left-[70%] transform -translate-x-1/2">
                      <span className="text-xs text-muted-foreground">Carbs</span>
                    </div>
          </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Ingredients section with improved animations and 3D effect */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="mt-6 p-5 rounded-xl bg-gradient-to-br from-muted/50 to-muted/20 backdrop-blur-md border border-border/30 shadow-md relative overflow-hidden"
              whileHover={{ scale: 1.01 }}
            >
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{ 
                  backgroundImage: 'radial-gradient(circle at 20px 20px, hsla(var(--primary-hsl),0.1) 2px, transparent 0)',
                  backgroundSize: '20px 20px' 
                }} />
              </div>
              
              <div className="flex items-center mb-3">
                <div className="p-2.5 rounded-lg bg-gradient-to-br from-background/80 to-background/40 border border-border/20 shadow-inner mr-3">
                  <List className="h-5 w-5 text-muted-foreground" />
                </div>
                <h4 className="font-medium text-foreground/90">Identified Dish(es)</h4>
          </div>
              
          {result.ingredients && result.ingredients.length > 0 ? (
                <div className="flex flex-wrap gap-2.5">
              {result.ingredients.map((ingredient, index) => (
                    <GlowingBadge
                      key={index}
                      delay={0.6 + index * 0.1}
                      color={`rgba(${Math.round(Math.random()*50 + 100)}, ${Math.round(Math.random()*100 + 100)}, ${Math.round(Math.random()*150 + 50)}, 0.15)`}
                      pulse={index === 0}
                      icon={index === 0 ? <Utensils className="h-3 w-3" /> : null}
                    >
                  {ingredient}
                    </GlowingBadge>
              ))}
            </div>
          ) : (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-muted-foreground"
                >
                  No specific dish identified.
                </motion.p>
              )}
            </motion.div>
          </CardContent>

          {/* Footer with call to action */}
          <CardFooter className="border-t flex flex-col space-y-3 py-4 relative z-10">
            <motion.button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center justify-center w-full py-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary/90 text-sm font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="mr-2">{showDetails ? 'Hide Details' : 'Show More Details'}</span>
              <motion.div
                animate={{ rotate: showDetails ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="h-4 w-4" />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.3 }}
                  className="pt-3 space-y-3 w-full"
                >
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex justify-between items-center p-3 rounded-lg border border-border/30 bg-background/50"
                  >
                    <span className="text-sm">Daily Value*</span>
                    <motion.div 
                      whileHover={{ x: 3 }}
                      className="flex items-center text-primary text-sm"
                    >
                      See Breakdown <MoveUpRight className="ml-1 h-4 w-4" />
                    </motion.div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-muted/30 rounded-lg p-3"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium">Important Notes</span>
        </div>
                    <motion.p 
                      className="text-xs text-muted-foreground"
                    >
                      * Percent Daily Values are based on a 2,000 calorie diet. Your daily values may be higher or lower depending on your calorie needs.
                    </motion.p>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex justify-center"
                  >
                    <motion.button
                      className="text-sm text-primary flex items-center space-x-1 bg-transparent"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Bookmark className="h-4 w-4 mr-1" />
                      <span>Save to Favorites</span>
                    </motion.button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardFooter>
    </Card>
      </Card3D>
    </motion.div>
  );
}
