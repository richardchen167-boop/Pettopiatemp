import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { supabase, type AccessoryInventoryItem, type HouseInventoryItem, type Pet } from '../lib/supabase';

const PET_EMOJIS: Record<Pet['type'], string> = {
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
  squirrel: '🐿',
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
};

interface TradeInitiateModalProps {
  recipientUserId: string;
  recipientName: string;
  onClose: () => void;
  onComplete: () => void;
  currentUserId: string;
}

const ITEM_COLORS: Record<string, string> = {
  hat: 'border-blue-400 bg-blue-50',
  eyewear: 'border-purple-400 bg-purple-50',
  toy: 'border-yellow-400 bg-yellow-50',
  furniture: 'border-amber-400 bg-amber-50',
  decor: 'border-green-400 bg-green-50',
  pet: 'border-red-400 bg-red-50',
};

export function TradeInitiateModal({
  recipientUserId,
  recipientName,
  onClose,
  onComplete,
  currentUserId,
}: TradeInitiateModalProps) {
  const [accessories, setAccessories] = useState<AccessoryInventoryItem[]>([]);
  const [houseItems, setHouseItems] = useState<HouseInventoryItem[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedItems, setSelectedItems] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadInventory();
  }, [currentUserId]);

  const loadInventory = async () => {
    try {
      const { data: accessoryData } = await supabase
        .from('accessory_inventory')
        .select('*')
        .eq('user_id', currentUserId)
        .gt('quantity', 0);

      const { data: houseData } = await supabase
        .from('house_inventory')
        .select('*')
        .eq('user_id', currentUserId)
        .eq('placed', false);

      const { data: userPets } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false });

      setAccessories(accessoryData || []);
      setHouseItems(houseData || []);
      setPets(userPets || []);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (itemId: string) => {
    const current = selectedItems.get(itemId) || 0;
    if (current > 0) {
      selectedItems.delete(itemId);
    } else {
      selectedItems.set(itemId, 1);
    }
    setSelectedItems(new Map(selectedItems));
  };

  const getSelectedCount = () => selectedItems.size;

  const handleInitiateTrade = async () => {
    if (selectedItems.size === 0) {
      alert('Please select at least one item to trade');
      return;
    }

    setProcessing(true);
    try {
      const { data: tradeRequest, error: insertError } = await supabase
        .from('trade_requests')
        .insert({
          sender_id: currentUserId,
          recipient_id: recipientUserId,
          sender_pet_id: '',
          recipient_pet_id: null,
          message: `I'd like to trade with you!`,
          status: 'pending',
        })
        .select()
        .maybeSingle();

      if (insertError || !tradeRequest) throw insertError;

      const tradeItems = Array.from(selectedItems.entries()).map(([itemId]) => {
        let itemData;

        const accessoryItem = accessories.find(a => a.id === itemId);
        if (accessoryItem) {
          itemData = {
            trade_request_id: tradeRequest.id,
            sender_offering: true,
            item_id: itemId,
            item_type: accessoryItem.item_type,
            item_name: accessoryItem.item_name,
            item_emoji: accessoryItem.item_emoji,
          };
        } else {
          const houseItem = houseItems.find(h => h.id === itemId);
          if (houseItem) {
            itemData = {
              trade_request_id: tradeRequest.id,
              sender_offering: true,
              item_id: itemId,
              item_type: houseItem.item_type,
              item_name: houseItem.item_name,
              item_emoji: houseItem.item_emoji,
            };
          } else {
            const pet = pets.find(p => p.id === itemId);
            if (pet) {
              itemData = {
                trade_request_id: tradeRequest.id,
                sender_offering: true,
                item_id: itemId,
                item_type: 'pet',
                item_name: pet.name,
                item_emoji: PET_EMOJIS[pet.type],
              };
            }
          }
        }

        return itemData;
      }).filter(Boolean);

      if (tradeItems.length > 0) {
        const { error: itemsError } = await supabase
          .from('trade_items')
          .insert(tradeItems);

        if (itemsError) throw itemsError;
      }

      alert(`Trade request sent to ${recipientName}!`);
      onComplete();
      onClose();
    } catch (error) {
      console.error('Error initiating trade:', error);
      alert('Failed to send trade request');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl p-8">
          <p className="text-gray-500">Loading your items...</p>
        </div>
      </div>
    );
  }

  const allItems = [
    ...pets.map(p => ({
      id: p.id,
      item_name: p.name,
      item_emoji: PET_EMOJIS[p.type],
      item_type: 'pet',
      type: 'pet',
    })),
    ...accessories.map(a => ({ ...a, type: a.item_type as string })),
    ...houseItems.map(h => ({ ...h, type: h.item_type })),
  ];

  const hasItems = allItems.length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-pink-100 to-pink-50 rounded-3xl shadow-2xl p-8 max-w-2xl w-full border-4 border-pink-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-pink-600">Trade with {recipientName}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={28} />
          </button>
        </div>

        <p className="text-gray-700 mb-6">Select items you'd like to offer in this trade:</p>

        {!hasItems ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📦</div>
            <p className="text-gray-500">You don't have any items to trade yet.</p>
            <p className="text-sm text-gray-400 mt-2">Visit the shop to get some items!</p>
          </div>
        ) : (
          <>
            {pets.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-pink-700 mb-3">Your Pets</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  {pets.map((pet) => {
                    const isSelected = selectedItems.has(pet.id);
                    return (
                      <button
                        key={pet.id}
                        onClick={() => toggleItem(pet.id)}
                        className={`rounded-xl border-3 border-red-400 transition-all p-3 ${
                          isSelected
                            ? 'bg-red-100 ring-4 ring-pink-400 scale-105'
                            : 'bg-red-50 hover:scale-105'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="text-4xl">{PET_EMOJIS[pet.type]}</div>
                          <div className="text-left flex-1">
                            <div className="font-bold text-sm">{pet.name}</div>
                            <div className="text-xs text-gray-600">Lv. {pet.level}</div>
                          </div>
                          {isSelected && <div className="text-lg font-bold text-pink-600">✓</div>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {(accessories.length > 0 || houseItems.length > 0) && (
              <div>
                <h3 className="text-sm font-bold text-pink-700 mb-3">Your Items</h3>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-4 bg-white/50 rounded-xl">
                  {allItems.filter(item => item.type !== 'pet').map((item) => {
                    const isSelected = selectedItems.has(item.id);
                    const colorClass = ITEM_COLORS[item.type] || 'border-gray-400 bg-gray-50';
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className={`aspect-square rounded-xl border-3 transition-all ${
                          isSelected
                            ? `${colorClass} ring-4 ring-pink-400 scale-105`
                            : `${colorClass} hover:scale-105`
                        }`}
                        title={item.item_name}
                      >
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                          <div className="text-3xl">{item.item_emoji}</div>
                          {isSelected && <div className="text-sm font-bold text-pink-600">✓</div>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-400 hover:bg-gray-500 disabled:bg-gray-300 text-white font-bold rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleInitiateTrade}
            disabled={processing || selectedItems.size === 0}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            {processing ? 'Sending...' : `Send Trade (${getSelectedCount()} items)`}
          </button>
        </div>
      </div>
    </div>
  );
}
