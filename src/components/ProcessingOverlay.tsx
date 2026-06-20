import React, { useState, useEffect } from 'react';

interface Props {
  message?: string;
  isVisible: boolean;
  overrideColor?: string;
}

const ProcessingOverlay: React.FC<Props> = ({ message = "Analyzing reconnaissance objective...", isVisible, overrideColor }) => {
  const [displayColor, setDisplayColor] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isVisible && overrideColor) {
      // Start with current theme color (undefined uses global CSS var), then shift to target
      const timer = setTimeout(() => setDisplayColor(overrideColor), 20);
      return () => clearTimeout(timer);
    } else if (!isVisible) {
      setDisplayColor(undefined);
    }
  }, [isVisible, overrideColor]);

  if (!isVisible) return null;

  const style = displayColor ? { '--accent-primary': displayColor } as React.CSSProperties : {};

  return (
    <div className="proc-overlay" style={style}>
      <div className="proc-spinner-container">
        <div className="proc-arc proc-arc-1"></div>
        <div className="proc-arc proc-arc-2"></div>
        <div className="proc-arc proc-arc-3"></div>
      </div>

      <div className="proc-progress-container">
        <div className="proc-progress-bar"></div>
      </div>

      <div className="proc-text">{message}</div>
    </div>
  );
};

export default ProcessingOverlay;
