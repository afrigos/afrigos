import React from 'react';
import { cn } from '@/lib/utils';

interface GradientBackgroundProps {
  variant?: 'hero' | 'warm' | 'gradient' | 'subtle';
  className?: string;
  children: React.ReactNode;
}

export function GradientBackground({ 
  variant = 'hero', 
  className, 
  children 
}: GradientBackgroundProps) {
  const variantClasses = {
    hero: 'bg-afrigos-hero',
    warm: 'bg-afrigos-warm', 
    gradient: 'bg-afrigos-gradient',
    subtle: 'bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100'
  };

  return (
    <div className={cn(variantClasses[variant], className)}>
      {children}
    </div>
  );
}

// Specialized components for common use cases
export function HeroSection({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <GradientBackground 
      variant="hero" 
      className={cn("py-16 px-6 text-white", className)}
    >
      {children}
    </GradientBackground>
  );
}

export function CardGradient({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <GradientBackground 
      variant="gradient" 
      className={cn("rounded-lg p-6 text-white shadow-lg", className)}
    >
      {children}
    </GradientBackground>
  );
}

export function SubtleGradient({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <GradientBackground 
      variant="subtle" 
      className={cn("rounded-lg p-6", className)}
    >
      {children}
    </GradientBackground>
  );
}

