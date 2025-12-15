import { useEffect, useState } from 'react';

interface Snowflake {
  id: number;
  left: number;
  animationDuration: number;
  size: number;
  delay: number;
}

interface Light {
  id: number;
  color: string;
  delay: number;
}

export function ChristmasDecorations() {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  useEffect(() => {
    const flakes: Snowflake[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 10 + Math.random() * 20,
      size: 10 + Math.random() * 20,
      delay: Math.random() * 10
    }));
    setSnowflakes(flakes);
  }, []);

  const lights: Light[] = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    color: ['#FF0000', '#00FF00', '#FFD700', '#0000FF', '#FF69B4'][i % 5],
    delay: i * 0.2
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-around">
        {lights.map((light) => (
          <div
            key={light.id}
            className="w-3 h-5 rounded-full animate-pulse"
            style={{
              backgroundColor: light.color,
              boxShadow: `0 0 10px ${light.color}`,
              animationDelay: `${light.delay}s`
            }}
          />
        ))}
      </div>

      <div className="absolute top-4 left-8 text-6xl animate-bounce" style={{ animationDelay: '0s' }}>
        🎄
      </div>
      <div className="absolute top-4 right-8 text-6xl animate-bounce" style={{ animationDelay: '0.5s' }}>
        🎄
      </div>
      <div className="absolute top-32 left-16 text-4xl animate-spin-slow">
        ❄️
      </div>
      <div className="absolute top-32 right-16 text-4xl animate-spin-slow" style={{ animationDelay: '1s' }}>
        ❄️
      </div>
      <div className="absolute bottom-32 left-24 text-5xl animate-bounce" style={{ animationDelay: '0.8s' }}>
        🎅
      </div>
      <div className="absolute bottom-32 right-24 text-5xl animate-bounce" style={{ animationDelay: '0.3s' }}>
        ⛄
      </div>
      <div className="absolute top-1/3 left-12 text-3xl animate-pulse">
        🎁
      </div>
      <div className="absolute top-1/3 right-12 text-3xl animate-pulse" style={{ animationDelay: '0.5s' }}>
        🎁
      </div>
      <div className="absolute top-2/3 left-32 text-3xl animate-bounce" style={{ animationDelay: '0.6s' }}>
        🦌
      </div>
      <div className="absolute bottom-16 right-32 text-4xl animate-pulse" style={{ animationDelay: '1s' }}>
        ⭐
      </div>
      <div className="absolute top-48 left-1/4 text-3xl animate-bounce" style={{ animationDelay: '0.4s' }}>
        🔔
      </div>
      <div className="absolute top-48 right-1/4 text-3xl animate-bounce" style={{ animationDelay: '0.7s' }}>
        🕯️
      </div>

      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute text-white opacity-80 animate-fall"
          style={{
            left: `${flake.left}%`,
            fontSize: `${flake.size}px`,
            animationDuration: `${flake.animationDuration}s`,
            animationDelay: `${flake.delay}s`
          }}
        >
          ❄
        </div>
      ))}

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/30 to-transparent pointer-events-none" />

      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-10vh) rotate(0deg);
          }
          100% {
            transform: translateY(110vh) rotate(360deg);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-fall {
          animation: fall linear infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
