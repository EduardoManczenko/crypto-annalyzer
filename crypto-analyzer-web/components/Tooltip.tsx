'use client';

import { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string | React.ReactNode;
  children: React.ReactNode;
  delay?: number;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({ content, children, delay = 200, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      let x = 0;
      let y = 0;

      switch (position) {
        case 'top':
          x = rect.left + rect.width / 2;
          y = rect.top;
          break;
        case 'bottom':
          x = rect.left + rect.width / 2;
          y = rect.bottom;
          break;
        case 'left':
          x = rect.left;
          y = rect.top + rect.height / 2;
          break;
        case 'right':
          x = rect.right;
          y = rect.top + rect.height / 2;
          break;
      }

      setCoords({ x, y });
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getPositionClass = () => {
    switch (position) {
      case 'top':
        return '-translate-y-full -translate-x-1/2 mb-2';
      case 'bottom':
        return 'translate-y-2 -translate-x-1/2';
      case 'left':
        return '-translate-x-full -translate-y-1/2 mr-2';
      case 'right':
        return 'translate-x-2 -translate-y-1/2';
    }
  };

  return (
    <div
      ref={containerRef}
      className="inline-block relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div
          className={`fixed z-[9999] pointer-events-none ${getPositionClass()}`}
          style={{
            left: `${coords.x}px`,
            top: `${coords.y}px`,
          }}
        >
          <div className="bg-slate-900 text-white text-sm px-3 py-2 rounded-lg shadow-xl border border-slate-700 max-w-xs whitespace-normal">
            {content}
          </div>
        </div>
      )}
    </div>
  );
}
