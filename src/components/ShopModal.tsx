import { useState, useEffect } from 'react';
import { X, Coins } from 'lucide-react';
import { supabase, type Pet, type ShopItem } from '../lib/supabase';

interface ShopModalProps {
  pet: Pet;
  onClose: () => void;
  onPurchase: () => void;
}

export function ShopModal({ pet, onClose, onPurchase }: ShopModalProps) {
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const isBird = pet.type === 'bird';
  const [selectedTab, setSelectedTab] = useState<'hat' | 'eyewear' | 'toy' | 'furniture' | 'decor'>(isBird ? 'toy' : 'hat');

  useEffect(() => {
    loadShopItems();
  }, []);

  const loadShopItems = async () => {
    try {
      const { data, error } = await supabase
        .from('shop_items')
        .select('*')
        .order('price', { ascending: true });

      if (error) throw error;
      setShopItems(data || []);
    } catch (error) {
      console.error('Error loading shop items:', error);
    } finally {
      setLoading(false);
    }
  };

  const buyItem = async (item: ShopItem) => {
    if (purchasing) return;

    if (pet.coins < item.price) {
      alert("Not enough coins!");
      return;
    }

    setPurchasing(true);

    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        alert("Please log in to make purchases");
        setPurchasing(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/purchase-item`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.data.session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            petId: pet.id,
            itemId: item.id,
            itemPrice: item.price,
            itemType: item.type,
            itemName: item.name,
            itemEmoji: item.emoji
          })
        }
      );

      if (!response.ok) {
        const error = await response.text();
        alert(error || 'Purchase failed');
        setPurchasing(false);
        return;
      }

      onPurchase();
    } catch (error) {
      console.error('Error buying item:', error);
      alert('Purchase failed. Please try again.');
      setPurchasing(false);
    }
  };

  const removeItem = async (type: 'hat' | 'eyewear' | 'toy') => {
    try {
      const itemEmoji = pet.accessories[type];
      if (!itemEmoji) return;

      const newAccessories = { ...pet.accessories };
      newAccessories[type] = null;

      await supabase
        .from('pets')
        .update({
          accessories: newAccessories,
          updated_at: new Date().toISOString()
        })
        .eq('id', pet.id);

      const shopItemQuery = await supabase
        .from('shop_items')
        .select('*')
        .eq('emoji', itemEmoji)
        .eq('type', type)
        .maybeSingle();

      if (shopItemQuery.data) {
        const shopItem = shopItemQuery.data;
        const { data: existingItem } = await supabase
          .from('accessory_inventory')
          .select('*')
          .eq('user_id', pet.user_id)
          .eq('item_id', shopItem.id)
          .maybeSingle();

        if (existingItem) {
          await supabase
            .from('accessory_inventory')
            .update({
              quantity: existingItem.quantity + 1
            })
            .eq('id', existingItem.id);
        } else {
          await supabase
            .from('accessory_inventory')
            .insert({
              user_id: pet.user_id,
              item_id: shopItem.id,
              item_name: shopItem.name,
              item_type: shopItem.type,
              item_emoji: shopItem.emoji,
              quantity: 1
            });
        }
      }

      onPurchase();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const filteredItems = shopItems.filter(item => item.type === selectedTab);
  const currentAccessory = (selectedTab === 'hat' || selectedTab === 'eyewear' || selectedTab === 'toy')
    ? pet.accessories[selectedTab]
    : null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Pet Shop</h2>
            <p className="text-purple-100">Dress up {pet.name}!</p>
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

        <div className="p-6">
          {isBird ? (
            <div className="mb-6 bg-blue-50 border-2 border-blue-300 rounded-xl p-4 text-center">
              <p className="text-blue-800 font-semibold">Birds can only have toys!</p>
              <p className="text-blue-600 text-sm mt-1">Hats and eyewear aren't suitable for our feathered friends.</p>
            </div>
          ) : null}

          <div className="grid grid-cols-5 gap-2 mb-6">
            {!isBird && (
              <>
                <button
                  onClick={() => setSelectedTab('hat')}
                  className={`py-3 px-2 rounded-xl font-semibold transition-all text-sm ${
                    selectedTab === 'hat'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Hats
                </button>
                <button
                  onClick={() => setSelectedTab('eyewear')}
                  className={`py-3 px-2 rounded-xl font-semibold transition-all text-sm ${
                    selectedTab === 'eyewear'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Eyewear
                </button>
              </>
            )}
            <button
              onClick={() => setSelectedTab('toy')}
              className={`py-3 px-2 rounded-xl font-semibold transition-all text-sm ${
                selectedTab === 'toy'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Toys
            </button>
            <button
              onClick={() => setSelectedTab('furniture')}
              className={`py-3 px-2 rounded-xl font-semibold transition-all text-sm ${
                selectedTab === 'furniture'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Furniture
            </button>
            <button
              onClick={() => setSelectedTab('decor')}
              className={`py-3 px-2 rounded-xl font-semibold transition-all text-sm ${
                selectedTab === 'decor'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Decor
            </button>
          </div>

          {currentAccessory && (selectedTab === 'hat' || selectedTab === 'eyewear' || selectedTab === 'toy') && (
            <div className="mb-6 p-4 bg-green-50 border-2 border-green-500 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{currentAccessory}</span>
                  <div>
                    <p className="font-bold text-green-800">Currently Equipped</p>
                    <p className="text-sm text-green-600">Your pet is wearing this {selectedTab}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(selectedTab as 'hat' | 'eyewear' | 'toy')}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          {(selectedTab === 'hat' || selectedTab === 'eyewear' || selectedTab === 'toy') && (
            <div className="mb-6 p-4 bg-purple-50 border-2 border-purple-400 rounded-xl">
              <p className="text-purple-800 font-semibold text-center">
                ✨ Purchased accessories will be added to your inventory
              </p>
              <p className="text-purple-600 text-sm text-center mt-1">
                Open the Inventory to apply accessories to your pets!
              </p>
            </div>
          )}

          {(selectedTab === 'furniture' || selectedTab === 'decor') && (
            <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-400 rounded-xl">
              <p className="text-amber-800 font-semibold text-center">
                🏠 Purchased items will be added to your house inventory
              </p>
              <p className="text-amber-600 text-sm text-center mt-1">
                Visit your house to place and arrange your furniture and decorations!
              </p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading items...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map((item) => {
                const isEquipped = (item.type === 'hat' || item.type === 'eyewear' || item.type === 'toy')
                  ? pet.accessories[item.type] === item.emoji
                  : false;
                const canAfford = pet.coins >= item.price;

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isEquipped
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-5xl mb-2">{item.emoji}</div>
                      <h3 className="font-bold text-gray-800 mb-1 text-sm">{item.name}</h3>
                      <div className="flex items-center justify-center gap-1 mb-3">
                        <Coins size={16} className="text-yellow-600" />
                        <span className={`font-bold ${canAfford ? 'text-gray-900' : 'text-red-500'}`}>
                          {item.price}
                        </span>
                      </div>
                      {isEquipped ? (
                        <div className="text-sm font-semibold text-green-600">Equipped</div>
                      ) : (
                        <button
                          onClick={() => buyItem(item)}
                          disabled={!canAfford || purchasing}
                          className={`w-full py-2 rounded-lg font-semibold transition-colors text-sm ${
                            canAfford && !purchasing
                              ? 'bg-purple-600 hover:bg-purple-700 text-white'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {purchasing ? 'Processing...' : (canAfford ? 'Buy' : 'Too Expensive')}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
