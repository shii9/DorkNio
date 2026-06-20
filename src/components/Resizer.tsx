import React, { useRef, useEffect } from 'react';

interface Props {
  onResize: (deltaX: number) => void;
  orientation?: 'vertical' | 'horizontal';
}

export default function Resizer({ onResize, orientation = 'vertical' }: Props) {
  const isResizing = useRef(false);
  const lastPos = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const currentPos = orientation === 'vertical' ? e.clientX : e.clientY;
      const delta = currentPos - lastPos.current;
      onResize(delta);
      lastPos.current = currentPos;
    };

    const handleMouseUp = () => {
      if (isResizing.current) {
        isResizing.current = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onResize, orientation]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isResizing.current = true;
    lastPos.current = orientation === 'vertical' ? e.clientX : e.clientY;
    document.body.style.cursor = orientation === 'vertical' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none'; // Prevent text selection while dragging
  };

  return (
    <div
      className={`resizer ${orientation}`}
      onMouseDown={handleMouseDown}
      title="Drag to resize"
    />
  );
}
