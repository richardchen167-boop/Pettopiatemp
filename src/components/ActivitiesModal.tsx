import { X, Clock, Star, Coins } from 'lucide-react';
import { ACTIVITIES, type Pet, type ActivityType } from '../lib/supabase';

interface ActivitiesModalProps {
  pet: Pet;
  onClose: () => void;
  onStartActivity: (activityType: ActivityType) => void;
}

export function ActivitiesModal({ pet, onClose, onStartActivity }: ActivitiesModalProps) {
  const getTimeRemaining = (lastActivityTime: string, cooldownMs: number): number => {
    const lastTime = new Date(lastActivityTime).getTime();
    const now = Date.now();
    const timePassed = now - lastTime;
    return Math.max(0, cooldownMs - timePassed);
  };

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const activities = Object.values(ACTIVITIES);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Activities</h2>
            <p className="text-emerald-100">Special places for {pet.name}!</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
              <Coins size={20} />
              <span className="font-bold text-xl">{pet.coins}</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {activities.map((activity) => {
            const cooldownKey = `last_${activity.type}` as keyof Pet;
            const lastTime = pet[cooldownKey] as string;
            const timeRemaining = getTimeRemaining(lastTime, activity.cooldown);
            const isAvailable = timeRemaining === 0;
            const canAfford = pet.coins >= activity.cost;
            const canStart = isAvailable && (activity.cost === 0 || canAfford);

            return (
              <div
                key={activity.type}
                className={`p-6 rounded-xl border-2 transition-all ${
                  canStart
                    ? 'border-emerald-300 bg-emerald-50 hover:shadow-lg'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-5xl">{activity.emoji}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {activity.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{activity.description}</p>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock size={16} className="text-gray-500" />
                        <span className="text-gray-700">{activity.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Coins size={16} className={activity.cost === 0 ? 'text-green-600' : 'text-yellow-600'} />
                        <span className={activity.cost === 0 ? 'text-green-600 font-bold' : 'text-gray-700'}>
                          {activity.cost === 0 ? 'FREE' : `${activity.cost} coins`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-4 text-xs">
                      <div className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-lg font-semibold">
                        <Star size={14} />
                        +{activity.xpReward} XP
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-lg font-semibold">
                        <Coins size={14} />
                        +{activity.coinReward}
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Effects:</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(activity.effects).map(([stat, value]) => (
                          <span
                            key={stat}
                            className={`text-xs px-2 py-1 rounded ${
                              value > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {stat}: {value > 0 ? '+' : ''}{value}
                          </span>
                        ))}
                      </div>
                    </div>

                    {!isAvailable ? (
                      <div className="bg-orange-100 text-orange-700 px-3 py-2 rounded-lg text-sm font-semibold text-center">
                        <Clock size={14} className="inline mr-1" />
                        Cooldown: {formatTime(timeRemaining)}
                      </div>
                    ) : !canAfford && activity.cost > 0 ? (
                      <button
                        disabled
                        className="w-full bg-gray-300 text-gray-500 py-3 rounded-lg font-semibold cursor-not-allowed"
                      >
                        Not Enough Coins
                      </button>
                    ) : (
                      <button
                        onClick={() => onStartActivity(activity.type)}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                      >
                        Start Activity
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
