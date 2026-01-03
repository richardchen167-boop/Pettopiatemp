import { X } from 'lucide-react';
import { supabase, type TradeRequest } from '../lib/supabase';
import { useState } from 'react';

interface IncomingTradeNotificationProps {
  incomingTrade: TradeRequest | null;
  onOpenTrade: (trade: TradeRequest) => void;
  onClose: () => void;
}

export function IncomingTradeNotification({ incomingTrade, onOpenTrade, onClose }: IncomingTradeNotificationProps) {
  const [senderName, setSenderName] = useState('');
  const [loading, setLoading] = useState(true);

  if (!incomingTrade) return null;

  if (loading) {
    (async () => {
      try {
        const { data: senderData } = await supabase
          .from('user_settings')
          .select('display_name, username')
          .eq('user_id', incomingTrade.sender_id)
          .maybeSingle();

        setSenderName(senderData?.display_name || senderData?.username || 'A Trader');
        setLoading(false);
      } catch (error) {
        console.error('Error loading sender name:', error);
        setLoading(false);
      }
    })();
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[150]">
        <div className="bg-white rounded-3xl p-12">
          <p className="text-gray-500 text-lg">Loading trade request...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[150]">
      <div className="bg-gradient-to-br from-pink-100 to-pink-50 rounded-3xl shadow-2xl p-8 sm:p-12 w-full max-w-2xl border-4 border-pink-300 mx-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl sm:text-5xl font-bold text-pink-600">Trade Request!</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2"
          >
            <X size={32} className="sm:w-8 sm:h-8" />
          </button>
        </div>

        <div className="text-center py-8 sm:py-12">
          <div className="text-8xl sm:text-9xl mb-6">💱</div>
          <p className="text-xl sm:text-2xl text-gray-700 mb-4">
            <span className="font-bold text-pink-600">{senderName}</span>
          </p>
          <p className="text-lg sm:text-xl text-gray-700 mb-8">
            wants to trade with you!
          </p>
          <p className="text-sm sm:text-base text-gray-500">
            Click below to see what they're offering.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 sm:px-8 py-3 sm:py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition-colors text-base sm:text-lg"
          >
            Dismiss
          </button>
          <button
            onClick={() => {
              onOpenTrade(incomingTrade);
              onClose();
            }}
            className="flex-1 px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-pink-500 to-pink-400 text-white font-bold hover:shadow-lg transition-all text-base sm:text-lg"
          >
            View Trade
          </button>
        </div>
      </div>
    </div>
  );
}
