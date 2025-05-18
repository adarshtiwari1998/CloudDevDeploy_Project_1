import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  HelpCircle,
  Lightbulb,
  Zap,
  Settings,
  Layers,
  Code,
  Github,
  UserPlus,
  Terminal,
  FileCode,
} from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { toast } from '@/hooks/use-toast';

// Tour step interface
interface TourStep {
  id: string;
  title: string;
  description: string;
  element: string; // CSS selector for element to highlight
  position: 'top' | 'right' | 'bottom' | 'left' | 'center';
  icon?: React.ReactNode;
  action?: () => void;
  showSkip?: boolean;
}

interface OnboardingTourProps {
  onComplete?: () => void;
  onSkip?: () => void;
  initialStep?: number;
  autoStart?: boolean;
}

/**
 * Interactive Onboarding Tour Component
 * 
 * This component provides a guided tour of the application with
 * animated tooltips that highlight key features.
 */
export default function OnboardingTour({
  onComplete,
  onSkip,
  initialStep = 0,
  autoStart = false,
}: OnboardingTourProps) {
  const [isVisible, setIsVisible] = useState(autoStart);
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [elementRect, setElementRect] = useState<DOMRect | null>(null);
  const [hasSeenTour, setHasSeenTour] = useState(false);

  // Tour steps
  const tourSteps: TourStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to CloudIDE',
      description: 'This quick tour will help you discover the powerful features available in our AI-powered cloud development environment.',
      element: 'body',
      position: 'center',
      icon: <Zap className="h-8 w-8 text-primary" />,
      showSkip: true,
    },
    {
      id: 'editor',
      title: 'Code Editor',
      description: 'Write and edit your code with our powerful Monaco-based editor featuring intelligent code completion and syntax highlighting.',
      element: '.editor-container',
      position: 'right',
      icon: <Code className="h-5 w-5 text-blue-500" />,
      showSkip: true,
    },
    {
      id: 'file-explorer',
      title: 'File Explorer',
      description: 'Browse, create, and manage your project files and folders with ease.',
      element: '.file-explorer',
      position: 'right',
      icon: <FileCode className="h-5 w-5 text-orange-500" />,
      showSkip: true,
    },
    {
      id: 'terminal',
      title: 'Integrated Terminal',
      description: 'Run commands directly within the IDE using our built-in terminal.',
      element: '.terminal-container',
      position: 'top',
      icon: <Terminal className="h-5 w-5 text-green-500" />,
      showSkip: true,
    },
    {
      id: 'ai-assistant',
      title: 'AI Coding Assistant',
      description: 'Get intelligent code suggestions, explanations, and debugging help powered by advanced AI models.',
      element: '.ai-assistant-button',
      position: 'left',
      icon: <Lightbulb className="h-5 w-5 text-yellow-500" />,
      showSkip: true,
    },
    {
      id: 'git-integration',
      title: 'Git Integration',
      description: 'Manage your repositories with visual commit history, branches, and seamless version control.',
      element: '.git-button',
      position: 'bottom',
      icon: <Github className="h-5 w-5 text-purple-500" />,
      showSkip: true,
    },
    {
      id: 'collaboration',
      title: 'Real-Time Collaboration',
      description: 'Work together with your team in real-time with shared editing, cursor tracking, and integrated chat.',
      element: '.collaboration-button',
      position: 'bottom',
      icon: <UserPlus className="h-5 w-5 text-indigo-500" />,
      showSkip: true,
    },
    {
      id: 'azure-integration',
      title: 'Azure DevOps Integration',
      description: 'Deploy your applications and manage CI/CD pipelines directly from the IDE.',
      element: '.azure-button',
      position: 'left',
      icon: <Layers className="h-5 w-5 text-blue-600" />,
      showSkip: true,
    },
    {
      id: 'settings',
      title: 'Customize Your Experience',
      description: 'Adjust the IDE settings to match your preferences, including themes, editor settings, and more.',
      element: '.settings-button',
      position: 'left',
      icon: <Settings className="h-5 w-5 text-gray-500" />,
      showSkip: true,
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      description: 'You\'ve completed the tour and are ready to start coding. You can always access this tour again via the help menu.',
      element: 'body',
      position: 'center',
      icon: <Check className="h-8 w-8 text-green-500" />,
      showSkip: false,
    },
  ];

  const currentTourStep = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  // Check local storage on mount
  useEffect(() => {
    const tourSeen = localStorage.getItem('onboarding-tour-completed');
    if (tourSeen) {
      setHasSeenTour(true);
    }
    
    // Check if we should auto-start the tour
    if (autoStart && !tourSeen) {
      startTour();
    }
  }, [autoStart]);

  // Update element position whenever the step changes
  useEffect(() => {
    if (isVisible && currentTourStep) {
      updateElementPosition();
      
      // Add resize listener to update position on window resize
      window.addEventListener('resize', updateElementPosition);
      
      // Return cleanup function
      return () => {
        window.removeEventListener('resize', updateElementPosition);
      };
    }
  }, [isVisible, currentStep, currentTourStep]);

  // Update position of the highlighted element
  const updateElementPosition = () => {
    if (currentTourStep.element === 'body' || currentTourStep.position === 'center') {
      setElementRect(null);
      return;
    }
    
    try {
      const element = document.querySelector(currentTourStep.element);
      if (element) {
        const rect = element.getBoundingClientRect();
        setElementRect(rect);
        
        // Scroll element into view if needed
        if (!isElementInViewport(rect)) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      } else {
        console.warn(`Element not found: ${currentTourStep.element}`);
        setElementRect(null);
      }
    } catch (error) {
      console.error('Error updating element position:', error);
      setElementRect(null);
    }
  };

  // Check if element is in viewport
  const isElementInViewport = (rect: DOMRect) => {
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
  };

  // Start the tour
  const startTour = () => {
    setIsVisible(true);
    setCurrentStep(0);
  };

  // Next step
  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  // Previous step
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Skip tour
  const skipTour = () => {
    setIsVisible(false);
    
    if (onSkip) {
      onSkip();
    }
    
    toast({
      title: "Tour skipped",
      description: "You can restart the tour anytime from the help menu.",
    });
  };

  // Complete tour
  const completeTour = () => {
    setIsVisible(false);
    setHasSeenTour(true);
    localStorage.setItem('onboarding-tour-completed', 'true');
    
    if (onComplete) {
      onComplete();
    }
    
    toast({
      title: "Tour completed",
      description: "You're all set to use the CloudIDE platform!",
    });
  };

  // Get tooltip position based on element position
  const getTooltipPosition = () => {
    if (!elementRect || currentTourStep.position === 'center') {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const padding = 15; // Space between element and tooltip

    switch (currentTourStep.position) {
      case 'top':
        return {
          top: `${elementRect.top - padding}px`,
          left: `${elementRect.left + elementRect.width / 2}px`,
          transform: 'translate(-50%, -100%)',
        };
      case 'right':
        return {
          top: `${elementRect.top + elementRect.height / 2}px`,
          left: `${elementRect.right + padding}px`,
          transform: 'translateY(-50%)',
        };
      case 'bottom':
        return {
          top: `${elementRect.bottom + padding}px`,
          left: `${elementRect.left + elementRect.width / 2}px`,
          transform: 'translateX(-50%)',
        };
      case 'left':
        return {
          top: `${elementRect.top + elementRect.height / 2}px`,
          left: `${elementRect.left - padding}px`,
          transform: 'translate(-100%, -50%)',
        };
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }
  };

  // Render highlight around element
  const renderHighlight = () => {
    if (!elementRect || currentTourStep.position === 'center') {
      return null;
    }

    const padding = 5; // Padding around the highlighted element

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute z-40 border-2 border-primary rounded-md pointer-events-none"
        style={{
          top: elementRect.top - padding + window.scrollY,
          left: elementRect.left - padding,
          width: elementRect.width + padding * 2,
          height: elementRect.height + padding * 2,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
        }}
      />
    );
  };

  // Render tooltip connector (arrow)
  const renderConnector = () => {
    if (!elementRect || currentTourStep.position === 'center') {
      return null;
    }

    const connectorStyle = {
      position: 'absolute',
      width: '10px',
      height: '10px',
      backgroundColor: 'hsl(var(--primary))',
      transform: 'rotate(45deg)',
    };

    switch (currentTourStep.position) {
      case 'top':
        return (
          <div
            style={{
              ...connectorStyle,
              bottom: '-5px',
              left: '50%',
              marginLeft: '-5px',
            } as React.CSSProperties}
          />
        );
      case 'right':
        return (
          <div
            style={{
              ...connectorStyle,
              left: '-5px',
              top: '50%',
              marginTop: '-5px',
            } as React.CSSProperties}
          />
        );
      case 'bottom':
        return (
          <div
            style={{
              ...connectorStyle,
              top: '-5px',
              left: '50%',
              marginLeft: '-5px',
            } as React.CSSProperties}
          />
        );
      case 'left':
        return (
          <div
            style={{
              ...connectorStyle,
              right: '-5px',
              top: '50%',
              marginTop: '-5px',
            } as React.CSSProperties}
          />
        );
      default:
        return null;
    }
  };

  if (!isVisible) {
    return (
      <Button
        className="fixed right-4 bottom-4 z-50 rounded-full h-10 w-10 p-0"
        onClick={startTour}
        variant="outline"
        title="Start Onboarding Tour"
      >
        <HelpCircle className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-30 bg-black/50 pointer-events-auto"
            onClick={currentTourStep.position === 'center' ? undefined : skipTour}
          />

          {/* Highlight */}
          {renderHighlight()}

          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed z-50 bg-background border rounded-lg shadow-lg max-w-md"
            style={{
              ...getTooltipPosition(),
              width: currentTourStep.position === 'center' ? '450px' : '350px',
            }}
          >
            {/* Connector */}
            {renderConnector()}

            <div className="p-4">
              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Step {currentStep + 1} of {tourSteps.length}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-1" />
              </div>

              {/* Icon and Title */}
              <div className="flex items-center gap-3 mb-2">
                {currentTourStep.icon}
                <div>
                  <h3 className="font-semibold text-lg">{currentTourStep.title}</h3>
                  {currentStep < tourSteps.length - 1 && (
                    <Badge variant="outline" className="text-xs">
                      Step {currentStep + 1}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-4">
                {currentTourStep.description}
              </p>

              {/* Actions */}
              <div className="flex justify-between">
                <div>
                  {currentStep > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevStep}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                  )}
                </div>

                <div className="flex gap-2">
                  {currentTourStep.showSkip && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={skipTour}
                    >
                      Skip
                    </Button>
                  )}

                  <Button
                    variant="default"
                    size="sm"
                    onClick={nextStep}
                  >
                    {currentStep < tourSteps.length - 1 ? (
                      <>
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </>
                    ) : (
                      <>
                        Finish
                        <Check className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}