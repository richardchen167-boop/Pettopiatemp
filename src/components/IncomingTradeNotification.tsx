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
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
        <div className="bg-white rounded-3xl p-8">
          <p className="text-gray-500">Loading trade request...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
      <div className="bg-gradient-to-br from-pink-100 to-pink-50 rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full border-4 border-pink-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-pink-600">Trade Request!</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X size={24} className="sm:w-7 sm:h-7" />
          </button>
        </div>

        <div className="text-center py-6 sm:py-8">
          <div className="text-5xl sm:text-6xl mb-4">💱</div>
          <p className="text-base sm:text-lg text-gray-700 mb-6">
            <span className="font-bold text-pink-600">{senderName}</span> wants to trade with you!
          </p>
          <p className="text-xs sm:text-sm text-gray-500">
            Click below to see what they're offering.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition-colors text-sm sm:text-base"
          >
            Dismiss
          </button>
          <button
            onClick={() => {
              onOpenTrade(incomingTrade);
              onClose();
            }}
            className="flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-gradient-to-r from-pink-500 to-pink-400 text-white font-bold hover:shadow-lg transition-all text-sm sm:text-base"
          >
            View Trade
          </button>
        </div>
      </div>
    </div>
  );
}
