import { useState, useEffect } from 'react';
import { X, ArrowUp, ArrowDown, Check } from 'lucide-react';
import { supabase, type HouseInventoryItem } from '../lib/supabase';
import { HouseInventory } from './HouseInventory';
import { Aquarium } from './Aquarium';

interface HouseProps {
  userId: string;
  onClose: () => void;
}

export function House({ userId, onClose }: HouseProps) {
  const [currentFloor, setCurrentFloor] = useState<'lower' | 'upper'>('lower');
  const [placedItems, setPlacedItems] = useState<HouseInventoryItem[]>([]);
  const [draggingItem, setDraggingItem] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [previewItem, setPreviewItem] = useState<{ item: HouseInventoryItem; room: 'lower' | 'upper'; x: number; y: number } | null>(null);

  useEffect(() => {
    loadPlacedItems();
  }, [userId]);

  const loadPlacedItems = async () => {
    try {
      const { data, error } = await supabase
        .from('house_inventory')
        .select('*')
        .eq('user_id', userId)
        .eq('placed', true);

      if (error) throw error;
      setPlacedItems(data || []);
    } catch (error) {
      console.error('Error loading placed items:', error);
    }
  };

  const placeItem = async (item: HouseInventoryItem, room: 'lower' | 'upper') => {
    const centerX = 50;
    const centerY = 50;
    setPreviewItem({ item, room, x: centerX, y: centerY });
    setCurrentFloor(room);
  };

  const confirmPlacement = async () => {
    if (!previewItem) return;

    try {
      await supabase
        .from('house_inventory')
        .update({
          placed: true,
          room: previewItem.room,
          position_x: previewItem.x,
          position_y: previewItem.y
        })
        .eq('id', previewItem.item.id);

      await loadPlacedItems();
      setPreviewItem(null);
    } catch (error) {
      console.error('Error placing item:', error);
    }
  };

  const cancelPlacement = () => {
    setPreviewItem(null);
  };

  const removeItem = async (itemId: string) => {
    try {
      await supabase
        .from('house_inventory')
        .update({
          placed: false,
          room: null,
          position_x: null,
          position_y: null
        })
        .eq('id', itemId);

      await loadPlacedItems();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const currentFloorItems = placedItems.filter(item => item.room === currentFloor);

  const handleMouseDown = (e: React.MouseEvent, itemId: string, isPreview = false) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const parentRect = (e.currentTarget as HTMLElement).offsetParent?.getBoundingClientRect();

    if (parentRect) {
      setDragOffset({
        x: e.clientX - rect.left - rect.width / 2,
        y: e.clientY - rect.top - rect.height / 2
      });
      setDraggingItem(isPreview ? 'preview' : itemId);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingItem) return;

    const container = e.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();

    const x = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100;
    const y = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100;

    const clampedX = Math.max(5, Math.min(95, x));
    const clampedY = Math.max(5, Math.min(95, y));

    if (draggingItem === 'preview' && previewItem) {
      setPreviewItem(prev => prev ? { ...prev, x: clampedX, y: clampedY } : null);
    } else {
      setPlacedItems(prev =>
        prev.map(item =>
          item.id === draggingItem
            ? { ...item, position_x: clampedX, position_y: clampedY }
            : item
        )
      );
    }
  };

  const handleMouseUp = async () => {
    if (!draggingItem) return;

    if (draggingItem !== 'preview') {
      const item = placedItems.find(i => i.id === draggingItem);
      if (item) {
        try {
          await supabase
            .from('house_inventory')
            .update({
              position_x: item.position_x,
              position_y: item.position_y
            })
            .eq('id', item.id);
        } catch (error) {
          console.error('Error updating item position:', error);
        }
      }
    }

    setDraggingItem(null);
  };

  const handleItemClick = (e: React.MouseEvent, itemId: string) => {
    if (draggingItem) {
      e.stopPropagation();
      return;
    }

    if (e.detail === 2) {
      removeItem(itemId);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-sky-300 via-sky-200 to-green-200 z-50 overflow-hidden" style={{ perspective: '1000px' }}>
      <button
        onClick={onClose}
        className="absolute top-6 right-6 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all hover:scale-110 z-10"
        title="Leave house"
      >
        <X size={24} className="text-gray-700" />
      </button>

      <div className="absolute top-6 left-6 flex flex-col gap-3 z-10">
        <button
          onClick={() => setCurrentFloor('upper')}
          disabled={currentFloor === 'upper'}
          className={`flex items-center gap-2 p-3 rounded-full shadow-lg transition-all ${
            currentFloor === 'upper'
              ? 'bg-amber-500 text-white cursor-not-allowed'
              : 'bg-white/90 hover:bg-white hover:scale-110 text-gray-700'
          }`}
          title="Go to upper floor"
        >
          <ArrowUp size={24} />
          <span className="font-semibold pr-2">Upper</span>
        </button>
        <button
          onClick={() => setCurrentFloor('lower')}
          disabled={currentFloor === 'lower'}
          className={`flex items-center gap-2 p-3 rounded-full shadow-lg transition-all ${
            currentFloor === 'lower'
              ? 'bg-amber-500 text-white cursor-not-allowed'
              : 'bg-white/90 hover:bg-white hover:scale-110 text-gray-700'
          }`}
          title="Go to lower floor"
        >
          <ArrowDown size={24} />
          <span className="font-semibold pr-2">Lower</span>
        </button>
      </div>

      <div className="relative w-full h-full flex items-center justify-center">
        <div className="relative" style={{ transformStyle: 'preserve-3d', transform: 'rotateY(-20deg) rotateX(5deg)' }}>

          <div className="relative w-[1400px] h-[800px]" style={{ transformStyle: 'preserve-3d' }}>

            <div
              className="absolute inset-0 bg-gradient-to-b from-amber-100 to-amber-200 border-8 border-amber-900 shadow-2xl transition-opacity duration-500"
              style={{ transform: 'translateZ(0px)', opacity: currentFloor === 'lower' ? 1 : 0, pointerEvents: currentFloor === 'lower' ? 'auto' : 'none' }}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px]">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-700 via-amber-600 to-amber-700 rounded-lg shadow-2xl border-4 border-amber-900">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-800/30 to-amber-900/20 rounded-lg"></div>
                  <div className="absolute inset-4 border-2 border-amber-800/40 rounded-lg"></div>
                </div>

                <div className="absolute -left-3 top-[15%] w-6 h-[70%] bg-gradient-to-r from-amber-800 via-amber-700 to-amber-800 rounded-lg shadow-lg"></div>
                <div className="absolute -right-3 top-[15%] w-6 h-[70%] bg-gradient-to-r from-amber-800 via-amber-700 to-amber-800 rounded-lg shadow-lg"></div>
                <div className="absolute -left-3 bottom-[20%] w-6 h-8 bg-gradient-to-b from-amber-900 to-amber-800 rounded-sm"></div>
                <div className="absolute -right-3 bottom-[20%] w-6 h-8 bg-gradient-to-b from-amber-900 to-amber-800 rounded-sm"></div>
                <div className="absolute -left-3 top-[20%] w-6 h-8 bg-gradient-to-b from-amber-900 to-amber-800 rounded-sm"></div>
                <div className="absolute -right-3 top-[20%] w-6 h-8 bg-gradient-to-b from-amber-900 to-amber-800 rounded-sm"></div>
              </div>

              {currentFloorItems.map((item) => (
                <div
                  key={item.id}
                  className={`absolute cursor-move select-none ${draggingItem === item.id ? 'z-50 opacity-80' : 'hover:scale-105'} transition-all`}
                  style={{
                    left: `${item.position_x}%`,
                    top: `${item.position_y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  onMouseDown={(e) => handleMouseDown(e, item.id)}
                  onClick={(e) => handleItemClick(e, item.id)}
                  title={`${item.item_name} - Drag to move, double-click to remove`}
                >
                  {item.item_name === 'Aquarium' ? (
                    <Aquarium />
                  ) : (
                    <div className="text-7xl drop-shadow-lg">{item.item_emoji}</div>
                  )}
                </div>
              ))}

              {previewItem && previewItem.room === 'lower' && (
                <div
                  className={`absolute cursor-move select-none ${draggingItem === 'preview' ? 'z-50 opacity-80' : 'hover:scale-105'} transition-all animate-pulse`}
                  style={{
                    left: `${previewItem.x}%`,
                    top: `${previewItem.y}%`,
                    transform: 'translate(-50%, -50%)',
                    filter: 'brightness(1.2) drop-shadow(0 0 20px rgba(59, 130, 246, 0.8))'
                  }}
                  onMouseDown={(e) => handleMouseDown(e, 'preview', true)}
                  title={`${previewItem.item.item_name} - Drag to position, then confirm placement`}
                >
                  {previewItem.item.item_name === 'Aquarium' ? (
                    <Aquarium />
                  ) : (
                    <div className="text-7xl drop-shadow-lg">{previewItem.item.item_emoji}</div>
                  )}
                </div>
              )}

              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-amber-900/90 text-white px-8 py-3 rounded-full shadow-lg text-lg font-bold">
                Lower Floor - Dining Room
              </div>
            </div>

            <div
              className="absolute inset-0 bg-gradient-to-b from-amber-50 to-amber-100 border-8 border-amber-900 shadow-2xl transition-opacity duration-500"
              style={{ transform: 'translateZ(0px)', opacity: currentFloor === 'upper' ? 1 : 0, pointerEvents: currentFloor === 'upper' ? 'auto' : 'none' }}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {currentFloorItems.map((item) => (
                <div
                  key={item.id}
                  className={`absolute cursor-move select-none ${draggingItem === item.id ? 'z-50 opacity-80' : 'hover:scale-105'} transition-all`}
                  style={{
                    left: `${item.position_x}%`,
                    top: `${item.position_y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  onMouseDown={(e) => handleMouseDown(e, item.id)}
                  onClick={(e) => handleItemClick(e, item.id)}
                  title={`${item.item_name} - Drag to move, double-click to remove`}
                >
                  {item.item_name === 'Aquarium' ? (
                    <Aquarium />
                  ) : (
                    <div className="text-7xl drop-shadow-lg">{item.item_emoji}</div>
                  )}
                </div>
              ))}

              {previewItem && previewItem.room === 'upper' && (
                <div
                  className={`absolute cursor-move select-none ${draggingItem === 'preview' ? 'z-50 opacity-80' : 'hover:scale-105'} transition-all animate-pulse`}
                  style={{
                    left: `${previewItem.x}%`,
                    top: `${previewItem.y}%`,
                    transform: 'translate(-50%, -50%)',
                    filter: 'brightness(1.2) drop-shadow(0 0 20px rgba(59, 130, 246, 0.8))'
                  }}
                  onMouseDown={(e) => handleMouseDown(e, 'preview', true)}
                  title={`${previewItem.item.item_name} - Drag to position, then confirm placement`}
                >
                  {previewItem.item.item_name === 'Aquarium' ? (
                    <Aquarium />
                  ) : (
                    <div className="text-7xl drop-shadow-lg">{previewItem.item.item_emoji}</div>
                  )}
                </div>
              )}

              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-amber-900/90 text-white px-8 py-3 rounded-full shadow-lg text-lg font-bold">
                Upper Floor - Living Room
              </div>
            </div>

            <div
              className="absolute top-0 left-0 w-[200px] h-full bg-gradient-to-br from-amber-200 via-amber-300 to-amber-400 border-y-8 border-l-8 border-amber-900 shadow-xl"
              style={{
                transform: 'rotateY(90deg) translateZ(-500px)',
                transformOrigin: 'left center'
              }}
            >
              <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-28 h-32 bg-sky-400 border-6 border-amber-900 shadow-inner" style={{ borderWidth: '6px' }}>
                <div className="absolute inset-0 grid grid-cols-2 gap-1 p-1">
                  <div className="border-2 border-amber-900/40 bg-sky-300"></div>
                  <div className="border-2 border-amber-900/40 bg-sky-300"></div>
                  <div className="border-2 border-amber-900/40 bg-sky-300"></div>
                  <div className="border-2 border-amber-900/40 bg-sky-300"></div>
                </div>
                <div className="absolute inset-0 bg-white/20"></div>
              </div>

              <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 w-28 h-32 bg-sky-400 border-6 border-amber-900 shadow-inner" style={{ borderWidth: '6px' }}>
                <div className="absolute inset-0 grid grid-cols-2 gap-1 p-1">
                  <div className="border-2 border-amber-900/40 bg-sky-300"></div>
                  <div className="border-2 border-amber-900/40 bg-sky-300"></div>
                  <div className="border-2 border-amber-900/40 bg-sky-300"></div>
                  <div className="border-2 border-amber-900/40 bg-sky-300"></div>
                </div>
                <div className="absolute inset-0 bg-white/20"></div>
              </div>
            </div>

            <div
              className="absolute top-0 right-0 w-[200px] h-full bg-gradient-to-bl from-amber-200 via-amber-300 to-amber-400 border-y-8 border-r-8 border-amber-900 shadow-xl"
              style={{
                transform: 'rotateY(-90deg) translateZ(-500px)',
                transformOrigin: 'right center'
              }}
            >
              <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-28 h-32 bg-sky-400 border-6 border-amber-900 shadow-inner" style={{ borderWidth: '6px' }}>
                <div className="absolute inset-0 grid grid-cols-2 gap-1 p-1">
                  <div className="border-2 border-amber-900/40 bg-sky-300"></div>
                  <div className="border-2 border-amber-900/40 bg-sky-300"></div>
                  <div className="border-2 border-amber-900/40 bg-sky-300"></div>
                  <div className="border-2 border-amber-900/40 bg-sky-300"></div>
                </div>
                <div className="absolute inset-0 bg-white/20"></div>
              </div>

              <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 w-28 h-32 bg-sky-400 border-6 border-amber-900 shadow-inner" style={{ borderWidth: '6px' }}>
                <div className="absolute inset-0 grid grid-cols-2 gap-1 p-1">
                  <div className="border-2 border-amber-900/40 bg-sky-300"></div>
                  <div className="border-2 border-amber-900/40 bg-sky-300"></div>
                  <div className="border-2 border-amber-900/40 bg-sky-300"></div>
                  <div className="border-2 border-amber-900/40 bg-sky-300"></div>
                </div>
                <div className="absolute inset-0 bg-white/20"></div>
              </div>
            </div>

            <div
              className="absolute inset-x-0 bottom-0 h-[200px] bg-gradient-to-t from-amber-300 via-amber-400 to-amber-300 border-x-8 border-b-8 border-amber-900"
              style={{
                transform: 'rotateX(90deg) translateZ(-600px)',
                transformOrigin: 'bottom center'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-200/40 to-orange-400/40"></div>
            </div>

            <div
              className="absolute inset-x-0 top-0 h-[200px] bg-gradient-to-b from-amber-200 via-amber-300 to-amber-200 border-x-8 border-t-8 border-amber-900"
              style={{
                transform: 'rotateX(-90deg) translateZ(-600px)',
                transformOrigin: 'top center'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-300/40 to-orange-200/40"></div>
            </div>
          </div>
        </div>
      </div>

      {previewItem ? (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-8 py-6 rounded-2xl shadow-2xl border-4 border-blue-400">
          <div className="flex flex-col items-center gap-4">
            <p className="text-xl font-bold text-gray-800">Position your {previewItem.item.item_name}</p>
            <div className="flex flex-wrap gap-2 justify-center mb-2">
              <button
                onClick={() => setPreviewItem(prev => prev ? { ...prev, x: 50, y: 50 } : null)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-colors"
              >
                Center
              </button>
              <button
                onClick={() => setPreviewItem(prev => prev ? { ...prev, x: 20, y: 50 } : null)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-colors"
              >
                Left
              </button>
              <button
                onClick={() => setPreviewItem(prev => prev ? { ...prev, x: 80, y: 50 } : null)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-colors"
              >
                Right
              </button>
              <button
                onClick={() => setPreviewItem(prev => prev ? { ...prev, x: 50, y: 20 } : null)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-colors"
              >
                Top
              </button>
              <button
                onClick={() => setPreviewItem(prev => prev ? { ...prev, x: 50, y: 80 } : null)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-colors"
              >
                Bottom
              </button>
              <button
                onClick={() => setPreviewItem(prev => prev ? { ...prev, x: 20, y: 20 } : null)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-colors"
              >
                Top Left
              </button>
              <button
                onClick={() => setPreviewItem(prev => prev ? { ...prev, x: 80, y: 20 } : null)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-colors"
              >
                Top Right
              </button>
              <button
                onClick={() => setPreviewItem(prev => prev ? { ...prev, x: 20, y: 80 } : null)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-colors"
              >
                Bottom Left
              </button>
              <button
                onClick={() => setPreviewItem(prev => prev ? { ...prev, x: 80, y: 80 } : null)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-colors"
              >
                Bottom Right
              </button>
            </div>
            <div className="text-sm text-gray-600 mb-2">Click a position button or drag the item to place it</div>
            <div className="flex gap-4">
              <button
                onClick={confirmPlacement}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg transition-all hover:scale-105"
              >
                <Check size={24} />
                Place Here
              </button>
              <button
                onClick={cancelPlacement}
                className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg transition-all hover:scale-105"
              >
                <X size={24} />
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-8 py-4 rounded-full shadow-2xl border-4 border-amber-300">
          <p className="text-xl font-bold text-gray-800">Welcome to your cozy home! 🏡</p>
        </div>
      )}

      <div className="absolute top-24 left-6">
        <HouseInventory userId={userId} onPlace={placeItem} />
      </div>
    </div>
  );
}
