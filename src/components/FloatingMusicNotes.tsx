import { useEffect, useState } from 'react';

interface Note {
  id: number;
  left: number;
  delay: number;
  duration: number;
  emoji: string;
}

export function FloatingMusicNotes() {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const animalEmojis = ['🐾', '🐕', '🐈', '🐇', '🐹', '🦎', '🐢', '🐠', '🐦', '🦜', '🐉', '🦊', '🐿️', '🦔', '🧋', '🧋', '🧋'];
    const newNotes: Note[] = [];

    for (let i = 0; i < 15; i++) {
      newNotes.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 10,
        duration: 8 + Math.random() * 6,
        emoji: animalEmojis[Math.floor(Math.random() * animalEmojis.length)]
      });
    }

    setNotes(newNotes);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {notes.map((note) => (
        <div
          key={note.id}
          className="absolute animate-float-up opacity-30"
          style={{
            left: `${note.left}%`,
            bottom: '-50px',
            animationDelay: `${note.delay}s`,
            animationDuration: `${note.duration}s`,
            fontSize: '2rem'
          }}
        >
          {note.emoji}
        </div>
      ))}
      <style>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-float-up {
          animation: float-up linear infinite;
        }
      `}</style>
    </div>
  );
}
