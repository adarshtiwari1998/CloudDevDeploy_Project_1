import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Play, Pause, RotateCcw, FastForward, FileCog, Zap, Scale, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

// Remove 'success' enum from type since it's not available in the Badge component

interface AnimatedCodeGenerationProps {
  code: string;
  language: string;
  onComplete?: () => void;
  className?: string;
  speed?: number; // Characters per frame
  initialSpeed?: number;
  autoPlay?: boolean;
}

export function AnimatedCodeGeneration({
  code,
  language,
  onComplete,
  className,
  initialSpeed = 5,
  autoPlay = true,
}: AnimatedCodeGenerationProps) {
  const [displayedCode, setDisplayedCode] = useState('');
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(initialSpeed);
  const [animationMode, setAnimationMode] = useState<'typing' | 'chunk' | 'pulse'>('typing');
  const [typingSound, setTypingSound] = useState(false);
  const [highlight, setHighlight] = useState<number | null>(null);
  const codeRef = useRef<HTMLPreElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  
  // Reset the animation when code changes
  useEffect(() => {
    setDisplayedCode('');
    setProgress(0);
    setIsComplete(false);
    if (autoPlay) {
      setIsPlaying(true);
    }
  }, [code, autoPlay]);
  
  // Animation logic
  useEffect(() => {
    if (!code) return;
    
    // Character-by-character animation
    const animateCode = (timestamp: number) => {
      if (!lastTimestampRef.current) {
        lastTimestampRef.current = timestamp;
      }
      
      const elapsed = timestamp - lastTimestampRef.current;
      const updateInterval = animationMode === 'pulse' ? 150 : (1000 / (speed * 5));
      
      // Only update at a certain rate based on speed and animation mode
      if (elapsed > updateInterval) {
        lastTimestampRef.current = timestamp;
        
        if (displayedCode.length < code.length) {
          let charsToAdd = 1;
          
          // Different animation modes
          switch (animationMode) {
            case 'typing':
              // Character by character with variable speed
              charsToAdd = Math.min(Math.ceil(speed / 5), code.length - displayedCode.length);
              break;
            case 'chunk':
              // Add chunks of code at once (like blocks or lines)
              const nextNewline = code.indexOf('\n', displayedCode.length);
              if (nextNewline !== -1 && nextNewline < displayedCode.length + 50) {
                charsToAdd = nextNewline - displayedCode.length + 1;
              } else {
                charsToAdd = Math.min(Math.ceil(speed * 3), code.length - displayedCode.length);
              }
              break;
            case 'pulse':
              // Pulse mode adds larger chunks with pauses
              charsToAdd = Math.min(Math.ceil(speed * 10), code.length - displayedCode.length);
              
              // Randomly highlight code
              if (Math.random() > 0.7) {
                setHighlight(displayedCode.length);
                setTimeout(() => setHighlight(null), 500);
              }
              break;
          }
          
          const newDisplayedCode = code.substring(0, displayedCode.length + charsToAdd);
          setDisplayedCode(newDisplayedCode);
          
          const newProgress = (newDisplayedCode.length / code.length) * 100;
          setProgress(newProgress);
          
          // Play typing sound if enabled
          if (typingSound && charsToAdd > 0) {
            // If we were to implement actual sound, this is where we'd play it
            // For now it's just a placeholder for the feature
          }
          
          // Scroll to keep the latest code in view
          if (codeRef.current) {
            codeRef.current.scrollTop = codeRef.current.scrollHeight;
          }
        } else if (!isComplete) {
          setIsComplete(true);
          setIsPlaying(false);
          if (onComplete) onComplete();
        }
      }
      
      if (isPlaying && displayedCode.length < code.length) {
        animationRef.current = requestAnimationFrame(animateCode);
      }
    };
    
    if (isPlaying && !isComplete) {
      lastTimestampRef.current = null;
      animationRef.current = requestAnimationFrame(animateCode);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [code, displayedCode, isPlaying, isComplete, speed, onComplete]);
  
  // Play/pause controls
  const togglePlayPause = () => {
    if (isComplete) {
      // If complete, restart animation
      setDisplayedCode('');
      setProgress(0);
      setIsComplete(false);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };
  
  // Reset animation
  const resetAnimation = () => {
    setDisplayedCode('');
    setProgress(0);
    setIsComplete(false);
    setIsPlaying(true);
  };
  
  // Skip to end
  const skipToEnd = () => {
    setDisplayedCode(code);
    setProgress(100);
    setIsComplete(true);
    setIsPlaying(false);
    if (onComplete) onComplete();
  };
  
  // Syntax highlighting
  // A simple implementation - in a real app, you might use a library like Prism or highlight.js
  const getLanguageClass = (lang: string) => {
    const supportedLanguages = {
      javascript: 'language-javascript',
      typescript: 'language-typescript',
      python: 'language-python',
      html: 'language-html',
      css: 'language-css',
      java: 'language-java',
      csharp: 'language-csharp',
    };
    
    return supportedLanguages[lang as keyof typeof supportedLanguages] || '';
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="px-4 py-3 bg-muted">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <div className="flex items-center">
              <FileCog className="h-4 w-4 mr-2 text-primary" />
              <span>Code Generation</span>
              <Badge className="ml-2" variant={isComplete ? "secondary" : "default"}>
                {isComplete ? 'Complete' : 'In Progress'}
              </Badge>
            </div>
          </CardTitle>
          
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <Button 
                size="sm" 
                variant={animationMode === 'typing' ? 'default' : 'outline'} 
                className="h-7 px-2 text-xs"
                onClick={() => setAnimationMode('typing')}
                title="Typing Mode - Character by character"
              >
                <Zap className="h-3 w-3 mr-1" />
                Typing
              </Button>
              <Button 
                size="sm" 
                variant={animationMode === 'chunk' ? 'default' : 'outline'} 
                className="h-7 px-2 text-xs"
                onClick={() => setAnimationMode('chunk')}
                title="Chunk Mode - Line by line"
              >
                <Scale className="h-3 w-3 mr-1" />
                Chunk
              </Button>
              <Button 
                size="sm" 
                variant={animationMode === 'pulse' ? 'default' : 'outline'} 
                className="h-7 px-2 text-xs"
                onClick={() => setAnimationMode('pulse')}
                title="Pulse Mode - With visual effects"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Pulse
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <div className="text-xs font-normal flex items-center gap-2">
            <span className="text-muted-foreground">Speed:</span>
            <Slider
              value={[speed]}
              min={1}
              max={30}
              step={1}
              className="w-24"
              onValueChange={(value) => setSpeed(value[0])}
            />
            <span className="text-xs w-5 text-muted-foreground">{speed}x</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="relative">
          {/* Progress Bar */}
          <div 
            className="absolute top-0 left-0 h-1 bg-primary transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
          
          {/* Loading indicator when no code is displayed yet */}
          {displayedCode.length === 0 && isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          
          {/* Code display area */}
          <pre
            ref={codeRef}
            className={cn(
              "p-4 overflow-auto text-sm font-mono max-h-[400px] min-h-[200px] bg-gray-900 text-gray-100 relative",
              getLanguageClass(language)
            )}
          >
            <code>
              {displayedCode || ' '}
              {highlight !== null && animationMode === 'pulse' && (
                <span className="absolute inline-block bg-primary/30 animate-pulse" 
                  style={{
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                  }}
                />
              )}
            </code>
          </pre>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between px-4 py-3 bg-muted">
        <div className="flex items-center text-xs text-muted-foreground">
          {Math.round(progress)}% complete
          <div className="w-20 h-1 bg-gray-200 rounded-full ml-2">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={togglePlayPause}
          >
            {isPlaying ? (
              <><Pause className="h-4 w-4 mr-1" /> Pause</>
            ) : (
              <><Play className="h-4 w-4 mr-1" /> {isComplete ? 'Replay' : 'Play'}</>
            )}
          </Button>
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={resetAnimation}
          >
            <RotateCcw className="h-4 w-4 mr-1" /> Reset
          </Button>
          
          {!isComplete && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={skipToEnd}
              title="Skip to the end"
            >
              <FastForward className="h-4 w-4 mr-1" /> Skip
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}