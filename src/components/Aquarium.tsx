import { useState, useEffect } from 'react';

interface Fish {
  id: number;
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  emoji: string;
  scale: number;
}

export function Aquarium() {
  const [fish, setFish] = useState<Fish[]>([]);

  useEffect(() => {
    const initialFish: Fish[] = [
      { id: 1, x: 20, y: 30, speedX: 0.5, speedY: 0.2, emoji: '🐠', scale: 1 },
      { id: 2, x: 60, y: 50, speedX: -0.4, speedY: 0.3, emoji: '🐟', scale: 0.9 },
      { id: 3, x: 40, y: 70, speedX: 0.6, speedY: -0.2, emoji: '🐡', scale: 0.8 },
      { id: 4, x: 80, y: 40, speedX: -0.3, speedY: 0.4, emoji: '🐠', scale: 0.7 },
      { id: 5, x: 15, y: 60, speedX: 0.4, speedY: -0.3, emoji: '🐟', scale: 0.85 },
      { id: 6, x: 50, y: 25, speedX: -0.5, speedY: 0.25, emoji: '🐡', scale: 0.95 },
      { id: 7, x: 30, y: 45, speedX: 0.45, speedY: -0.25, emoji: '🐠', scale: 0.75 },
      { id: 8, x: 70, y: 65, speedX: -0.35, speedY: 0.35, emoji: '🐟', scale: 0.9 }
    ];
    setFish(initialFish);

    const interval = setInterval(() => {
      setFish(prevFish =>
        prevFish.map(f => {
          let newX = f.x + f.speedX;
          let newY = f.y + f.speedY;
          let newSpeedX = f.speedX;
          let newSpeedY = f.speedY;

          if (newX <= 0 || newX >= 100) {
            newSpeedX = -newSpeedX;
            newX = Math.max(0, Math.min(100, newX));
          }

          if (newY <= 10 || newY >= 90) {
            newSpeedY = -newSpeedY;
            newY = Math.max(10, Math.min(90, newY));
          }

          return {
            ...f,
            x: newX,
            y: newY,
            speedX: newSpeedX,
            speedY: newSpeedY
          };
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-64 h-48 bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 rounded-lg border-8 border-gray-800 shadow-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 to-transparent"></div>

      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-amber-900 via-amber-700 to-transparent opacity-80"></div>

      <div className="absolute bottom-6 left-2 text-4xl">🪨</div>
      <div className="absolute bottom-8 right-2 text-3xl">🪨</div>
      <div className="absolute bottom-10 left-1/4 text-3xl">🪨</div>
      <div className="absolute bottom-7 right-1/4 text-4xl">🪨</div>
      <div className="absolute bottom-9 left-1/2 text-3xl">🪨</div>
      <div className="absolute bottom-5 left-[15%] text-4xl">🪨</div>
      <div className="absolute bottom-11 right-[15%] text-5xl">🪨</div>
      <div className="absolute bottom-4 left-[40%] text-3xl">🪨</div>
      <div className="absolute bottom-8 left-[60%] text-4xl">🪨</div>
      <div className="absolute bottom-12 left-[10%] text-4xl">🪨</div>
      <div className="absolute bottom-6 right-[40%] text-3xl">🪨</div>
      <div className="absolute bottom-2 left-1/3 text-3xl">🐚</div>
      <div className="absolute bottom-2 right-1/3 text-xl">🐚</div>

      <div className="absolute bottom-8 left-1/4 text-3xl animate-pulse">🌿</div>
      <div className="absolute bottom-8 right-1/4 text-3xl animate-pulse" style={{ animationDelay: '0.5s' }}>🌿</div>
      <div className="absolute bottom-6 left-[10%] text-2xl animate-pulse" style={{ animationDelay: '1s' }}>🌿</div>
      <div className="absolute bottom-7 right-[10%] text-4xl animate-pulse" style={{ animationDelay: '1.5s' }}>🌿</div>
      <div className="absolute bottom-5 left-[45%] text-xl animate-pulse" style={{ animationDelay: '0.8s' }}>🌿</div>
      <div className="absolute bottom-6 right-[30%] text-2xl animate-pulse" style={{ animationDelay: '1.2s' }}>🌿</div>

      <div className="absolute bottom-3 left-[8%] text-5xl">🪸</div>
      <div className="absolute bottom-5 left-[50%] text-6xl">🪸</div>
      <div className="absolute bottom-4 right-[20%] text-5xl">🪸</div>

      {fish.map((f) => (
        <div
          key={f.id}
          className="absolute transition-all duration-100 ease-linear"
          style={{
            left: `${f.x}%`,
            top: `${f.y}%`,
            transform: `translate(-50%, -50%) scaleX(${f.speedX > 0 ? -1 : 1}) scale(${f.scale})`,
            fontSize: '2rem'
          }}
        >
          {f.emoji}
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>

      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-white/40 to-transparent"></div>

      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 bg-white/10 animate-bubble"
          style={{
            left: `${20 + i * 15}%`,
            bottom: '10px',
            height: '4px',
            animationDelay: `${i * 0.8}s`,
            animationDuration: `${3 + i * 0.5}s`
          }}
        ></div>
      ))}

      <style>{`
        @keyframes bubble {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-60px) scale(1.2);
            opacity: 0.4;
          }
          100% {
            transform: translateY(-120px) scale(0.8);
            opacity: 0;
          }
        }
        .animate-bubble {
          animation: bubble 4s infinite ease-in;
        }
      `}</style>
    </div>
  );
}
