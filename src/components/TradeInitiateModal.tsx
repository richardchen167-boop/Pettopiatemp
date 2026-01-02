import { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface TradeInitiateModalProps {
  recipientUserId: string;
  recipientName: string;
  onClose: () => void;
  onComplete: () => void;
  currentUserId: string;
}

export function TradeInitiateModal({
  recipientUserId,
  recipientName,
  onClose,
  onComplete,
  currentUserId,
}: TradeInitiateModalProps) {
  const [processing, setProcessing] = useState(false);

  const handleInitiateTrade = async () => {
    setProcessing(true);
    try {
      const { data: userPets } = await supabase
        .from('pets')
        .select('id')
        .eq('user_id', currentUserId)
        .limit(1)
        .maybeSingle();

      if (!userPets) {
        alert('You need at least one pet to start a trade!');
        setProcessing(false);
        return;
      }

      const { error } = await supabase
        .from('trade_requests')
        .insert({
          sender_id: currentUserId,
          recipient_id: recipientUserId,
          sender_pet_id: userPets.id,
          recipient_pet_id: null,
          message: `Let's trade!`,
          status: 'pending',
        });

      if (error) throw error;

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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-gradient-to-br from-pink-100 to-pink-50 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 max-w-md w-full border-2 sm:border-4 border-pink-300">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-3xl font-bold text-pink-600">Send Trade Request</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 flex-shrink-0"
          >
            <X size={20} className="sm:w-7 sm:h-7" />
          </button>
        </div>

        <div className="text-center py-4 sm:py-8">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">💱</div>
          <p className="text-base sm:text-lg text-gray-700 mb-4 sm:mb-6">
            Send a trade request to <span className="font-bold text-pink-600">{recipientName}</span>?
          </p>
          <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
            You'll both add items when they accept.
          </p>
        </div>

        <div className="flex gap-2 sm:gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-3 sm:px-6 py-2 sm:py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition-colors text-xs sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={handleInitiateTrade}
            disabled={processing}
            className="flex-1 px-3 sm:px-6 py-2 sm:py-3 rounded-xl bg-gradient-to-r from-pink-500 to-pink-400 text-white font-bold hover:shadow-lg disabled:opacity-50 transition-all text-xs sm:text-base"
          >
            {processing ? 'Sending...' : 'Send Request'}
          </button>
        </div>
      </div>
    </div>
  );
}
