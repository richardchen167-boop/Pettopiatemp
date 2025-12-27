import { useState, useEffect } from 'react';

export function AnimatedSleigh() {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [velocity, setVelocity] = useState({ x: 2, y: 1.5 });
  const [direction, setDirection] = useState<'right' | 'left'>('right');

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition((prev) => {
        let newX = prev.x + velocity.x;
        let newY = prev.y + velocity.y;
        let newVelX = velocity.x;
        let newVelY = velocity.y;
        let newDir = direction;

        const sleighWidth = 200;
        const sleighHeight = 40;
        const maxX = window.innerWidth - sleighWidth;
        const maxY = window.innerHeight - sleighHeight;

        if (newX <= 0 || newX >= maxX) {
          newVelX = -newVelX;
          newX = Math.max(0, Math.min(maxX, newX));
          newDir = newVelX > 0 ? 'right' : 'left';
        }

        if (newY <= 0 || newY >= maxY) {
          newVelY = -newVelY;
          newY = Math.max(0, Math.min(maxY, newY));
        }

        if (newVelX !== velocity.x || newVelY !== velocity.y) {
          setVelocity({ x: newVelX, y: newVelY });
        }

        if (newDir !== direction) {
          setDirection(newDir);
        }

        return { x: newX, y: newY };
      });
    }, 16);

    return () => clearInterval(interval);
  }, [velocity, direction]);

  return (
    <div
      className="fixed pointer-events-none z-10 transition-transform duration-100"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
      }}
    >
      <div className="text-2xl flex items-center gap-0">
        <span>🦌</span>
        <span>🦌</span>
        <span>🦌</span>
        <span>🦌</span>
        <span>🛷</span>
      </div>
    </div>
  );
}
