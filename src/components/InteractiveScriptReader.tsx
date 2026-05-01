// Interactive Script Reader - Displays script in an interactive, readable way
// Users can click through sections, see highlights, and track their progress

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckCircle, 
  ArrowRight, 
  BookOpen, 
  MessageSquare,
  Target,
  Lightbulb
} from '@phosphor-icons/react';
import type { ScriptNode } from '@/lib/types';
import { scholarixScript, getScriptForStage } from '@/lib/scholarixScript';
import { cn } from '@/lib/utils';

interface InteractiveScriptReaderProps {
  company: 'eiger-marvel-hr' | 'sgc-tech-ai';
  personaType: string;
  currentStage?: string;
  onSectionRead?: (sectionId: string) => void;
  onAllRead?: () => void;
}

export default function InteractiveScriptReader({
  company,
  personaType,
  currentStage = 'opening',
  onSectionRead,
  onAllRead,
}: InteractiveScriptReaderProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [readSections, setReadSections] = useState<Set<number>>(new Set([0]));
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Get script sections for this company/persona
  const scriptSections = getScriptForStage(company, personaType, currentStage);
  
  const totalSections = scriptSections.length;
  const progress = Math.round((readSections.size / totalSections) * 100);

  const markAsRead = useCallback((index: number) => {
    setReadSections(prev => {
      const next = new Set(prev);
      next.add(index);
      // Also mark all previous as read
      for (let i = 0; i <= index; i++) {
        next.add(i);
      }
      return next;
    });
    onSectionRead?.(scriptSections[index]?.id);
    
    // Check if all read
    if (readSections.size + 1 >= totalSections) {
      onAllRead?.();
    }
  }, [readSections, totalSections, onSectionRead, onAllRead, scriptSections]);

  const goToSection = (index: number) => {
    setCurrentSection(index);
    markAsRead(index);
  };

  const goNext = () => {
    if (currentSection < totalSections - 1) {
      goToSection(currentSection + 1);
    }
  };

  const goPrev = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const currentNode = scriptSections[currentSection];

  // Render script text with interactive highlights
  const renderScriptWithHighlights = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    
    return lines.map((line, lineIndex) => {
      const isHighlighted = highlightedLine === lineIndex;
      const isUserLine = line.startsWith('You:') || line.startsWith('Sales Rep:');
      const isProspectLine = line.startsWith('Prospect:') || line.startsWith('Buyer:');
      
      return (
        <div 
          key={lineIndex}
          className={cn(
            'p-2 rounded-md transition-all duration-200 cursor-pointer',
            isHighlighted && 'bg-yellow-100 border-l-4 border-yellow-500',
            isUserLine && 'bg-blue-50 border-l-4 border-blue-400',
            isProspectLine && 'bg-green-50 border-l-4 border-green-400',
            !isHighlighted && !isUserLine && !isProspectLine && 'hover:bg-gray-50'
          )}
          onClick={() => setHighlightedLine(highlightedLine === lineIndex ? null : lineIndex)}
        >
          <p className={cn(
            'text-sm leading-relaxed',
            isUserLine && 'text-blue-800 font-medium',
            isProspectLine && 'text-green-800 font-medium',
          )}>
            {line}
          </p>
        </div>
      );
    });
  };

  return (
    <div className={cn(
      'flex flex-col h-full',
      isFullscreen && 'fixed inset-0 z-50 bg-white p-6'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Interactive Script Reader</h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {readSections.size}/{totalSections} sections read
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Reading Progress</span>
          <span className="text-gray-600">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Section Navigation - Sidebar */}
        <Card className="w-64 p-4 overflow-auto hidden md:block">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Script Sections
          </h4>
          <div className="space-y-2">
            {scriptSections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => goToSection(index)}
                className={cn(
                  'w-full text-left p-2 rounded-md text-sm transition-colors',
                  currentSection === index && 'bg-blue-100 text-blue-700 font-medium',
                  readSections.has(index) && 'text-gray-500',
                  !readSections.has(index) && currentSection !== index && 'text-gray-800 hover:bg-gray-100'
                )}
              >
                <div className="flex items-center gap-2">
                  {readSections.has(index) ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <MessageSquare className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="truncate">{section.title || `Section ${index + 1}`}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1 ml-6">
                  {section.phase}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Main Content Area */}
        <Card className="flex-1 p-6 overflow-auto">
          {currentNode && (
            <div>
              {/* Section Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge>{currentNode.phase}</Badge>
                    {readSections.has(currentSection) && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Read
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold">{currentNode.title || `Section ${currentSection + 1}`}</h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAsRead(currentSection)}
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Mark as Read
                </Button>
              </div>

              {/* Script Content */}
              <ScrollArea className="h-[400px] rounded-lg border p-4 bg-gray-50">
                <div className="space-y-2">
                  {renderScriptWithHighlights(currentNode.text)}
                </div>
              </ScrollArea>

              {/* Key Points */}
              {currentNode.keyPoints && currentNode.keyPoints.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-blue-600" />
                    Key Points to Remember
                  </h4>
                  <ul className="space-y-1">
                    {currentNode.keyPoints.map((point, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={goPrev}
                  disabled={currentSection === 0}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-500 self-center">
                  {currentSection + 1} of {totalSections}
                </span>
                <Button
                  onClick={goNext}
                  disabled={currentSection === totalSections - 1}
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
