import React from 'react';

interface ChessPieceSvgProps {
  type: string; // 'p' | 'n' | 'b' | 'r' | 'q' | 'k'
  color: 'w' | 'b';
  className?: string;
}

export const ChessPieceSvg: React.FC<ChessPieceSvgProps> = ({ type, color, className = 'w-full h-full' }) => {
  const isWhite = color === 'w';
  const fill = isWhite ? '#ffffff' : '#232323';
  const stroke = isWhite ? '#202020' : '#111111';
  const highlight = isWhite ? '#f3f4f6' : '#3f3f46';

  // Standard tournament vector representations with crisp silhouettes and inner details
  switch (type.toLowerCase()) {
    case 'p':
      return (
        <svg viewBox="0 0 45 45" className={className} xmlns="http://www.w3.org/2000/svg">
          <g style={{ fill, fillOpacity: 1, fillRule: 'nonzero', stroke, strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'miter' }}>
            <path d="M 22.5,9 C 19.8,9 17.7,11.2 17.7,13.9 C 17.7,15.7 18.7,17.3 20.2,18.1 C 18.3,19.2 15.5,21.5 15.5,25 C 15.5,26.5 16.2,27.9 17.3,28.8 C 15,30 13,32.5 13,36 L 32,36 C 32,32.5 30,30 27.7,28.8 C 28.8,27.9 29.5,26.5 29.5,25 C 29.5,21.5 26.7,19.2 24.8,18.1 C 26.3,17.3 27.3,15.7 27.3,13.9 C 27.3,11.2 25.2,9 22.5,9 z" />
            {!isWhite && <path d="M 17,33 C 20,32 25,32 28,33" style={{ stroke: '#ffffff', strokeWidth: 1, fill: 'none' }} />}
            {isWhite && <path d="M 17,33 C 20,32 25,32 28,33" style={{ stroke: '#555555', strokeWidth: 1, fill: 'none' }} />}
          </g>
        </svg>
      );

    case 'n':
      return (
        <svg viewBox="0 0 45 45" className={className} xmlns="http://www.w3.org/2000/svg">
          <g style={{ fill, fillOpacity: 1, fillRule: 'evenodd', stroke, strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
            <path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" style={{ fill, stroke }} />
            <path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.95,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,7.4 17.5,7 18,8 C 18.2,9.8 19.5,10.5 22,10 z" style={{ fill, stroke }} />
            <circle cx="15" cy="14.5" r="1.5" style={{ fill: isWhite ? '#222222' : '#ffffff', stroke: 'none' }} />
            <path d="M 9.5 25.5 A 0.5 0.5 0 1 1 8.5,25.5 A 0.5 0.5 0 1 1 9.5 25.5 z" style={{ fill: isWhite ? '#222222' : '#ffffff', stroke: 'none' }} />
          </g>
        </svg>
      );

    case 'b':
      return (
        <svg viewBox="0 0 45 45" className={className} xmlns="http://www.w3.org/2000/svg">
          <g style={{ fill, fillOpacity: 1, fillRule: 'evenodd', stroke, strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
            <g style={{ fill, stroke, strokeWidth: 1.5 }}>
              <path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.646,38.99 6.677,38.97 6,38 C 7.354,36.54 9,36 9,36 z" />
              <path d="M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,30 30,30 C 30,27.5 27.5,26 27.5,26 C 33,24.5 33.5,14.5 22.5,10.5 C 11.5,14.5 12,24.5 17.5,26 C 17.5,26 15,27.5 15,30 C 15,30 14.5,30.5 15,32 z" />
              <path d="M 25 8 A 2.5 2.5 0 1 1 20,8 A 2.5 2.5 0 1 1 25 8 z" />
            </g>
            <path d="M 17.5,26 L 27.5,26 M 15,30 L 30,30 M 22.5,15.5 L 22.5,20.5 M 20,18 L 25,18" style={{ fill: 'none', stroke: isWhite ? '#222222' : '#ffffff', strokeLinejoin: 'miter' }} />
          </g>
        </svg>
      );

    case 'r':
      return (
        <svg viewBox="0 0 45 45" className={className} xmlns="http://www.w3.org/2000/svg">
          <g style={{ fill, fillOpacity: 1, fillRule: 'evenodd', stroke, strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
            <path d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z" />
            <path d="M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z" />
            <path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14" />
            <path d="M 12,32 L 14,14 L 31,14 L 33,32 L 12,32 z" />
            <path d="M 14,29.5 L 31,29.5" style={{ fill: 'none', stroke: isWhite ? '#666' : '#aaa', strokeWidth: 1 }} />
            <path d="M 14,16.5 L 31,16.5" style={{ fill: 'none', stroke: isWhite ? '#666' : '#aaa', strokeWidth: 1 }} />
          </g>
        </svg>
      );

    case 'q':
      return (
        <svg viewBox="0 0 45 45" className={className} xmlns="http://www.w3.org/2000/svg">
          <g style={{ fill, fillOpacity: 1, fillRule: 'evenodd', stroke, strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
            <path d="M 8 12 A 2 2 0 1 1 4,12 A 2 2 0 1 1 8 12 z" />
            <path d="M 24.5 7.5 A 2 2 0 1 1 20.5,7.5 A 2 2 0 1 1 24.5 7.5 z" />
            <path d="M 41 12 A 2 2 0 1 1 37,12 A 2 2 0 1 1 41 12 z" />
            <path d="M 16 8.5 A 2 2 0 1 1 12,8.5 A 2 2 0 1 1 16 8.5 z" />
            <path d="M 33 8.5 A 2 2 0 1 1 29,8.5 A 2 2 0 1 1 33 8.5 z" />
            <path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38,14 L 31,25 L 22.5,10 L 14,25 L 7,14 L 9,26 z" />
            <path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 10.5,36 10.5,36 C 9,37.5 11,38.5 11,38.5 L 34,38.5 C 34,38.5 36,37.5 34.5,36 C 34.5,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 L 9,26 z" />
            <circle cx="6" cy="12" r="1.5" style={{ fill: isWhite ? '#333' : '#fff', stroke: 'none' }} />
            <circle cx="22.5" cy="7.5" r="1.5" style={{ fill: isWhite ? '#333' : '#fff', stroke: 'none' }} />
            <circle cx="39" cy="12" r="1.5" style={{ fill: isWhite ? '#333' : '#fff', stroke: 'none' }} />
          </g>
        </svg>
      );

    case 'k':
      return (
        <svg viewBox="0 0 45 45" className={className} xmlns="http://www.w3.org/2000/svg">
          <g style={{ fill, fillOpacity: 1, fillRule: 'evenodd', stroke, strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
            <path d="M 22.5,11.63 L 22.5,6" style={{ fill: 'none', stroke, strokeLinejoin: 'miter' }} />
            <path d="M 20,8 L 25,8" style={{ fill: 'none', stroke, strokeLinejoin: 'miter' }} />
            <path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 24,11.5 21,11.5 20,14 C 19,11.5 16,11.5 14.5,14.5 C 13,17.5 17.5,25 17.5,25" />
            <path d="M 11.5,37 C 17,40.5 28,40.5 33.5,37 C 33.5,33.5 31,31.5 31,31.5 C 31,31.5 31.5,29.5 30.5,28 C 29.5,26.5 29,26 29,26 C 29,26 27.5,27.5 22.5,27.5 C 17.5,27.5 16,26 16,26 C 16,26 15.5,26.5 14.5,28 C 13.5,29.5 14,31.5 14,31.5 C 14,31.5 11.5,33.5 11.5,37 z" />
            <path d="M 11.5,30 C 17,27 28,27 33.5,30" style={{ fill: 'none', stroke: isWhite ? '#555' : '#bbb' }} />
          </g>
        </svg>
      );

    default:
      return null;
  }
};
