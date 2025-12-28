import { useState, useEffect } from 'react';
import { X, Coins, Gift } from 'lucide-react';
import { supabase, type Pet, type ShopItem } from '../lib/supabase';
import { ChestOpeningModal } from './ChestOpeningModal';

interface ShopModalProps {
  pet: Pet;
  onClose: () => void;
  onPurchase: () => void;
}

export function ShopModal({ pet, onClose, onPurchase }: ShopModalProps) {
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'toy' | 'furniture' | 'decor' | 'chest'>('toy');
  const [chestCount, setChestCount] = useState(0);
  const [showChestOpening, setShowChestOpening] = useState(false);

  useEffect(() => {
    loadShopItems();
    loadChestCount();
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

  const loadChestCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_chests')
        .select('quantity')
        .eq('user_id', user.id)
        .maybeSingle();

      setChestCount(data?.quantity || 0);
    } catch (error) {
      console.error('Error loading chest count:', error);
    }
  };

  const buyChest = async () => {
    if (purchasing) return;
    if (pet.coins < 200) {
      alert("Not enough coins! Chests cost 200 coins.");
      return;
    }

    setPurchasing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Please log in to make purchases");
        setPurchasing(false);
        return;
      }

      const { data: existingChests } = await supabase
        .from('user_chests')
        .select('quantity')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingChests) {
        await supabase
          .from('user_chests')
          .update({ quantity: existingChests.quantity + 1 })
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('user_chests')
          .insert({
            user_id: user.id,
            quantity: 1
          });
      }

      await supabase
        .from('pets')
        .update({
          coins: pet.coins - 200,
          updated_at: new Date().toISOString()
        })
        .eq('id', pet.id);

      setChestCount((prev) => prev + 1);
      onPurchase();
    } catch (error) {
      console.error('Error buying chest:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const openChest = async () => {
    if (chestCount <= 0) {
      alert("You don't have any chests!");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: chests } = await supabase
      .from('user_chests')
      .select('quantity')
      .eq('user_id', user.id)
      .maybeSingle();

    if (chests && chests.quantity > 0) {
      await supabase
        .from('user_chests')
        .update({ quantity: chests.quantity - 1 })
        .eq('user_id', user.id);

      setChestCount((prev) => Math.max(0, prev - 1));
      setShowChestOpening(true);
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
  const currentAccessory = selectedTab === 'toy' ? pet.accessories['toy'] : null;

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
          <div className="grid grid-cols-4 gap-2 mb-6">
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
            <button
              onClick={() => setSelectedTab('chest')}
              className={`py-3 px-2 rounded-xl font-semibold transition-all text-sm flex items-center justify-center gap-1 ${
                selectedTab === 'chest'
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Gift size={16} /> Chests
            </button>
          </div>

          {currentAccessory && selectedTab === 'toy' && (
            <div className="mb-6 p-4 bg-green-50 border-2 border-green-500 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{currentAccessory}</span>
                  <div>
                    <p className="font-bold text-green-800">Currently Equipped</p>
                    <p className="text-sm text-green-600">Your pet is wearing this toy</p>
                  </div>
                </div>
                <button
                  onClick={() => removeItem('toy')}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          {selectedTab === 'toy' && (
            <div className="mb-6 p-4 bg-purple-50 border-2 border-purple-400 rounded-xl">
              <p className="text-purple-800 font-semibold text-center">
                ✨ Purchased toys will be added to your inventory
              </p>
              <p className="text-purple-600 text-sm text-center mt-1">
                Open the Inventory to apply toys to your pets!
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

          {selectedTab === 'chest' && (
            <div>
              <div className="mb-6 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-400 rounded-xl text-center">
                <div className="text-6xl mb-4">🎁</div>
                <p className="text-amber-800 font-bold text-lg mb-2">Mystery Chests</p>
                <p className="text-amber-600 mb-4">
                  Purchase a chest for 200 coins and open it to receive a random pet accessory!
                </p>
                <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                  <div>
                    <div className="text-sm text-amber-600 font-bold">Common</div>
                    <div className="text-lg font-bold text-amber-800">45%</div>
                  </div>
                  <div>
                    <div className="text-sm text-green-600 font-bold">Uncommon</div>
                    <div className="text-lg font-bold text-green-800">30%</div>
                  </div>
                  <div>
                    <div className="text-sm text-blue-600 font-bold">Rare</div>
                    <div className="text-lg font-bold text-blue-800">15%</div>
                  </div>
                  <div>
                    <div className="text-sm text-purple-600 font-bold">Hyper Rare</div>
                    <div className="text-lg font-bold text-purple-800">6%</div>
                  </div>
                  <div>
                    <div className="text-sm text-yellow-600 font-bold">Legendary</div>
                    <div className="text-lg font-bold text-yellow-800">3%</div>
                  </div>
                  <div>
                    <div className="text-sm text-red-600 font-bold">Mythical</div>
                    <div className="text-lg font-bold text-red-800">1%</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-xl border-2 border-amber-300 bg-amber-50 text-center">
                  <div className="text-5xl mb-3">🎁</div>
                  <h3 className="font-bold text-amber-800 mb-2">Buy Chest</h3>
                  <p className="text-sm text-amber-600 mb-4">200 coins</p>
                  <button
                    onClick={buyChest}
                    disabled={pet.coins < 200 || purchasing}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                      pet.coins >= 200 && !purchasing
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {purchasing ? 'Processing...' : 'Buy'}
                  </button>
                </div>

                <div className="p-6 rounded-xl border-2 border-orange-300 bg-orange-50 text-center">
                  <div className="text-5xl mb-3">✨</div>
                  <h3 className="font-bold text-orange-800 mb-2">Open Chest</h3>
                  <p className="text-sm text-orange-600 mb-4">You have {chestCount}</p>
                  <button
                    onClick={openChest}
                    disabled={chestCount === 0}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                      chestCount > 0
                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {chestCount > 0 ? 'Open' : 'No Chests'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading && selectedTab !== 'chest' ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading items...</p>
            </div>
          ) : selectedTab !== 'chest' ? (
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
          ) : null}
        </div>
      </div>
      {showChestOpening && (
        <ChestOpeningModal
          onClose={() => setShowChestOpening(false)}
          onItemReceived={() => {
            setShowChestOpening(false);
            onPurchase();
          }}
        />
      )}
    </div>
  );
}
