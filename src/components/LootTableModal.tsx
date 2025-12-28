import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LootItem {
  id: string;
  item_name: string;
  item_emoji: string;
  item_type: string;
  rarity: string;
}

interface LootTableModalProps {
  onClose: () => void;
}

const RARITY_COLORS: Record<string, { bg: string; border: string; text: string; light: string }> = {
  common: { bg: 'bg-gray-100', border: 'border-gray-400', text: 'text-gray-700', light: 'bg-gray-50' },
  uncommon: { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-700', light: 'bg-green-50' },
  rare: { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-700', light: 'bg-blue-50' },
  'hyper rare': { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-700', light: 'bg-purple-50' },
  legendary: { bg: 'bg-yellow-100', border: 'border-yellow-400', text: 'text-yellow-700', light: 'bg-yellow-50' },
  mythical: { bg: 'bg-red-100', border: 'border-red-400', text: 'text-red-700', light: 'bg-red-50' },
  impossible: { bg: 'bg-pink-100', border: 'border-pink-400', text: 'text-pink-700', light: 'bg-pink-50' },
};

const rarityOrder: Record<string, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  'hyper rare': 3,
  legendary: 4,
  mythical: 5,
  impossible: 6,
};

export function LootTableModal({ onClose }: LootTableModalProps) {
  const [items, setItems] = useState<LootItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRarity, setSelectedRarity] = useState<string | null>(null);

  useEffect(() => {
    loadLootTable();
  }, []);

  const loadLootTable = async () => {
    try {
      const { data: lootItems } = await supabase
        .from('rarity_loot_table')
        .select('*')
        .order('rarity', { ascending: true })
        .order('item_name', { ascending: true });

      if (lootItems) {
        setItems(lootItems);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading loot table:', error);
      setLoading(false);
    }
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.rarity]) {
      acc[item.rarity] = [];
    }
    acc[item.rarity].push(item);
    return acc;
  }, {} as Record<string, LootItem[]>);

  const sortedRarities = Object.keys(groupedItems).sort((a, b) => rarityOrder[a] - rarityOrder[b]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Chest Loot Table</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading loot table...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedRarities.map(rarity => (
                <div key={rarity}>
                  <button
                    onClick={() => setSelectedRarity(selectedRarity === rarity ? null : rarity)}
                    className={`w-full px-4 py-3 rounded-lg font-bold text-lg transition-all ${RARITY_COLORS[rarity].bg} ${RARITY_COLORS[rarity].text} border-2 ${RARITY_COLORS[rarity].border} hover:shadow-lg`}
                  >
                    {rarity.toUpperCase()} ({groupedItems[rarity].length} items)
                  </button>

                  {selectedRarity === rarity && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {groupedItems[rarity].map(item => (
                        <div
                          key={item.id}
                          className={`rounded-lg border-2 ${RARITY_COLORS[rarity].border} ${RARITY_COLORS[rarity].light} p-3 text-center`}
                        >
                          <div className="text-4xl mb-2">{item.item_emoji}</div>
                          <p className={`font-bold text-sm ${RARITY_COLORS[rarity].text}`}>{item.item_name}</p>
                          <p className="text-xs text-gray-600 capitalize mt-1">{item.item_type}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
