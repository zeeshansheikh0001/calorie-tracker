"use client";

import type { AnalyzeFoodPhotoOutput } from "@/ai/flows/analyze-food-photo";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Flame, Drumstick, Droplets, Wheat, List, Info, Sparkles,
  ChevronDown, Activity, Heart, MoveUpRight, Bookmark, AlertCircle, Utensils, Orbit
} from "lucide-react";
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, MotionValue, useMotionValue, useTransform, useSpring, useScroll, useMotionTemplate, useInView } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label"; // Added Label
import { Switch } from "@/components/ui/switch"; // Added Switch
import type { Goal } from "@/types"; // Added Goal type
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface NutritionDisplayProps {
  result: AnalyzeFoodPhotoOutput;
  estimatedQuantityNote?: string;
  goals?: Goal | null; // Added goals prop
  isLoadingGoals?: boolean; // Added isLoadingGoals prop
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
  glareIntensity = 0.15, // Default active glare
  perspective = 1000,
  rotationIntensity = 10  // Default active rotation
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);
    
    setMousePosition({ x, y });
  };
  
  const transform = isHovered && rotationIntensity > 0
    ? `perspective(${perspective}px) rotateX(${-mousePosition.y * rotationIntensity}deg) rotateY(${mousePosition.x * rotationIntensity}deg)`
    : 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
  
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
  
  const strokeDashoffset = useTransform(
    springProgress,
    [0, 100],
    [circumference, 0]
  );
  
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
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted-foreground/20"
        />
        
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

interface NutritionItemProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  unit?: string;
  colorClass?: string;
  percentage?: number;
  delay?: number;
  showRadial?: boolean;
  highlight?: boolean;
  radialLabel?: string;
}

const NutritionItem: React.FC<NutritionItemProps> = React.memo(({ 
  icon: Icon, 
  label, 
  value, 
  unit, 
  colorClass = "text-primary",
  percentage = 0,
  delay = 0,
  showRadial = false,
  highlight = false,
  radialLabel = "of Daily Goal" // Default radial label
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const bgColor = colorClass.replace('text-', 'bg-').replace('500', '100');
  const colorHex = getColorHexFromClass(colorClass);
  const itemRef = useRef(null);
  const isInView = useInView(itemRef, { once: false, amount: 0.3 });
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
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
      ${colorHex}05 30%,
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
      className="relative rounded-xl overflow-hidden backdrop-blur-sm p-4 border border-border/30"
      style={{
        background: 'var(--bg-card)',
        boxShadow: highlight 
          ? `0 0 15px ${colorHex}30` 
          : `0 8px 20px -5px rgba(0, 0, 0, 0.05)`
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      whileHover={{ 
        y: -3, 
        boxShadow: `0 10px 25px -5px ${colorHex}20, 0 4px 10px rgba(0, 0, 0, 0.03)`,
        transition: { duration: 0.2 }
      }}
    >
      {/* Subtle spotlight effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: spotlightBackground, opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
      
      <div className="grid grid-cols-[auto_1fr_auto] gap-3 items-center relative z-10">
        {/* Icon */}
        <div 
          className={`p-2.5 rounded-lg ${bgColor} flex items-center justify-center shadow-sm relative`}
        >
          <Icon className={`h-5 w-5 ${colorClass}`} />
        </div>
        
        {/* Label and description */}
        <div>
          <span className="text-base font-medium block">
            {label}
          </span>
          <span className="text-xs text-muted-foreground">
            {percentage > 0 
              ? percentage > 100 
                ? <span className="flex items-center text-amber-500 font-medium">
                    <AlertCircle className="h-3 w-3 mr-1" /> We've exceeded daily goal
                  </span> 
                : `${Math.round(percentage)}% of daily goal`
              : 'No goal set'}
          </span>
        </div>
        
        {/* Value */}
        <div className={`bg-background/50 backdrop-blur-sm px-3 py-1.5 rounded-lg border ${percentage > 100 ? 'border-amber-300/50' : 'border-border/20'} shadow-sm`}>
          <span className={`font-semibold text-lg ${percentage > 100 ? 'text-amber-500' : ''}`}>{value}</span>
          {unit && <span className="text-xs text-muted-foreground ml-1">{unit}</span>}
        </div>
      </div>

      {/* Progress bar */}
      {percentage > 0 && !showRadial && (
        <div className="mt-3 pt-3 border-t border-border/20 relative z-10">
          <div className="relative h-2 rounded-full bg-muted/30 overflow-hidden">
            <motion.div 
              className={`absolute top-0 left-0 h-full rounded-full ${percentage > 100 ? 'bg-amber-500' : ''}`}
              style={{ 
                width: percentage > 100 ? '100%' : `${percentage}%`, 
                backgroundColor: percentage > 100 ? undefined : colorHex 
              }}
              initial={{ width: 0 }}
              animate={{ width: percentage > 100 ? '100%' : `${percentage}%` }}
              transition={{ delay: 0.2 + delay, duration: 0.6, ease: "easeOut" }}
            />
            
            {percentage > 100 && (
              <motion.div
                className="absolute top-0 right-0 h-full w-2 bg-amber-500 rounded-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
            )}
          </div>
          
          {percentage > 100 && (
            <div className="mt-1 text-right">
              <span className="text-xs text-amber-500">We're {Math.round(percentage - 100)}% over our limit</span>
            </div>
          )}
        </div>
      )}
      
      {/* Radial display if needed */}
      {percentage > 0 && showRadial && (
        <div className="mt-3 pt-3 border-t border-border/20 flex justify-center">
          <RadialProgress 
            percentage={percentage}
            color={colorHex}
            size={60}
            strokeWidth={6}
            delay={delay}
            label={radialLabel}
          />
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
}> = ({ color = "hsla(var(--primary-hsl), 0.1)", count = 15 }) => {
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

export default function NutritionDisplay({ result, estimatedQuantityNote, goals, isLoadingGoals }: NutritionDisplayProps) {
  const quantityNote = result.estimatedQuantityNote || estimatedQuantityNote;
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'macros' | 'calories' | 'chart'>('macros');
  const [selectedNutrient, setSelectedNutrient] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  
  const { calorieEstimate, proteinEstimate, fatEstimate, carbEstimate } = result;

  const caloriePercentage = (goals && goals.calories > 0) 
    ? (calorieEstimate / goals.calories) * 100 
    : 0;
  const proteinPercentage = (goals && goals.protein > 0) 
    ? (proteinEstimate / goals.protein) * 100 
    : 0;
  const fatPercentage = (goals && goals.fat > 0) 
    ? (fatEstimate / goals.fat) * 100 
    : 0;
  const carbPercentage = (goals && goals.carbs > 0) 
    ? (carbEstimate / goals.carbs) * 100 
    : 0;
  
  const totalMacrosForRadial = proteinEstimate + fatEstimate + carbEstimate;
  const proteinRadialPercentage = totalMacrosForRadial > 0 ? (proteinEstimate / totalMacrosForRadial) * 100 : 0;
  const fatRadialPercentage = totalMacrosForRadial > 0 ? (fatEstimate / totalMacrosForRadial) * 100 : 0;
  const carbRadialPercentage = totalMacrosForRadial > 0 ? (carbEstimate / totalMacrosForRadial) * 100 : 0;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl overflow-hidden"
    >
      <Card3D className="rounded-xl overflow-hidden" rotationIntensity={0} glareIntensity={0}>
        <Card className="bg-background/80 backdrop-blur-md border-2 border-primary/10 shadow-2xl overflow-hidden relative h-full">
          <ParticleBackground color="hsla(var(--primary-hsl), 0.1)" count={20} />
          
          <motion.div 
            className="absolute inset-0 z-0 opacity-20"
            style={{ 
              y: backgroundY,
              background: 'radial-gradient(ellipse at 50% 80%, hsla(var(--primary-hsl), 0.5), transparent 70%)'
            }}
          />
          
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary/30 via-primary/80 to-primary/30 z-10"></div>
          
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
                          key={calorieEstimate}
                          initial={{ y: 20, opacity: 0 }} 
                          animate={{ y: 0, opacity: 1 }}
                          className={`text-2xl font-bold ${caloriePercentage > 100 ? 'text-amber-500' : 'text-red-500'}`}
                        >
                          {calorieEstimate.toLocaleString()}
                        </motion.p>
                        <span className="text-xs font-normal ml-0.5 text-muted-foreground">kcal</span>
                        
                        {caloriePercentage > 100 && goals && (
                          <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="ml-2 flex items-center"
                          >
                            <Badge variant="outline" className="bg-amber-100/30 text-amber-500 border-amber-200/50 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              <span className="text-[10px]">
                                +{Math.round(calorieEstimate - goals.calories)} kcal
                              </span>
                            </Badge>
                          </motion.div>
                        )}
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
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-muted/30 rounded-lg p-4 border border-border/50 mb-4 shadow-sm"
                  >
                    <h3 className="text-sm font-medium mb-3 flex items-center">
                      <Activity className="h-4 w-4 mr-2 text-primary/70" />
                      Macronutrient Distribution
                    </h3>
                    
                    <div className="grid md:grid-cols-[1fr_2fr] gap-4 items-center">
                      {/* Doughnut Chart */}
                      <div className="relative mx-auto w-44 h-44">
                        {/* Base glow effect */}
                        <div 
                          className="absolute inset-0 rounded-full blur-xl opacity-20"
                          style={{
                            background: selectedNutrient 
                              ? selectedNutrient === 'protein' 
                                ? 'radial-gradient(circle, rgba(59, 130, 246, 0.8) 0%, transparent 70%)' 
                                : selectedNutrient === 'fat'
                                  ? 'radial-gradient(circle, rgba(234, 179, 8, 0.8) 0%, transparent 70%)'
                                  : 'radial-gradient(circle, rgba(16, 185, 129, 0.8) 0%, transparent 70%)'
                              : 'none'
                          }}
                        />
                        
                        <svg viewBox="0 0 100 100" className="w-full h-full relative z-10">
                          {/* Background circle with subtle gradient */}
                          <defs>
                            <radialGradient id="chartBg" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                              <stop offset="0%" stopColor="hsl(var(--muted-foreground))" stopOpacity="0.05" />
                              <stop offset="100%" stopColor="hsl(var(--muted-foreground))" stopOpacity="0.15" />
                            </radialGradient>
                          </defs>
                          <circle cx="50" cy="50" r="40" fill="transparent" stroke="url(#chartBg)" strokeWidth="12" />
                          
                          {/* Calculate stroke dash offsets based on percentages */}
                          {totalMacrosForRadial > 0 && (
                            <>
                              {/* Filter for protein glow */}
                              <defs>
                                <filter id="proteinGlow" x="-20%" y="-20%" width="140%" height="140%">
                                  <feGaussianBlur stdDeviation="2" result="blur" />
                                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                                <filter id="fatGlow" x="-20%" y="-20%" width="140%" height="140%">
                                  <feGaussianBlur stdDeviation="2" result="blur" />
                                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                                <filter id="carbGlow" x="-20%" y="-20%" width="140%" height="140%">
                                  <feGaussianBlur stdDeviation="2" result="blur" />
                                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                                <linearGradient id="proteinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#60a5fa" />
                                  <stop offset="100%" stopColor="#3b82f6" />
                                </linearGradient>
                                <linearGradient id="fatGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#fcd34d" />
                                  <stop offset="100%" stopColor="#eab308" />
                                </linearGradient>
                                <linearGradient id="carbGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#34d399" />
                                  <stop offset="100%" stopColor="#10b981" />
                                </linearGradient>
                              </defs>
                            
                              {/* Protein segment - Blue */}
                              <motion.circle 
                                cx="50" 
                                cy="50" 
                                r="40" 
                                fill="transparent" 
                                stroke="url(#proteinGradient)" 
                                strokeWidth="12"
                                strokeDasharray={`${proteinRadialPercentage * 2.51} ${(100 - proteinRadialPercentage) * 2.51}`}
                                strokeDashoffset="0"
                                transform="rotate(-90 50 50)"
                                initial={{ filter: "none" }}
                                whileHover={{ 
                                  r: [40, 42, 41], 
                                  strokeWidth: [12, 15, 13],
                                  filter: "url(#proteinGlow)"
                                }}
                                animate={{ 
                                  filter: selectedNutrient === 'protein' ? "url(#proteinGlow)" : "none",
                                  strokeWidth: selectedNutrient === 'protein' ? 15 : 12,
                                  r: selectedNutrient === 'protein' ? 41 : 40
                                }}
                                transition={{ 
                                  duration: 0.5, 
                                  r: { type: "spring", stiffness: 300, damping: 15 },
                                  strokeWidth: { type: "spring", stiffness: 300, damping: 15 }
                                }}
                                className="cursor-pointer"
                                onMouseEnter={() => setSelectedNutrient('protein')}
                                onMouseLeave={() => setSelectedNutrient(null)}
                              />
                              
                              {/* Fat segment - Yellow */}
                              <motion.circle 
                                cx="50" 
                                cy="50" 
                                r="40" 
                                fill="transparent" 
                                stroke="url(#fatGradient)" 
                                strokeWidth="12"
                                strokeDasharray={`${fatRadialPercentage * 2.51} ${(100 - fatRadialPercentage) * 2.51}`}
                                strokeDashoffset={`${-proteinRadialPercentage * 2.51}`}
                                transform="rotate(-90 50 50)"
                                initial={{ filter: "none" }}
                                whileHover={{ 
                                  r: [40, 42, 41], 
                                  strokeWidth: [12, 15, 13],
                                  filter: "url(#fatGlow)"
                                }}
                                animate={{ 
                                  filter: selectedNutrient === 'fat' ? "url(#fatGlow)" : "none",
                                  strokeWidth: selectedNutrient === 'fat' ? 15 : 12,
                                  r: selectedNutrient === 'fat' ? 41 : 40
                                }}
                                transition={{ 
                                  duration: 0.5, 
                                  r: { type: "spring", stiffness: 300, damping: 15 },
                                  strokeWidth: { type: "spring", stiffness: 300, damping: 15 }
                                }}
                                className="cursor-pointer"
                                onMouseEnter={() => setSelectedNutrient('fat')}
                                onMouseLeave={() => setSelectedNutrient(null)}
                              />
                              
                              {/* Carbs segment - Green */}
                              <motion.circle 
                                cx="50" 
                                cy="50" 
                                r="40" 
                                fill="transparent" 
                                stroke="url(#carbGradient)" 
                                strokeWidth="12"
                                strokeDasharray={`${carbRadialPercentage * 2.51} ${(100 - carbRadialPercentage) * 2.51}`}
                                strokeDashoffset={`${-(proteinRadialPercentage + fatRadialPercentage) * 2.51}`}
                                transform="rotate(-90 50 50)"
                                initial={{ filter: "none" }}
                                whileHover={{ 
                                  r: [40, 42, 41], 
                                  strokeWidth: [12, 15, 13],
                                  filter: "url(#carbGlow)"
                                }}
                                animate={{ 
                                  filter: selectedNutrient === 'carbs' ? "url(#carbGlow)" : "none",
                                  strokeWidth: selectedNutrient === 'carbs' ? 15 : 12,
                                  r: selectedNutrient === 'carbs' ? 41 : 40
                                }}
                                transition={{ 
                                  duration: 0.5, 
                                  r: { type: "spring", stiffness: 300, damping: 15 },
                                  strokeWidth: { type: "spring", stiffness: 300, damping: 15 }
                                }}
                                className="cursor-pointer"
                                onMouseEnter={() => setSelectedNutrient('carbs')}
                                onMouseLeave={() => setSelectedNutrient(null)}
                              />
                              
                              {/* Center content with animation */}
                              <motion.g
                                initial={{ opacity: 1, scale: 1 }}
                                animate={{ 
                                  opacity: selectedNutrient ? 0.8 : 1,
                                  scale: selectedNutrient ? 0.92 : 1,
                                  y: selectedNutrient ? 2 : 0
                                }}
                                transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
                              >
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="30"
                                  fill="hsl(var(--card))"
                                  className="opacity-80"
                                />
                                <text 
                                  x="50" 
                                  y="45" 
                                  textAnchor="middle" 
                                  className="text-lg font-semibold fill-foreground"
                                >
                                  {Math.round(totalMacrosForRadial)}g
                                </text>
                                <text 
                                  x="50" 
                                  y="58" 
                                  textAnchor="middle" 
                                  className="text-xs fill-muted-foreground"
                                >
                                  Total
                                </text>
                              </motion.g>
                              
                              {/* Highlight animation for selected nutrient */}
                              {selectedNutrient && (
                                <motion.circle
                                  cx="50"
                                  cy="50"
                                  r="50"
                                  initial={{ opacity: 0 }}
                                  animate={{ 
                                    opacity: [0, 0.2, 0],
                                    scale: [0.8, 1.1, 0.8]
                                  }}
                                  transition={{
                                    repeat: Infinity,
                                    duration: 2,
                                  }}
                                  fill="none"
                                  stroke={selectedNutrient === 'protein' 
                                    ? "#3b82f6" 
                                    : selectedNutrient === 'fat' 
                                      ? "#eab308" 
                                      : "#10b981"}
                                  strokeWidth="1"
                                />
                              )}
                            </>
                          )}
                        </svg>
                      </div>
                      
                      {/* Legend and percentage details */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-3">
                          <motion.div 
                            className="flex items-center justify-between py-1.5 px-2 rounded-md transition-colors"
                            animate={{ 
                              backgroundColor: selectedNutrient === 'protein' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                            }}
                            whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                            onMouseEnter={() => setSelectedNutrient('protein')}
                            onMouseLeave={() => setSelectedNutrient(null)}
                          >
                            <div className="flex items-center">
                              <motion.div 
                                className="w-3 h-3 rounded-full bg-blue-500 mr-2"
                                animate={{ 
                                  scale: selectedNutrient === 'protein' ? [1, 1.2, 1] : 1,
                                }}
                                transition={{ 
                                  repeat: selectedNutrient === 'protein' ? Infinity : 0,
                                  duration: 2
                                }}
                              />
                              <span className="text-sm">Protein</span>
                            </div>
                            <div className="flex space-x-3 items-center">
                              <span className="font-medium">{proteinEstimate.toFixed(1)}g</span>
                              <motion.div 
                                className="text-blue-500 font-semibold text-sm px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 rounded-md min-w-[40px] text-center"
                                animate={{ 
                                  scale: selectedNutrient === 'protein' ? [1, 1.08, 1] : 1,
                                  backgroundColor: selectedNutrient === 'protein' ? ['rgba(59, 130, 246, 0.2)', 'rgba(59, 130, 246, 0.3)', 'rgba(59, 130, 246, 0.2)'] : 'rgba(59, 130, 246, 0.1)'
                                }}
                                transition={{ 
                                  repeat: selectedNutrient === 'protein' ? Infinity : 0,
                                  duration: 2
                                }}
                              >
                                {Math.round(proteinRadialPercentage)}%
                              </motion.div>
                            </div>
                          </motion.div>
                          
                          <motion.div 
                            className="flex items-center justify-between py-1.5 px-2 rounded-md transition-colors"
                            animate={{ 
                              backgroundColor: selectedNutrient === 'fat' ? 'rgba(234, 179, 8, 0.1)' : 'transparent',
                            }}
                            whileHover={{ backgroundColor: 'rgba(234, 179, 8, 0.1)' }}
                            onMouseEnter={() => setSelectedNutrient('fat')}
                            onMouseLeave={() => setSelectedNutrient(null)}
                          >
                            <div className="flex items-center">
                              <motion.div 
                                className="w-3 h-3 rounded-full bg-yellow-500 mr-2"
                                animate={{ 
                                  scale: selectedNutrient === 'fat' ? [1, 1.2, 1] : 1,
                                }}
                                transition={{ 
                                  repeat: selectedNutrient === 'fat' ? Infinity : 0,
                                  duration: 2
                                }}
                              />
                              <span className="text-sm">Fat</span>
                            </div>
                            <div className="flex space-x-3 items-center">
                              <span className="font-medium">{fatEstimate.toFixed(1)}g</span>
                              <motion.div 
                                className="text-yellow-500 font-semibold text-sm px-2 py-0.5 bg-yellow-50 dark:bg-yellow-900/20 rounded-md min-w-[40px] text-center"
                                animate={{ 
                                  scale: selectedNutrient === 'fat' ? [1, 1.08, 1] : 1,
                                  backgroundColor: selectedNutrient === 'fat' ? ['rgba(234, 179, 8, 0.2)', 'rgba(234, 179, 8, 0.3)', 'rgba(234, 179, 8, 0.2)'] : 'rgba(234, 179, 8, 0.1)'
                                }}
                                transition={{ 
                                  repeat: selectedNutrient === 'fat' ? Infinity : 0,
                                  duration: 2
                                }}
                              >
                                {Math.round(fatRadialPercentage)}%
                              </motion.div>
                            </div>
                          </motion.div>
                          
                          <motion.div 
                            className="flex items-center justify-between py-1.5 px-2 rounded-md transition-colors"
                            animate={{ 
                              backgroundColor: selectedNutrient === 'carbs' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                            }}
                            whileHover={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                            onMouseEnter={() => setSelectedNutrient('carbs')}
                            onMouseLeave={() => setSelectedNutrient(null)}
                          >
                            <div className="flex items-center">
                              <motion.div 
                                className="w-3 h-3 rounded-full bg-green-500 mr-2"
                                animate={{ 
                                  scale: selectedNutrient === 'carbs' ? [1, 1.2, 1] : 1,
                                }}
                                transition={{ 
                                  repeat: selectedNutrient === 'carbs' ? Infinity : 0,
                                  duration: 2
                                }}
                              />
                              <span className="text-sm">Carbs</span>
                            </div>
                            <div className="flex space-x-3 items-center">
                              <span className="font-medium">{carbEstimate.toFixed(1)}g</span>
                              <motion.div 
                                className="text-green-500 font-semibold text-sm px-2 py-0.5 bg-green-50 dark:bg-green-900/20 rounded-md min-w-[40px] text-center"
                                animate={{ 
                                  scale: selectedNutrient === 'carbs' ? [1, 1.08, 1] : 1,
                                  backgroundColor: selectedNutrient === 'carbs' ? ['rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 0.3)', 'rgba(16, 185, 129, 0.2)'] : 'rgba(16, 185, 129, 0.1)'
                                }}
                                transition={{ 
                                  repeat: selectedNutrient === 'carbs' ? Infinity : 0,
                                  duration: 2
                                }}
                              >
                                {Math.round(carbRadialPercentage)}%
                              </motion.div>
                            </div>
                          </motion.div>
                        </div>
                        
                        <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/30">
                          <div className="flex justify-between items-center">
                            <span>Calculated by weight</span>
                            <span>{Math.round(totalMacrosForRadial)}g total</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <NutritionItem 
                      icon={Flame} 
                      label="Calories" 
                      value={calorieEstimate.toLocaleString()} 
                      unit="kcal" 
                      colorClass="text-red-500" 
                      delay={0}
                      percentage={caloriePercentage}
                      highlight={selectedNutrient === 'calories'}
                      radialLabel="of Daily Goal"
                    />
                    
                    <NutritionItem 
                      icon={Drumstick} 
                      label="Protein" 
                      value={proteinEstimate.toLocaleString()} 
                      unit="g" 
                      colorClass="text-blue-500" 
                      percentage={proteinPercentage}
                      delay={0.1}
                      showRadial={false} // Keep linear bar for daily goal comparison
                      highlight={selectedNutrient === 'protein'}
                      radialLabel="of Daily Goal"
                    />
                    
                    <NutritionItem 
                      icon={Droplets} 
                      label="Fat" 
                      value={fatEstimate.toLocaleString()} 
                      unit="g" 
                      colorClass="text-yellow-500" 
                      percentage={fatPercentage}
                      delay={0.2}
                      showRadial={false} // Keep linear bar for daily goal comparison
                      highlight={selectedNutrient === 'fat'}
                      radialLabel="of Daily Goal"
                    />
                    
                    <NutritionItem 
                      icon={Wheat} 
                      label="Carbohydrates" 
                      value={carbEstimate.toLocaleString()} 
                      unit="g" 
                      colorClass="text-green-500" 
                      percentage={carbPercentage}
                      delay={0.3}
                      showRadial={false} // Keep linear bar for daily goal comparison
                      highlight={selectedNutrient === 'carbs'}
                      radialLabel="of Daily Goal"
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
                            percentage={caloriePercentage} 
                            color="#ef4444"
                            size={120}
                            strokeWidth={10}
                            showAnimation={true}
                            label="of Daily Goal"
                          />
                        </div>
                        
                        <div className="text-center space-y-1">
                          <h3 className="text-lg font-semibold text-red-500">Calorie Breakdown</h3>
                           <p className="text-sm text-muted-foreground">
                            { goals && goals.calories > 0 ? `Daily Goal: ${goals.calories.toLocaleString()} kcal` : "No daily goal set"}
                          </p>
                          
                          <div className="mt-4 text-center">
                            <div className="inline-block px-4 py-2 rounded-lg bg-background/70 backdrop-blur-sm border border-border/30 shadow-lg">
                              <p className="text-3xl font-bold text-red-500">{calorieEstimate.toLocaleString()}</p>
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
                        {Math.round(proteinEstimate * 4)} <span className="text-xs text-muted-foreground">kcal</span>
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
                        {Math.round(fatEstimate * 9)} <span className="text-xs text-muted-foreground">kcal</span>
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
                        {Math.round(carbEstimate * 4)} <span className="text-xs text-muted-foreground">kcal</span>
                      </p>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-background/60 border border-border/30 backdrop-blur-sm">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 rounded-full bg-primary/10">
                          <Heart className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="text-xs">Goal Contribution</span>
                      </div>
                      <p className="text-lg font-semibold mt-1">
                        {Math.round(caloriePercentage)}% <span className="text-xs text-muted-foreground">of daily</span>
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
                  className="relative h-auto mb-8"
                >
                  <div className="grid grid-cols-1 gap-6">
                    {/* Bar Chart for Macronutrients */}
                    <div className="bg-muted/30 rounded-lg overflow-hidden backdrop-blur-sm border border-border/30 p-4">
                      <h3 className="text-sm font-medium mb-4 flex items-center">
                        <Activity className="h-4 w-4 mr-2 text-primary/70" />
                        Macronutrient Breakdown
                      </h3>
                      
                      <div className="h-60 relative">
                        <Bar
                          data={{
                            labels: ['Protein', 'Fat', 'Carbs'],
                            datasets: [
                              {
                                label: 'Current Meal (g)',
                                data: [proteinEstimate, fatEstimate, carbEstimate],
                                backgroundColor: [
                                  'rgba(59, 130, 246, 0.7)', // Blue for protein
                                  'rgba(234, 179, 8, 0.7)',  // Yellow for fat
                                  'rgba(16, 185, 129, 0.7)'  // Green for carbs
                                ],
                                borderColor: [
                                  'rgb(59, 130, 246)',
                                  'rgb(234, 179, 8)',
                                  'rgb(16, 185, 129)'
                                ],
                                borderWidth: 1,
                                borderRadius: 6,
                                hoverBackgroundColor: [
                                  'rgba(59, 130, 246, 0.9)',
                                  'rgba(234, 179, 8, 0.9)',
                                  'rgba(16, 185, 129, 0.9)'
                                ],
                              },
                              {
                                label: 'Daily Goal (g)',
                                data: [
                                  goals && goals.protein > 0 ? goals.protein : 50,
                                  goals && goals.fat > 0 ? goals.fat : 30,
                                  goals && goals.carbs > 0 ? goals.carbs : 150
                                ],
                                backgroundColor: [
                                  'rgba(59, 130, 246, 0.2)',
                                  'rgba(234, 179, 8, 0.2)',
                                  'rgba(16, 185, 129, 0.2)'
                                ],
                                borderColor: [
                                  'rgba(59, 130, 246, 0.6)',
                                  'rgba(234, 179, 8, 0.6)',
                                  'rgba(16, 185, 129, 0.6)'
                                ],
                                borderWidth: 1,
                                borderRadius: 6,
                              }
                            ],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            indexAxis: 'y',
                            plugins: {
                              legend: {
                                position: 'top',
                                labels: {
                                  boxWidth: 12,
                                  usePointStyle: true,
                                  pointStyle: 'rectRounded',
                                },
                              },
                              tooltip: {
                                backgroundColor: 'rgba(17, 24, 39, 0.8)',
                                titleColor: '#fff',
                                bodyColor: '#fff',
                                borderColor: 'rgba(255, 255, 255, 0.1)',
                                borderWidth: 1,
                                padding: 12,
                                displayColors: true,
                                boxPadding: 6,
                                usePointStyle: true,
                              },
                            },
                            scales: {
                              y: {
                                grid: {
                                  display: false,
                                },
                                ticks: {
                                  font: {
                                    size: 12,
                                    weight: 500,
                                  },
                                },
                              },
                              x: {
                                beginAtZero: true,
                                grid: {
                                  color: 'rgba(107, 114, 128, 0.1)',
                                },
                                ticks: {
                                  font: {
                                    size: 11,
                                  },
                                },
                              },
                            },
                            animation: {
                              duration: 1000,
                              easing: 'easeOutQuart',
                            },
                          }}
                        />
                      </div>
                      
                      <div className="text-xs text-muted-foreground mt-4 pt-3 border-t border-border/30">
                        <div className="flex justify-between items-center">
                          <span>Showing comparison to daily goals</span>
                          <span>Hover for detailed values</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Daily nutritional summary */}
                    <div className="bg-muted/30 rounded-lg overflow-hidden backdrop-blur-sm border border-border/30 p-4">
                      <h3 className="text-sm font-medium mb-3 flex items-center">
                        <Flame className="h-4 w-4 mr-2 text-red-500/70" />
                        Calories Summary
                      </h3>
                      
                      <div className="mt-2 grid gap-4">
                        <div className="flex items-center justify-between">
        <div>
                            <p className="text-sm font-medium">Current Meal</p>
                            <p className="text-xs text-muted-foreground">Estimated calories</p>
                          </div>
                          <div className="bg-red-500/10 px-3 py-1.5 rounded-lg">
                            <span className="text-lg font-semibold text-red-500">{calorieEstimate}</span>
                            <span className="text-xs text-muted-foreground ml-1">kcal</span>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-background/50 rounded-lg border border-border/30">
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-muted-foreground">Progress to daily goal</span>
                            <span className="font-medium">
                              {calorieEstimate} / {goals && goals.calories > 0 ? goals.calories : 2000} kcal
                            </span>
                          </div>
                          <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-red-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ 
                                width: `${Math.min(100, ((calorieEstimate) / (goals && goals.calories > 0 ? goals.calories : 2000)) * 100)}%` 
                              }}
                              transition={{ duration: 1, delay: 0.2 }}
                            />
                          </div>
                          <div className="mt-2 text-xs text-right text-muted-foreground">
                            {Math.round((calorieEstimate / (goals && goals.calories > 0 ? goals.calories : 2000)) * 100)}% of daily goal
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="mt-4 rounded-lg bg-background/70 backdrop-blur-sm border border-border/30 shadow-sm overflow-hidden"
              whileHover={{ scale: 1.005 }}
            >
              <div className="flex items-center justify-between p-3 border-b border-border/20 bg-muted/30">
                <div className="flex items-center">
                  <Utensils className="h-4 w-4 text-primary/70 mr-2" />
                  <h4 className="font-medium text-sm">Identified Dish(es)</h4>
                </div>
                {result.ingredients && result.ingredients.length > 0 && (
                  <Badge variant="outline" className="text-xs px-2 py-0 h-5 bg-primary/5 text-primary">
                    {result.ingredients.length} item{result.ingredients.length !== 1 ? 's' : ''}
                  </Badge>
                )}
          </div>
              
          {result.ingredients && result.ingredients.length > 0 ? (
                <div className="p-3">
                  <div className="flex flex-wrap gap-1.5">
              {result.ingredients.map((ingredient, index) => (
                      <Badge 
                        key={index}
                        variant="outline" 
                        className="bg-background/80 text-xs px-2 py-0.5 h-6 transition-colors hover:bg-primary/5"
                      >
                        {index < 3 && (
                          <span className="mr-1 opacity-70">
                            {index === 0 ? (
                              <Utensils className="h-3 w-3 inline-block" />
                            ) : index === 1 ? (
                              <Flame className="h-3 w-3 inline-block" />
                            ) : (
                              <Drumstick className="h-3 w-3 inline-block" />
                            )}
                          </span>
                        )}
                  {ingredient}
                </Badge>
              ))}
                  </div>
                  
                  <div className="mt-2 flex justify-end items-center text-xs text-muted-foreground">
                    <Info className="h-3 w-3 mr-1 inline-block" /> 
                    <span>AI-powered recognition</span>
                  </div>
            </div>
          ) : (
                <div className="p-4 flex items-center justify-center text-xs text-muted-foreground">
                  <Orbit className="h-3.5 w-3.5 mr-1.5" />
                  <span>No specific dish identified</span>
                </div>
              )}
            </motion.div>
          </CardContent>

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
