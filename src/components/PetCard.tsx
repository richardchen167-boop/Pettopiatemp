import { useState, useEffect } from 'react';
import { Heart, Droplets, Battery, UtensilsCrossed, Trash2, Wine, ShoppingBag, Star, Coins, MapPin, Clock, Package, X } from 'lucide-react';
import type { Pet } from '../lib/supabase';
import { PET_EVENTS } from '../lib/supabase';
import { getUserSessionTime, formatTimeSpent } from '../hooks/useTimeTracking';

interface PetCardProps {
  pet: Pet;
  onFeed: () => void;
  onPlay: () => void;
  onClean: () => void;
  onGiveWater: () => void;
  onPlayWithToy: () => void;
  onOpenShop: () => void;
  onOpenActivities: () => void;
  onDelete: () => void;
  onDeactivate: () => void;
  onUnequipAccessory?: (type: 'hat' | 'toy' | 'eyewear') => void;
}

const petEmojis = {
  cat: '🐱',
  dog: '🐶',
  fox: '🦊',
  bird: '🐦',
  rabbit: '🐰',
  bear: '🐻',
  panda: '🐼',
  koala: '🐨',
  hamster: '🐹',
  mouse: '🐭',
  pig: '🐷',
  frog: '🐸',
  monkey: '🐵',
  lion: '🦁',
  tiger: '🐯',
  cow: '🐮',
  turkey: '🦃',
  dragon: '🐉',
  shark: '🦈',
  seal: '🦭',
  crocodile: '🐊',
  flamingo: '🦩',
  duck: '🦆',
  turtle: '🐢',
  butterfly: '🦋',
  elephant: '🐘',
  giraffe: '🦒',
  dinosaur: '🦕',
  crab: '🦀',
  lobster: '🦞',
  shrimp: '🦐',
  squid: '🦑',
  octopus: '🐙',
  pufferfish: '🐡',
  eagle: '🦅',
  owl: '🦉',
  bat: '🦇',
  bee: '🐝',
  unicorn: '🦄',
  boar: '🐗',
  dolphin: '🐬',
  whale: '🐳',
  leopard: '🐆',
  swan: '🦢',
  parrot: '🦜',
  badger: '🦡',
  rat: '🐀',
  squirrel: '🐿️',
  hedgehog: '🦔',
  rhino: '🦏',
  waterbuffalo: '🐃',
  kangaroo: '🦘',
  camel: '🐫',
  dromedary: '🐪',
  ox: '🐂',
  horse: '🐎',
  ram: '🐏',
  deer: '🦌',
  goat: '🐐',
  sheep: '🐑'
} as const;

export function PetCard({ pet, onFeed, onPlay, onClean, onGiveWater, onPlayWithToy, onOpenShop, onOpenActivities, onDelete, onDeactivate, onUnequipAccessory }: PetCardProps) {
  const [ownerTimeSeconds, setOwnerTimeSeconds] = useState(0);

  useEffect(() => {
    const loadOwnerTime = async () => {
      const time = await getUserSessionTime(pet.user_id);
      setOwnerTimeSeconds(time);
    };

    loadOwnerTime();
    const interval = setInterval(() => {
      setOwnerTimeSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [pet.user_id]);

  const getStatColor = (value: number) => {
    if (value >= 70) return 'bg-green-500';
    if (value >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatTextColor = (value: number) => {
    if (value >= 70) return 'text-green-600';
    if (value >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const currentEvent = pet.current_event ? PET_EVENTS[pet.current_event as keyof typeof PET_EVENTS] : null;
  const xpNeeded = Math.floor(100 * Math.pow(1.5, pet.level - 1));
  const xpProgress = (pet.xp / xpNeeded) * 100;

  const getDragonGradient = () => {
    if (pet.type !== 'dragon') return '';

    const gradients = [
      'bg-gradient-to-br from-purple-600 via-red-600 to-orange-600',
      'bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-600',
      'bg-gradient-to-br from-emerald-600 via-green-500 to-lime-600',
      'bg-gradient-to-br from-pink-600 via-rose-500 to-red-600',
      'bg-gradient-to-br from-amber-600 via-yellow-500 to-orange-600',
      'bg-gradient-to-br from-indigo-600 via-blue-500 to-sky-600',
      'bg-gradient-to-br from-fuchsia-600 via-purple-500 to-pink-600',
      'bg-gradient-to-br from-slate-700 via-gray-600 to-zinc-700',
    ];

    const index = pet.id.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all hover:scale-105" data-pet-id={pet.id}>
      <div className={`p-6 text-center relative ${
        pet.type === 'dragon' ? getDragonGradient() :
        currentEvent ? 'bg-gradient-to-br from-red-500 to-orange-500' : 'bg-gradient-to-br from-blue-500 to-cyan-500'
      }`}>
        <div className="absolute top-3 left-3 flex gap-2">
          <div className="flex items-center gap-1 bg-yellow-500 text-white px-2 py-1 rounded-lg text-sm font-bold">
            <Star size={10} className="animate-bounce" />
            <Star size={10} className="animate-bounce" style={{ animationDelay: '0.15s' }} />
            {pet.level}
          </div>
          <div className="flex items-center gap-1 bg-yellow-600 text-white px-2 py-1 rounded-lg text-sm font-bold">
            <Coins size={14} />
            {pet.coins}
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          {pet.accessories.toy && !pet.is_sleeping && (
            <div className="relative animate-bounce" style={{ animationDuration: '1.2s' }}>
              <div className="text-5xl">
                {pet.accessories.toy}
              </div>
              {onUnequipAccessory && (
                <button
                  onClick={() => onUnequipAccessory('toy')}
                  className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 transition-colors"
                  title="Unequip toy"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          )}
          {pet.is_sleeping && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
              <div className="text-6xl animate-pulse">😴</div>
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-3xl animate-bounce" style={{ animationDelay: '0.1s' }}>💤</div>
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 ml-6 text-2xl animate-bounce" style={{ animationDelay: '0.3s' }}>💤</div>
            </div>
          )}
          <div className="relative inline-block animate-bounce">
            <div className="text-8xl mb-2">{pet.breed || petEmojis[pet.type as keyof typeof petEmojis]}</div>
            {pet.type !== 'bird' && (
              <>
                {pet.accessories.hat && (
                  <>
                    <div className={`absolute -top-2 left-1/2 transform -translate-x-1/2 ${pet.accessories.hat === '🧢' ? 'text-7xl' : 'text-4xl'}`}>
                      {pet.accessories.hat}
                    </div>
                    {onUnequipAccessory && (
                      <button
                        onClick={() => onUnequipAccessory('hat')}
                        className="absolute -top-3 left-1/2 transform -translate-x-1/2 translate-x-8 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 transition-colors z-10"
                        title="Unequip hat"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </>
                )}
                {pet.accessories.eyewear && (
                  <>
                    {pet.accessories.eyewear === '💗' ? (
                      <>
                        <div className="absolute top-10 left-[38%] transform -translate-x-1/2 text-2xl animate-bounce">
                          ❤️
                        </div>
                        <div className="absolute top-[42px] left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-pink-400 animate-bounce"></div>
                        <div className="absolute top-10 left-[62%] transform -translate-x-1/2 text-2xl animate-bounce">
                          ❤️
                        </div>
                      </>
                    ) : pet.accessories.eyewear === '🧐' ? (
                      <div className={`absolute ${pet.type === 'hamster' ? 'top-[38px]' : pet.type === 'dog' ? 'top-[40px]' : 'top-[45px]'} left-[61%] transform -translate-x-1/2 text-5xl`}>
                        ○
                      </div>
                    ) : pet.type === 'dog' ? (
                      <>
                        <div className="absolute top-8 left-[38%] transform -translate-x-1/2 text-2xl animate-bounce">
                          ⭐
                        </div>
                        <div className="absolute top-[38px] left-1/2 transform -translate-x-1/2 w-[16%] h-1 bg-yellow-400 animate-bounce"></div>
                        <div className="absolute top-8 left-[62%] transform -translate-x-1/2 text-2xl animate-bounce">
                          ⭐
                        </div>
                      </>
                    ) : pet.accessories.eyewear === '⭐' && pet.type !== 'frog' ? (
                      <>
                        <div className="absolute top-12 left-[38%] transform -translate-x-1/2 text-xl animate-bounce">
                          ⭐
                        </div>
                        <div className="absolute top-[54px] left-1/2 transform -translate-x-1/2 w-[16%] h-1 bg-yellow-400 animate-bounce"></div>
                        <div className="absolute top-12 left-[62%] transform -translate-x-1/2 text-xl animate-bounce">
                          ⭐
                        </div>
                      </>
                    ) : (
                      <div className={`absolute ${pet.type === 'hamster' ? 'top-[38px]' : 'top-[45px]'} left-1/2 transform -translate-x-1/2 text-3xl`}>
                        {pet.accessories.eyewear}
                      </div>
                    )}
                    {onUnequipAccessory && (
                      <button
                        onClick={() => onUnequipAccessory('eyewear')}
                        className="absolute top-8 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 transition-colors z-10"
                        title="Unequip eyewear"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-1">
          {pet.name}
          {pet.type === 'dragon' && <span className="ml-2 text-yellow-300">✨</span>}
        </h2>
        <p className="text-blue-100 text-sm capitalize">
          {pet.type === 'dragon' ? '🐉 LEGENDARY DRAGON' : `${pet.type} • ${pet.age} days old`}
        </p>
        {pet.owner_name && <p className="text-white/80 text-xs mt-1">Nickname: {pet.owner_name}</p>}
        {pet.type === 'dragon' && (
          <p className="text-yellow-200 text-xs mt-1 font-semibold animate-pulse">
            ⚡ Grants +50 XP to all pets every 5 minutes ⚡
          </p>
        )}
        <div className="flex items-center justify-center gap-1 text-white/70 text-xs mt-1">
          <Clock size={12} />
          <span>{formatTimeSpent(ownerTimeSeconds)} on site</span>
        </div>

        <div className="mt-3 bg-white/20 rounded-full h-2 overflow-hidden">
          <div
            className="bg-white h-full transition-all duration-500"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
        <p className="text-xs text-white/80 mt-1">{pet.xp}/{xpNeeded} XP</p>

        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={onDeactivate}
            className="p-2 bg-blue-500/20 hover:bg-blue-500/40 rounded-lg transition-colors"
            title="Store in inventory"
          >
            <Package size={18} className="text-white" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg transition-colors"
            title="Release pet"
          >
            <Trash2 size={18} className="text-white" />
          </button>
        </div>
      </div>

      {currentEvent && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex items-start gap-3">
            <span className="text-3xl">{currentEvent.emoji}</span>
            <div className="flex-1">
              <h3 className="font-bold text-red-800 text-lg">{currentEvent.title}</h3>
              <p className="text-red-700 text-sm mb-2">{currentEvent.description}</p>
              <p className="text-red-600 text-xs italic">💡 {currentEvent.resolution}</p>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 space-y-4">
        <div className="space-y-3">
          <StatBar
            icon={<UtensilsCrossed size={18} />}
            label="Hunger"
            value={pet.hunger}
            color={getStatColor(pet.hunger)}
            textColor={getStatTextColor(pet.hunger)}
          />
          <StatBar
            icon={<Heart size={18} />}
            label="Happiness"
            value={pet.happiness}
            color={getStatColor(pet.happiness)}
            textColor={getStatTextColor(pet.happiness)}
          />
          <StatBar
            icon={<Droplets size={18} />}
            label="Clean"
            value={pet.cleanliness}
            color={getStatColor(pet.cleanliness)}
            textColor={getStatTextColor(pet.cleanliness)}
          />
          <StatBar
            icon={<Battery size={18} />}
            label="Energy"
            value={pet.energy}
            color={getStatColor(pet.energy)}
            textColor={getStatTextColor(pet.energy)}
          />
          <StatBar
            icon={<Wine size={18} />}
            label="Thirst"
            value={pet.thirst}
            color={getStatColor(pet.thirst)}
            textColor={getStatTextColor(pet.thirst)}
          />
        </div>

        <div className="space-y-2 pt-4">
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={onFeed}
              disabled={pet.is_sleeping}
              className={`py-3 rounded-xl font-semibold transition-colors shadow-md text-sm ${
                pet.is_sleeping
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
            >
              Feed
            </button>
            <button
              onClick={onGiveWater}
              disabled={pet.is_sleeping}
              className={`py-3 rounded-xl font-semibold transition-colors shadow-md text-sm ${
                pet.is_sleeping
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Water
            </button>
            <button
              onClick={onPlay}
              disabled={pet.is_sleeping}
              className={`py-3 rounded-xl font-semibold transition-colors shadow-md text-sm ${
                pet.is_sleeping
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-pink-500 hover:bg-pink-600 text-white'
              }`}
            >
              Play
            </button>
            <button
              onClick={onClean}
              disabled={pet.is_sleeping}
              className={`py-3 rounded-xl font-semibold transition-colors shadow-md text-sm ${
                pet.is_sleeping
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-cyan-500 hover:bg-cyan-600 text-white'
              }`}
            >
              Clean
            </button>
          </div>
          {pet.accessories.toy && (
            <button
              onClick={onPlayWithToy}
              disabled={pet.toy_play_count >= 5 && pet.accessories.toy !== '😴'}
              className={`w-full py-3 rounded-xl font-semibold transition-colors shadow-md ${
                (pet.toy_play_count >= 5 && pet.accessories.toy !== '😴')
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white'
              }`}
            >
              {pet.accessories.toy === '😴'
                ? (pet.is_sleeping ? '💤 Sleeping...' : '😴 Use Sleep Mask')
                : `🎾 Play with Toy (${5 - pet.toy_play_count} left today)`
              }
            </button>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onOpenActivities}
              disabled={pet.is_sleeping}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-colors shadow-md ${
                pet.is_sleeping
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white'
              }`}
            >
              <MapPin size={18} />
              Activities
            </button>
            <button
              onClick={onOpenShop}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-xl font-semibold transition-colors shadow-md"
            >
              <ShoppingBag size={18} />
              Shop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBar({ icon, label, value, color, textColor }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  textColor: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className={textColor}>{icon}</span>
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <span className={`text-sm font-bold ${textColor}`}>{value}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={`${color} h-2.5 rounded-full transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
