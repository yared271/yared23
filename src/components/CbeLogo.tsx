import React, { useState } from 'react';
import { OFFICIAL_CBE_LOGO_DATA_URL } from '../assets/cbeOfficialLogoBase64';

interface CbeLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  customUrl?: string;
  isDarkBg?: boolean;
  onClick?: () => void;
}

export const CbeLogo: React.FC<CbeLogoProps> = ({
  className = '',
  size = 'md',
  customUrl,
  isDarkBg = false,
  onClick,
}) => {
  const [imgSrc, setImgSrc] = useState<string>(() => {
    return customUrl || OFFICIAL_CBE_LOGO_DATA_URL;
  });

  const sizeClass = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-24 h-24',
  }[size];

  return (
    <div
      onClick={onClick}
      className={`relative flex items-center justify-center shrink-0 select-none ${sizeClass} ${className} ${
        onClick ? 'cursor-pointer hover:scale-105 active:scale-95 transition-transform' : ''
      }`}
    >
      <img
        src={imgSrc}
        alt="Commercial Bank of Ethiopia Official Logo"
        className={`w-full h-full object-contain filter drop-shadow-xs ${isDarkBg ? 'brightness-105' : ''}`}
        style={{ backgroundColor: 'transparent' }}
        onError={() => {
          // If any custom URL fails, instantly fall back to the embedded official CBE logo data URI
          if (imgSrc !== OFFICIAL_CBE_LOGO_DATA_URL) {
            setImgSrc(OFFICIAL_CBE_LOGO_DATA_URL);
          }
        }}
      />
    </div>
  );
};
