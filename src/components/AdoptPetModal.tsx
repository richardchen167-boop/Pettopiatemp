import { useState } from 'react';
import { X, Coins } from 'lucide-react';

type PetType = 'cat' | 'dog' | 'fox' | 'bird' | 'rabbit' | 'bear' | 'panda' | 'koala' | 'hamster' | 'mouse' | 'pig' | 'frog' | 'monkey' | 'lion' | 'tiger' | 'cow' | 'turkey' | 'dragon' | 'shark' | 'seal' | 'crocodile' | 'flamingo' | 'duck' | 'turtle' | 'butterfly' | 'elephant' | 'giraffe' | 'dinosaur' | 'crab' | 'lobster' | 'shrimp' | 'squid' | 'octopus' | 'pufferfish' | 'eagle' | 'owl' | 'bat' | 'bee' | 'unicorn' | 'boar' | 'dolphin' | 'whale' | 'leopard' | 'swan' | 'parrot' | 'badger' | 'rat' | 'squirrel' | 'hedgehog' | 'rhino' | 'waterbuffalo' | 'kangaroo' | 'camel' | 'dromedary' | 'ox' | 'horse' | 'ram' | 'deer' | 'goat' | 'sheep';

interface AdoptPetModalProps {
  onAdopt: (name: string, type: PetType, ownerName: string, breed?: string) => void;
  onClose: () => void;
  highestPetLevel: number;
  existingOwnerName?: string | null;
  totalCoins: number;
  isAdminMode?: boolean;
}

const petOptions = [
  { type: 'cat' as const, emoji: '🐱', name: 'Cat', description: 'Playful and independent', requiredLevel: 1 },
  { type: 'dog' as const, emoji: '🐶', name: 'Dog', description: 'Loyal and energetic', requiredLevel: 1 },
  { type: 'bird' as const, emoji: '🐦', name: 'Bird', description: 'Cheerful and social', requiredLevel: 5 },
  { type: 'hamster' as const, emoji: '🐹', name: 'Hamster', description: 'Tiny and energetic', requiredLevel: 5 },
  { type: 'rabbit' as const, emoji: '🐰', name: 'Rabbit', description: 'Gentle and fluffy', requiredLevel: 5 },
  { type: 'duck' as const, emoji: '🦆', name: 'Duck', description: 'Quacks and swims', requiredLevel: 8 },
  { type: 'butterfly' as const, emoji: '🦋', name: 'Butterfly', description: 'Graceful and colorful', requiredLevel: 8 },
  { type: 'bee' as const, emoji: '🐝', name: 'Bee', description: 'Busy and buzzing', requiredLevel: 8 },
  { type: 'mouse' as const, emoji: '🐭', name: 'Mouse', description: 'Quick and curious', requiredLevel: 10 },
  { type: 'pig' as const, emoji: '🐷', name: 'Pig', description: 'Smart and cheerful', requiredLevel: 10 },
  { type: 'frog' as const, emoji: '🐸', name: 'Frog', description: 'Hoppy and fun', requiredLevel: 10 },
  { type: 'rat' as const, emoji: '🐀', name: 'Rat', description: 'Clever and social', requiredLevel: 12 },
  { type: 'squirrel' as const, emoji: '🐿', name: 'Squirrel', description: 'Nutty and quick', requiredLevel: 12 },
  { type: 'hedgehog' as const, emoji: '🦔', name: 'Hedgehog', description: 'Spiky and adorable', requiredLevel: 12 },
  { type: 'fox' as const, emoji: '🦊', name: 'Fox', description: 'Clever and curious', requiredLevel: 15 },
  { type: 'bear' as const, emoji: '🐻', name: 'Bear', description: 'Strong and cuddly', requiredLevel: 15 },
  { type: 'turtle' as const, emoji: '🐢', name: 'Turtle', description: 'Slow and steady', requiredLevel: 15 },
  { type: 'owl' as const, emoji: '🦉', name: 'Owl', description: 'Wise and nocturnal', requiredLevel: 18 },
  { type: 'bat' as const, emoji: '🦇', name: 'Bat', description: 'Mysterious night flyer', requiredLevel: 18 },
  { type: 'parrot' as const, emoji: '🦜', name: 'Parrot', description: 'Colorful and talkative', requiredLevel: 18 },
  { type: 'panda' as const, emoji: '🐼', name: 'Panda', description: 'Adorable and calm', requiredLevel: 20 },
  { type: 'koala' as const, emoji: '🐨', name: 'Koala', description: 'Sleepy and sweet', requiredLevel: 20 },
  { type: 'badger' as const, emoji: '🦡', name: 'Badger', description: 'Bold and fearless', requiredLevel: 20 },
  { type: 'deer' as const, emoji: '🦌', name: 'Deer', description: 'Graceful and gentle', requiredLevel: 22 },
  { type: 'goat' as const, emoji: '🐐', name: 'Goat', description: 'Stubborn and playful', requiredLevel: 22 },
  { type: 'sheep' as const, emoji: '🐑', name: 'Sheep', description: 'Fluffy and peaceful', requiredLevel: 22 },
  { type: 'monkey' as const, emoji: '🐵', name: 'Monkey', description: 'Playful and clever', requiredLevel: 25 },
  { type: 'boar' as const, emoji: '🐗', name: 'Boar', description: 'Wild and tough', requiredLevel: 25 },
  { type: 'kangaroo' as const, emoji: '🦘', name: 'Kangaroo', description: 'Bouncy and strong', requiredLevel: 28 },
  { type: 'horse' as const, emoji: '🐎', name: 'Horse', description: 'Fast and majestic', requiredLevel: 28 },
  { type: 'lion' as const, emoji: '🦁', name: 'Lion', description: 'Brave and proud', requiredLevel: 30 },
  { type: 'tiger' as const, emoji: '🐯', name: 'Tiger', description: 'Bold and fierce', requiredLevel: 30 },
  { type: 'leopard' as const, emoji: '🐆', name: 'Leopard', description: 'Stealthy and fast', requiredLevel: 30 },
  { type: 'crocodile' as const, emoji: '🐊', name: 'Crocodile', description: 'Ancient predator', requiredLevel: 32 },
  { type: 'eagle' as const, emoji: '🦅', name: 'Eagle', description: 'Soaring and powerful', requiredLevel: 32 },
  { type: 'cow' as const, emoji: '🐮', name: 'Cow', description: 'Gentle and friendly', requiredLevel: 35 },
  { type: 'turkey' as const, emoji: '🦃', name: 'Turkey', description: 'Festive and proud', requiredLevel: 35 },
  { type: 'ox' as const, emoji: '🐂', name: 'Ox', description: 'Strong and hardworking', requiredLevel: 35 },
  { type: 'ram' as const, emoji: '🐏', name: 'Ram', description: 'Powerful and noble', requiredLevel: 35 },
  { type: 'camel' as const, emoji: '🐫', name: 'Camel', description: 'Desert wanderer', requiredLevel: 38 },
  { type: 'dromedary' as const, emoji: '🐪', name: 'Dromedary', description: 'One-humped traveler', requiredLevel: 38 },
  { type: 'flamingo' as const, emoji: '🦩', name: 'Flamingo', description: 'Pink and fabulous', requiredLevel: 40 },
  { type: 'shark' as const, emoji: '🦈', name: 'Shark', description: 'Fierce ocean predator', requiredLevel: 40 },
  { type: 'seal' as const, emoji: '🦭', name: 'Seal', description: 'Playful ocean friend', requiredLevel: 40 },
  { type: 'dolphin' as const, emoji: '🐬', name: 'Dolphin', description: 'Smart and friendly', requiredLevel: 40 },
  { type: 'swan' as const, emoji: '🦢', name: 'Swan', description: 'Elegant and graceful', requiredLevel: 42 },
  { type: 'pufferfish' as const, emoji: '🐡', name: 'Pufferfish', description: 'Spiky sea creature', requiredLevel: 45 },
  { type: 'octopus' as const, emoji: '🐙', name: 'Octopus', description: 'Eight-armed genius', requiredLevel: 45 },
  { type: 'squid' as const, emoji: '🦑', name: 'Squid', description: 'Deep sea dweller', requiredLevel: 45 },
  { type: 'crab' as const, emoji: '🦀', name: 'Crab', description: 'Sideways walker', requiredLevel: 48 },
  { type: 'lobster' as const, emoji: '🦞', name: 'Lobster', description: 'Clawed and fancy', requiredLevel: 48 },
  { type: 'shrimp' as const, emoji: '🦐', name: 'Shrimp', description: 'Small sea friend', requiredLevel: 48 },
  { type: 'elephant' as const, emoji: '🐘', name: 'Elephant', description: 'Wise and mighty', requiredLevel: 50 },
  { type: 'giraffe' as const, emoji: '🦒', name: 'Giraffe', description: 'Tall and spotted', requiredLevel: 50 },
  { type: 'rhino' as const, emoji: '🦏', name: 'Rhino', description: 'Armored and powerful', requiredLevel: 55 },
  { type: 'waterbuffalo' as const, emoji: '🐃', name: 'Water Buffalo', description: 'Strong and sturdy', requiredLevel: 55 },
  { type: 'whale' as const, emoji: '🐳', name: 'Whale', description: 'Gigantic and majestic', requiredLevel: 60 },
  { type: 'dinosaur' as const, emoji: '🦕', name: 'Dinosaur', description: 'Ancient and huge', requiredLevel: 70 },
  { type: 'unicorn' as const, emoji: '🦄', name: 'Unicorn', description: 'Magical and rare', requiredLevel: 80 },
  { type: 'dragon' as const, emoji: '🐉', name: 'Dragon', description: '✨ LEGENDARY! Grants +50 XP/5min to all pets', requiredLevel: 100 }
];

const calculatePetCost = (requiredLevel: number): number => {
  if (requiredLevel === 1) return 0;
  return requiredLevel * 100;
};

const breedOptions = {
  dog: [
    { emoji: '🐶', name: 'Dog' },
    { emoji: '🐩', name: 'Poodle' }
  ],
  cat: [
    { emoji: '🐱', name: 'Cat' },
    { emoji: '🐈‍⬛', name: 'Black Cat' }
  ]
};

export function AdoptPetModal({ onAdopt, onClose, highestPetLevel, existingOwnerName, totalCoins, isAdminMode = false }: AdoptPetModalProps) {
  const availablePets = isAdminMode ? petOptions : petOptions.filter(pet => pet.requiredLevel <= highestPetLevel);
  const initialType = availablePets[0]?.type || 'cat';
  const [selectedType, setSelectedType] = useState<PetType>(initialType);
  const [selectedBreed, setSelectedBreed] = useState<string>(
    (initialType === 'dog' || initialType === 'cat') ? breedOptions[initialType][0].emoji : ''
  );
  const [petName, setPetName] = useState('');
  const [ownerName, setOwnerName] = useState(existingOwnerName || '');

  const handleTypeChange = (type: PetType) => {
    setSelectedType(type);
    if (type === 'dog' || type === 'cat') {
      setSelectedBreed(breedOptions[type][0].emoji);
    } else {
      setSelectedBreed('');
    }
  };

  const selectedPet = petOptions.find(pet => pet.type === selectedType);
  const baseAdoptionCost = selectedPet ? calculatePetCost(selectedPet.requiredLevel) : 0;
  const adoptionCost = isAdminMode ? 0 : baseAdoptionCost;
  const canAfford = isAdminMode || totalCoins >= adoptionCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (petName.trim() && canAfford) {
      onAdopt(petName.trim(), selectedType, ownerName.trim() || '', selectedBreed || undefined);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Adopt a Pet</h2>
            <p className="text-blue-100 text-sm mt-1">Choose wisely - adoption costs coins!</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
              <Coins size={20} />
              <span className="font-bold text-xl">{totalCoins}</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Choose your pet type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
              {petOptions.map((pet) => {
                const isUnlocked = isAdminMode || pet.requiredLevel <= highestPetLevel;
                const cost = calculatePetCost(pet.requiredLevel);
                const affordable = totalCoins >= cost;
                return (
                  <button
                    key={pet.type}
                    type="button"
                    onClick={() => isUnlocked && handleTypeChange(pet.type)}
                    disabled={!isUnlocked}
                    className={`p-4 rounded-xl border-2 transition-all relative ${
                      !isUnlocked
                        ? 'border-gray-300 bg-gray-100 opacity-50 cursor-not-allowed'
                        : selectedType === pet.type
                        ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    {!isUnlocked && (
                      <div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        Lvl {pet.requiredLevel}
                      </div>
                    )}
                    <div className="text-5xl mb-2">{isUnlocked ? pet.emoji : '🔒'}</div>
                    <div className="text-sm font-bold text-gray-900">{pet.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{pet.description}</div>
                    {isUnlocked && (
                      <div className={`flex items-center justify-center gap-1 mt-2 text-xs font-bold ${isAdminMode || cost === 0 ? 'text-blue-600' : affordable ? 'text-green-600' : 'text-red-600'}`}>
                        {isAdminMode ? (
                          'FREE (ADMIN)'
                        ) : cost === 0 ? (
                          'FREE'
                        ) : (
                          <>
                            <Coins size={12} />
                            {cost}
                          </>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {(selectedType === 'dog' || selectedType === 'cat') && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Choose a breed
              </label>
              <div className="grid grid-cols-2 gap-3">
                {breedOptions[selectedType].map((breed) => (
                  <button
                    key={breed.emoji}
                    type="button"
                    onClick={() => setSelectedBreed(breed.emoji)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedBreed === breed.emoji
                        ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="text-5xl mb-2">{breed.emoji}</div>
                    <div className="text-sm font-bold text-gray-900">{breed.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="ownerName" className="block text-sm font-semibold text-gray-700 mb-2">
              Nickname (optional) {existingOwnerName && <span className="text-green-600">✓ Saved</span>}
            </label>
            <input
              id="ownerName"
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="Enter a nickname (or leave blank to use your username)..."
              maxLength={20}
              disabled={!!existingOwnerName}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-lg ${
                existingOwnerName
                  ? 'bg-gray-100 border-gray-300 text-gray-700 cursor-not-allowed'
                  : 'border-gray-200 text-gray-900'
              }`}
            />
          </div>

          <div>
            <label htmlFor="petName" className="block text-sm font-semibold text-gray-700 mb-2">
              Give your pet a name
            </label>
            <input
              id="petName"
              type="text"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              placeholder="Enter a name..."
              required
              maxLength={20}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-lg text-gray-900"
            />
          </div>

          <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-700">Adoption Cost:</span>
              {isAdminMode ? (
                <div className="flex items-center gap-2 font-bold text-lg text-blue-600">
                  FREE (ADMIN MODE)
                </div>
              ) : adoptionCost === 0 ? (
                <div className="flex items-center gap-2 font-bold text-lg text-green-600">
                  FREE
                </div>
              ) : (
                <div className={`flex items-center gap-2 font-bold text-lg ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
                  <Coins size={20} />
                  {adoptionCost}
                </div>
              )}
            </div>
            {!canAfford && adoptionCost > 0 && !isAdminMode && (
              <p className="text-red-600 text-sm mt-2 text-center font-semibold">
                Not enough coins! Level up your pets to earn more.
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!petName.trim() || !canAfford}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl font-semibold transition-all shadow-lg disabled:shadow-none"
            >
              Adopt Pet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
