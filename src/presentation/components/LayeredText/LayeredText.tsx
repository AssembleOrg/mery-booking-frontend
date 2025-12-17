'use client';

import { useState, useEffect } from 'react';

interface LayeredTextProps {
  text: React.ReactNode;
  size?: number;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  mobileLeft?: string;
  mobileTop?: string;
}

export function LayeredText({
  text,
  size = 120,
  top,
  bottom,
  left,
  right,
  mobileLeft,
  mobileTop,
}: LayeredTextProps) {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const checkScreen = () => {
      const width = window.innerWidth;
      if (width < 768) setScreenSize('mobile');
      else if (width < 1200) setScreenSize('tablet');
      else setScreenSize('desktop');
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  // Responsive sizing: mobile 40%, tablet 55%, desktop 100%
  const sizeMultiplier = screenSize === 'mobile' ? 0.4 : screenSize === 'tablet' ? 0.55 : 1;
  const responsiveSize = size * sizeMultiplier;

  // Position: tablet and mobile use mobile positioning pattern
  const responsiveLeft = screenSize !== 'desktop' ? (mobileLeft || '5%') : left;
  const responsiveTop = screenSize !== 'desktop' ? (mobileTop || '15%') : top;

  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    fontSize: `${responsiveSize}px`,
    fontWeight: 800,
    letterSpacing: '-0.03em',
    lineHeight: 0.85,
    whiteSpace: 'nowrap',
    fontFamily: 'var(--font-avant-garde), system-ui, sans-serif',
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: responsiveTop,
        bottom,
        left: responsiveLeft,
        right,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {/* Layer 3 - más atrás */}
      <div
        style={{
          ...baseStyle,
          color: '#EBA2A8',
          opacity: 0.08,
          transform: 'translate(0, 0)',
        }}
      >
        {text}
      </div>

      {/* Layer 2 */}
      <div
        style={{
          ...baseStyle,
          color: '#EBA2A8',
          opacity: 0.15,
          transform: `translate(${responsiveSize * 0.12}px, ${responsiveSize * 0.08}px)`,
        }}
      >
        {text}
      </div>

      {/* Layer 1 - outline (más adelante) */}
      <div
        style={{
          ...baseStyle,
          color: 'transparent',
          WebkitTextStroke: '1px #F7CBCB',
          transform: `translate(${responsiveSize * 0.24}px, ${responsiveSize * 0.16}px)`,
        }}
      >
        {text}
      </div>
    </div>
  );
}
