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
      const { error } = await supabase
        .from('trade_requests')
        .insert({
          sender_id: currentUserId,
          recipient_id: recipientUserId,
          sender_pet_id: '',
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-pink-100 to-pink-50 rounded-3xl shadow-2xl p-8 max-w-md w-full border-4 border-pink-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-pink-600">Send Trade Request</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={28} />
          </button>
        </div>

        <div className="text-center py-8">
          <div className="text-6xl mb-4">💱</div>
          <p className="text-lg text-gray-700 mb-6">
            Send a trade request to <span className="font-bold text-pink-600">{recipientName}</span>?
          </p>
          <p className="text-sm text-gray-500 mb-6">
            You'll both add items when they accept.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleInitiateTrade}
            disabled={processing}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-pink-400 text-white font-bold hover:shadow-lg disabled:opacity-50 transition-all"
          >
            {processing ? 'Sending...' : 'Send Request'}
          </button>
        </div>
      </div>
    </div>
  );
}
