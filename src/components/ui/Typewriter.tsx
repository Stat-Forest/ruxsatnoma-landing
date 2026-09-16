import React, { useState, useEffect } from 'react';

interface TypewriterProps {
  text: string;
  delay?: number;
  className?: string;
  start?: boolean;
}

export const Typewriter: React.FC<TypewriterProps> = ({ text, delay = 50, className = '', start = true }) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Reset if text changes
    setCurrentText('');
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (start && currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText(prevText => prevText + text[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, delay);
  
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text, start]);

  return (
    <span className={className}>
      {currentText}
      {currentIndex < text.length && <span className="animate-pulse border-r-2 border-current ml-0.5"></span>}
    </span>
  );
};
