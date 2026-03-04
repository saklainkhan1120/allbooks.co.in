'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface BookPreviewProps {
  text: string;
  className?: string;
}

function renderParagraphs(text: string) {
  return text
    .split(/\r?\n\r?\n|\n\n|\r\r/) // split on double newlines (paragraphs)
    .map((para, idx) => (
      <p key={idx} className="mb-2 whitespace-pre-line">{para.trim()}</p>
    ));
}

export const BookPreview = ({ text, className = '' }: BookPreviewProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!text) return null;
  
  // Split text into words to estimate if truncation is needed
  const words = text.split(' ');
  const shouldTruncate = words.length > 100; // Roughly 4-5 lines worth of words
  
  if (!shouldTruncate) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-6 shadow-sm ${className}`}>
        <div className="bg-white rounded-md p-4 shadow-inner min-h-[200px]">
          {renderParagraphs(text)}
        </div>
      </div>
    );
  }
  
  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 shadow-sm ${className}`}>
      <div className="bg-white rounded-md p-4 shadow-inner min-h-[200px]">
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${!isExpanded ? 'max-h-[200px]' : 'max-h-[400px]'}`}>
          <div className={`${isExpanded ? 'overflow-y-auto max-h-[350px]' : ''}`}>
            {renderParagraphs(text)}
          </div>
        </div>
        
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setIsExpanded(false)}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 border-gray-300 hover:border-gray-400"
            >
              <ChevronUp className="h-4 w-4" />
              Show Less
            </Button>
          </div>
        )}
        
        {!isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setIsExpanded(true)}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 border-gray-300 hover:border-gray-400"
            >
              <ChevronDown className="h-4 w-4" />
              Read More
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}; 