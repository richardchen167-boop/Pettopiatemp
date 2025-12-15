import { useState, useEffect } from 'react';
import { X, Package, Sparkles, Home } from 'lucide-react';
import { supabase, type Pet, type AccessoryInventoryItem, type HouseInventoryItem } from '../lib/supabase';

interface InventoryModalProps {
  userId: string;
  onClose: () => void;
  onActivatePet: (petId: string) => void;
  onDeactivatePet: (petId: string) => void;
  onApplyAccessory: (petId: string, accessoryType: 'hat' | 'toy' | 'eyewear', emoji: string, inventoryId: string) => void;
  onPlaceHouseItem: (item: HouseInventoryItem, room: 'lower' | 'upper') => void;
  activePets: Pet[];
}

type TabType = 'pets' | 'accessories' | 'house';

export function InventoryModal({
  userId,
  onClose,
  onActivatePet,
  onApplyAccessory,
  onPlaceHouseItem,
  activePets
}: InventoryModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('accessories');
  const [inactivePets, setInactivePets] = useState<Pet[]>([]);
  const [accessories, setAccessories] = useState<AccessoryInventoryItem[]>([]);
  const [houseItems, setHouseItems] = useState<HouseInventoryItem[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<'lower' | 'upper'>('lower');
  const [selectedPetForAccessory, setSelectedPetForAccessory] = useState<string | null>(null);

  useEffect(() => {
    loadInventory();
  }, [userId]);

  const loadInventory = async () => {
    try {
      const { data: petInventoryData } = await supabase
        .from('pet_inventory')
        .select('pet_id, is_active')
        .eq('user_id', userId)
        .eq('is_active', false);

      if (petInventoryData && petInventoryData.length > 0) {
        const inactivePetIds = petInventoryData.map(pi => pi.pet_id);
        const { data: inactivePetData } = await supabase
          .from('pets')
          .select('*')
          .in('id', inactivePetIds);

        setInactivePets(inactivePetData || []);
      } else {
        setInactivePets([]);
      }

      const { data: accessoryData } = await supabase
        .from('accessory_inventory')
        .select('*')
        .eq('user_id', userId)
        .gt('quantity', 0)
        .order('created_at', { ascending: false });

      setAccessories(accessoryData || []);

      const { data: houseData } = await supabase
        .from('house_inventory')
        .select('*')
        .eq('user_id', userId)
        .eq('placed', false)
        .order('created_at', { ascending: false });

      setHouseItems(houseData || []);
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  };

  const handleApplyAccessory = async (accessory: AccessoryInventoryItem) => {
    if (!selectedPetForAccessory) return;

    await onApplyAccessory(
      selectedPetForAccessory,
      accessory.item_type,
      accessory.item_emoji,
      accessory.id
    );

    await loadInventory();
    setSelectedPetForAccessory(null);
  };

  const getPetEmoji = (type: string) => {
    const emojiMap: Record<string, string> = {
      cat: '🐱', dog: '🐶', fox: '🦊', bird: '🐦', rabbit: '🐰',
      bear: '🐻', panda: '🐼', koala: '🐨', hamster: '🐹', mouse: '🐭',
      pig: '🐷', frog: '🐸', monkey: '🐵', lion: '🦁', tiger: '🐯',
      cow: '🐮', turkey: '🦃', dragon: '🐉', shark: '🦈'
    };
    return emojiMap[type] || '🐾';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Package size={32} />
            Inventory
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('accessories')}
            className={`flex-1 py-4 px-6 font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'accessories'
                ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Sparkles size={20} />
            Accessories ({accessories.reduce((sum, a) => sum + a.quantity, 0)})
          </button>
          <button
            onClick={() => setActiveTab('pets')}
            className={`flex-1 py-4 px-6 font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'pets'
                ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            🐾 Pets ({inactivePets.length})
          </button>
          <button
            onClick={() => setActiveTab('house')}
            className={`flex-1 py-4 px-6 font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'house'
                ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Home size={20} />
            House ({houseItems.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'accessories' && (
            <div className="space-y-4">
              {accessories.length === 0 ? (
                <div className="text-center py-12">
                  <Sparkles size={64} className="mx-auto text-gray-300 mb-6" />
                  <h3 className="text-2xl font-bold text-gray-700 mb-3">No accessories in inventory</h3>
                  <p className="text-lg text-gray-500 mb-2">Your accessory collection is empty</p>
                  <p className="text-sm text-gray-400">
                    Visit the shop to buy hats, toys, and eyewear for your pets!
                  </p>
                </div>
              ) : (
                <>
                  {selectedPetForAccessory && (
                    <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4 mb-4">
                      <p className="font-semibold text-purple-800">
                        Select an accessory to apply to {activePets.find(p => p.id === selectedPetForAccessory)?.name}
                      </p>
                      <button
                        onClick={() => setSelectedPetForAccessory(null)}
                        className="mt-2 text-sm text-purple-600 hover:text-purple-800"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {!selectedPetForAccessory && activePets.length > 0 && (
                    <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-4">
                      <p className="font-semibold text-blue-800 mb-3">Select a pet to apply accessories:</p>
                      <div className="flex flex-wrap gap-2">
                        {activePets.map(pet => (
                          <button
                            key={pet.id}
                            onClick={() => setSelectedPetForAccessory(pet.id)}
                            className="px-4 py-2 bg-white hover:bg-blue-100 border-2 border-blue-400 rounded-lg font-semibold transition-all"
                          >
                            {getPetEmoji(pet.type)} {pet.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {accessories.map(accessory => (
                      <div
                        key={accessory.id}
                        className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4"
                      >
                        <div className="text-5xl mb-2 text-center">{accessory.item_emoji}</div>
                        <h4 className="font-bold text-gray-800 text-center text-sm">{accessory.item_name}</h4>
                        <p className="text-xs text-gray-600 text-center capitalize mb-2">{accessory.item_type}</p>
                        <p className="text-center text-purple-600 font-bold mb-3">Qty: {accessory.quantity}</p>
                        {selectedPetForAccessory && (
                          <button
                            onClick={() => handleApplyAccessory(accessory)}
                            className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors text-sm"
                          >
                            Apply
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'pets' && (
            <div className="space-y-4">
              {inactivePets.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-8xl mb-6">🐾</div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-3">No pets in storage</h3>
                  <p className="text-lg text-gray-500 mb-2">All your pets are active!</p>
                  <p className="text-sm text-gray-400">
                    Deactivate a pet to store it here, or adopt more pets to expand your collection
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {inactivePets.map(pet => (
                    <div
                      key={pet.id}
                      className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-6xl">{getPetEmoji(pet.type)}</div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 text-lg">{pet.name}</h4>
                          <p className="text-sm text-gray-600 capitalize">{pet.type}</p>
                          <p className="text-xs text-gray-500">Level {pet.level} • {pet.coins} coins</p>
                          {pet.owner_name && <p className="text-xs text-gray-500">Nickname: {pet.owner_name}</p>}
                        </div>
                      </div>
                      <button
                        onClick={() => onActivatePet(pet.id)}
                        className="w-full mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                      >
                        Activate Pet
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'house' && (
            <div className="space-y-4">
              {houseItems.length === 0 ? (
                <div className="text-center py-12">
                  <Home size={64} className="mx-auto text-gray-300 mb-6" />
                  <h3 className="text-2xl font-bold text-gray-700 mb-3">No house items in inventory</h3>
                  <p className="text-lg text-gray-500 mb-2">Your furniture collection is empty</p>
                  <p className="text-sm text-gray-400">
                    Visit the shop to buy furniture and decor to customize your house!
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setSelectedRoom('lower')}
                      className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-all ${
                        selectedRoom === 'lower'
                          ? 'bg-amber-600 text-white shadow-md'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Lower Floor
                    </button>
                    <button
                      onClick={() => setSelectedRoom('upper')}
                      className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-all ${
                        selectedRoom === 'upper'
                          ? 'bg-amber-600 text-white shadow-md'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Upper Floor
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {houseItems.map(item => (
                      <div
                        key={item.id}
                        className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg p-4"
                      >
                        <div className="text-5xl mb-2 text-center">{item.item_emoji}</div>
                        <h4 className="font-bold text-gray-800 text-center text-sm">{item.item_name}</h4>
                        <p className="text-xs text-gray-600 text-center capitalize mb-3">{item.item_type}</p>
                        <button
                          onClick={() => onPlaceHouseItem(item, selectedRoom)}
                          className="w-full px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-colors text-sm"
                        >
                          Place in {selectedRoom === 'lower' ? 'Lower' : 'Upper'} Floor
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
