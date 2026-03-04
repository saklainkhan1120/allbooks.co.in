'use client';

import { useState } from 'react';

interface ReadMoreProps {
  text: string;
  maxLines?: number;
  className?: string;
}

export const ReadMore = ({ text, maxLines = 4, className = '' }: ReadMoreProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!text) return null;
  
  // Clean the text and split into sentences
  const cleanText = text.trim();
  const sentences = cleanText.split(/(?<=[.!?])\s+/);
  
  // Calculate approximate words for 4-5 lines (about 80-100 words)
  const wordsPerLine = 20;
  const targetWords = maxLines * wordsPerLine;
  
  // Count words in the text
  const totalWords = cleanText.split(/\s+/).length;
  
  // If text is short enough, show it all
  if (totalWords <= targetWords) {
    return (
      <div className={`text-black leading-relaxed ${className}`}>
        {cleanText.split(/\r?\n\r?\n|\n\n|\r\r/).map((para, idx) => (
          <p key={idx} className="mb-2 whitespace-pre-line">{para.trim()}</p>
        ))}
      </div>
    );
  }
  
  // Find a good breaking point (end of a sentence)
  let truncatedText = "";
  let currentWords = 0;
  
  for (const sentence of sentences) {
    const sentenceWords = sentence.split(/\s+/).length;
    if (currentWords + sentenceWords <= targetWords) {
      truncatedText += sentence + " ";
      currentWords += sentenceWords;
    } else {
      break;
    }
  }
  
  // Remove trailing space and add ellipsis
  truncatedText = truncatedText.trim() + "...";
  
  return (
    <div className={className}>
      <div className="text-black leading-relaxed">
        {isExpanded ? (
          // Show full text with proper paragraph formatting
          cleanText.split(/\r?\n\r?\n|\n\n|\r\r/).map((para, idx) => (
            <p key={idx} className="mb-2 whitespace-pre-line">{para.trim()}</p>
          ))
        ) : (
          // Show truncated text
          <p className={`line-clamp-${maxLines}`}>
            {truncatedText}
          </p>
        )}
      </div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-0 h-auto text-blue-600 hover:text-blue-700 mt-2 underline cursor-pointer"
      >
        {isExpanded ? 'Read Less' : 'Read More'}
      </button>
    </div>
  );
}; 