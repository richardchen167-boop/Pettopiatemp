import { useState, useEffect } from 'react';
import { supabase, type HouseInventoryItem } from '../lib/supabase';
import { Package, Trash2 } from 'lucide-react';

interface HouseInventoryProps {
  userId: string;
  onPlace: (item: HouseInventoryItem, room: 'lower' | 'upper') => void;
}

export function HouseInventory({ userId, onPlace }: HouseInventoryProps) {
  const [inventory, setInventory] = useState<HouseInventoryItem[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<'lower' | 'upper'>('lower');

  useEffect(() => {
    loadInventory();
  }, [userId]);

  const loadInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('house_inventory')
        .select('*')
        .eq('user_id', userId)
        .eq('placed', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInventory(data || []);
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      await supabase
        .from('house_inventory')
        .delete()
        .eq('id', itemId);

      await loadInventory();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  if (inventory.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 w-80">
        <div className="flex items-center gap-3 mb-4">
          <Package size={24} className="text-amber-600" />
          <h3 className="text-xl font-bold text-gray-800">Inventory</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No items in inventory</p>
          <p className="text-gray-400 text-xs mt-2">Buy furniture and decor from the shop!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 w-80 max-h-[600px] overflow-y-auto">
      <div className="flex items-center gap-3 mb-4">
        <Package size={24} className="text-amber-600" />
        <h3 className="text-xl font-bold text-gray-800">Inventory</h3>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSelectedRoom('lower')}
          className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-all text-sm ${
            selectedRoom === 'lower'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Lower Floor
        </button>
        <button
          onClick={() => setSelectedRoom('upper')}
          className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-all text-sm ${
            selectedRoom === 'upper'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Upper Floor
        </button>
      </div>

      <div className="space-y-2">
        {inventory.map((item) => (
          <div
            key={item.id}
            className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg p-3 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="text-4xl">{item.item_emoji}</div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 text-sm">{item.item_name}</h4>
                <p className="text-xs text-gray-600 capitalize">{item.item_type}</p>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => onPlace(item, selectedRoom)}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-colors text-xs"
                >
                  Place
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-xs flex items-center justify-center gap-1"
                  title="Delete item"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
