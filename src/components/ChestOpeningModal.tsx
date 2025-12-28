import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ChestOpeningModalProps {
  onClose: () => void;
  onItemReceived: (item: { name: string; emoji: string; type: string; rarity: string }) => void;
}

const RARITY_COLORS: Record<string, { bg: string; border: string; glow: string; text: string }> = {
  common: { bg: 'bg-gray-100', border: 'border-gray-400', glow: 'shadow-gray-400', text: 'text-gray-700' },
  uncommon: { bg: 'bg-green-100', border: 'border-green-400', glow: 'shadow-green-400', text: 'text-green-700' },
  rare: { bg: 'bg-blue-100', border: 'border-blue-400', glow: 'shadow-blue-400', text: 'text-blue-700' },
  'hyper rare': { bg: 'bg-purple-100', border: 'border-purple-400', glow: 'shadow-purple-400', text: 'text-purple-700' },
  legendary: { bg: 'bg-yellow-100', border: 'border-yellow-400', glow: 'shadow-yellow-400', text: 'text-yellow-700' },
  mythical: { bg: 'bg-red-100', border: 'border-red-400', glow: 'shadow-red-400', text: 'text-red-700' },
  impossible: { bg: 'bg-pink-100', border: 'border-pink-400', glow: 'shadow-pink-400', text: 'text-pink-700' },
};

export function ChestOpeningModal({ onClose, onItemReceived }: ChestOpeningModalProps) {
  const [isOpening, setIsOpening] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    if (isOpening) {
      const timer = setTimeout(() => {
        openChest();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpening]);

  const openChest = async () => {
    try {
      const { data: lootItems } = await supabase
        .from('rarity_loot_table')
        .select('*');

      if (!lootItems || lootItems.length === 0) return;

      const rarityWeights: Record<string, number> = {
        common: 45,
        uncommon: 30,
        rare: 15,
        'hyper rare': 6,
        legendary: 3,
        mythical: 1,
        impossible: 0.1,
      };

      const totalWeight = Object.values(rarityWeights).reduce((a, b) => a + b, 0);
      let random = Math.random() * totalWeight;
      let selectedRarity = 'common';

      for (const [rarity, weight] of Object.entries(rarityWeights)) {
        random -= weight;
        if (random <= 0) {
          selectedRarity = rarity;
          break;
        }
      }

      const itemsWithRarity = lootItems.filter(i => i.rarity === selectedRarity);
      const randomItem = itemsWithRarity[Math.floor(Math.random() * itemsWithRarity.length)];

      setSelectedItem(randomItem);
      setIsOpening(false);
    } catch (error) {
      console.error('Error opening chest:', error);
    }
  };

  const handleClaim = async () => {
    if (!selectedItem) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('accessory_inventory')
        .insert({
          user_id: user.id,
          item_id: selectedItem.id,
          item_name: selectedItem.item_name,
          item_type: selectedItem.item_type,
          item_emoji: selectedItem.item_emoji,
          quantity: 1,
        });

      onItemReceived({
        name: selectedItem.item_name,
        emoji: selectedItem.item_emoji,
        type: selectedItem.item_type,
        rarity: selectedItem.rarity,
      });

      onClose();
    } catch (error) {
      console.error('Error claiming item:', error);
    }
  };

  const colors = selectedItem ? RARITY_COLORS[selectedItem.rarity] : RARITY_COLORS.common;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl shadow-2xl p-8 max-w-md w-full border-4 border-amber-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <div className="text-center">
          {isOpening ? (
            <div className="py-16">
              <div className="text-7xl mb-6 animate-bounce">🎁</div>
              <p className="text-xl font-bold text-amber-700">Opening Chest...</p>
            </div>
          ) : selectedItem ? (
            <div className="py-8">
              <p className="text-sm text-gray-600 mb-4">You found:</p>
              <div
                className={`rounded-2xl border-4 ${colors.border} ${colors.bg} p-8 mb-6 ${colors.glow} shadow-lg`}
              >
                <div className="text-7xl mb-4">{selectedItem.item_emoji}</div>
                <p className={`text-2xl font-bold ${colors.text} capitalize`}>
                  {selectedItem.item_name}
                </p>
                <p className={`text-sm font-bold ${colors.text} uppercase tracking-wider mt-2`}>
                  {selectedItem.rarity}
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 mb-6 text-yellow-600">
                <Sparkles size={20} />
                <span className="text-sm font-bold">Congratulations!</span>
                <Sparkles size={20} />
              </div>
            </div>
          ) : (
            <div className="py-8">
              <p className="text-gray-500">Loading...</p>
            </div>
          )}
        </div>

        {!isOpening && selectedItem && (
          <button
            onClick={handleClaim}
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold hover:shadow-lg transition-all"
          >
            Claim Item
          </button>
        )}
      </div>
    </div>
  );
}
