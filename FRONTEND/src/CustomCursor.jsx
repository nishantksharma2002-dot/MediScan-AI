import React, { useEffect, useState, useRef } from 'react';

const CustomCursor = () => {
  const cursorRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const touchCheck = window.matchMedia('(pointer: coarse)').matches;
    setIsTouchDevice(touchCheck);
    if (touchCheck) return;

    const onMouseMove = (e) => {
      const { clientX, clientY } = e;
      if (cursorRef.current) {
        // Use translate3d for GPU acceleration
        cursorRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0) translate(-50%, -50%) scale(${isActive ? 1.5 : 1})`;
      }
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    const onMouseOver = (e) => {
      const target = e.target;
      if (!target) return;
      
      if (
        target.tagName?.toLowerCase() === 'button' ||
        target.tagName?.toLowerCase() === 'a' ||
        target.closest?.('.service-card') ||
        target.closest?.('.glass-panel') ||
        target.closest?.('[data-cursor-icon]')
      ) {
        setIsActive(true);
      }
    };

    const onMouseOut = () => setIsActive(false);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mouseover', onMouseOver);
    window.addEventListener('mouseout', onMouseOut);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mouseout', onMouseOut);
    };
  }, [isActive]);

  if (isTouchDevice) return null;

  return (
    <div 
      ref={cursorRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 10000,
        width: '12px',
        height: '12px',
        background: isActive ? 'var(--accent-blue)' : 'var(--accent-purple)',
        borderRadius: '50%',
        boxShadow: `0 0 20px ${isActive ? 'rgba(0, 229, 255, 1)' : 'rgba(192, 132, 252, 0.6)'}`,
        // REMOVED transform from transition to eliminate lag
        transition: 'width 0.2s, height 0.2s, background 0.3s, box-shadow 0.3s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid rgba(255, 255, 255, 0.1)',
        willChange: 'transform'
      }}
    >
      {isClicking && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '100%',
          height: '100%',
          background: 'var(--accent-cyan)',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'cursor-pulse 0.4s ease-out forwards'
        }} />
      )}
    </div>
  );
};

export default CustomCursor;
