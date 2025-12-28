import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { supabase, type TradeRequest, type TradeItem } from '../lib/supabase';

interface TradeAcceptModalProps {
  trade: TradeRequest;
  currentUserId: string;
  onClose: () => void;
  onComplete: () => void;
}

const ITEM_COLORS: Record<string, string> = {
  hat: 'border-blue-400',
  eyewear: 'border-purple-400',
  toy: 'border-yellow-400',
  furniture: 'border-amber-400',
  decor: 'border-green-400',
};

export function TradeAcceptModal({ trade, currentUserId, onClose, onComplete }: TradeAcceptModalProps) {
  const [senderItems, setSenderItems] = useState<TradeItem[]>([]);
  const [recipientItems, setRecipientItems] = useState<TradeItem[]>([]);
  const [senderName, setSenderName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const isRecipient = currentUserId === trade.recipient_id;

  useEffect(() => {
    loadTradeDetails();
  }, [trade.id]);

  const loadTradeDetails = async () => {
    try {
      const { data: items } = await supabase
        .from('trade_items')
        .select('*')
        .eq('trade_request_id', trade.id);

      if (items) {
        setSenderItems(items.filter(i => i.sender_offering));
        setRecipientItems(items.filter(i => !i.sender_offering));
      }

      const { data: senderData } = await supabase
        .from('user_settings')
        .select('display_name, username')
        .eq('user_id', trade.sender_id)
        .maybeSingle();

      const { data: recipientData } = await supabase
        .from('user_settings')
        .select('display_name, username')
        .eq('user_id', trade.recipient_id)
        .maybeSingle();

      setSenderName(senderData?.display_name || senderData?.username || 'User');
      setRecipientName(recipientData?.display_name || recipientData?.username || 'User');
    } catch (error) {
      console.error('Error loading trade details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!isRecipient) return;

    setProcessing(true);
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        alert('Please log in to accept trades');
        setProcessing(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/accept-trade`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.data.session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            tradeId: trade.id
          })
        }
      );

      if (!response.ok) {
        const error = await response.text();
        alert(error || 'Failed to accept trade');
        setProcessing(false);
        return;
      }

      onComplete();
      onClose();
    } catch (error) {
      console.error('Error accepting trade:', error);
      alert('Failed to accept trade. Please try again.');
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!isRecipient) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('trade_requests')
        .update({ status: 'rejected' })
        .eq('id', trade.id);

      if (error) throw error;
      onComplete();
      onClose();
    } catch (error) {
      console.error('Error declining trade:', error);
      alert('Failed to decline trade');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl p-8">
          <p className="text-gray-500">Loading trade...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-pink-100 to-pink-50 rounded-3xl shadow-2xl p-8 max-w-2xl w-full border-4 border-pink-300">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-pink-600">Trade Offer</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={28} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-8 items-center mb-8">
          <div>
            <div className="text-sm font-bold text-pink-600 text-center mb-3">
              {senderName} offers
            </div>
            <div className="bg-white rounded-2xl border-4 border-pink-400 p-4">
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 9 }).map((_, i) => {
                  const item = senderItems[i];
                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded-xl border-3 ${
                        item
                          ? `${ITEM_COLORS[item.item_type]} bg-white flex items-center justify-center text-3xl`
                          : 'border-pink-300 bg-pink-50'
                      } flex items-center justify-center`}
                    >
                      {item && <span>{item.item_emoji}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="bg-gradient-to-r from-pink-500 to-pink-400 rounded-full p-3 shadow-lg">
              <svg className="w-6 h-6 text-white animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 10l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M4 10a1 1 0 011-1h4.586L5.293 4.293a1 1 0 010-1.414a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 11-1.414-1.414L9.586 11H5a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-pink-600">TRADE</div>
              <div className="text-3xl mt-2">💱</div>
            </div>
            <div className="bg-gray-400 rounded-full p-3">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 9a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M7.293 12.95a1 1 0 010 1.414l-4 4a1 1 0 11-1.414-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                <path d="M15 11a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M12.707 12.95a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <div>
            <div className="text-sm font-bold text-pink-600 text-center mb-3">
              {recipientName} receives
            </div>
            <div className="bg-white rounded-2xl border-4 border-pink-400 p-4">
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 9 }).map((_, i) => {
                  const item = recipientItems[i];
                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded-xl border-3 ${
                        item
                          ? `${ITEM_COLORS[item.item_type]} bg-white flex items-center justify-center text-3xl`
                          : 'border-pink-300 bg-pink-50'
                      } flex items-center justify-center`}
                    >
                      {item && <span>{item.item_emoji}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {isRecipient && (
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleDecline}
              disabled={processing}
              className="px-8 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-bold rounded-xl transition-colors text-lg"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              disabled={processing}
              className="px-8 py-3 bg-gray-700 hover:bg-gray-800 disabled:bg-gray-300 text-white font-bold rounded-xl transition-colors text-lg flex items-center gap-2"
            >
              <Check size={20} />
              {processing ? 'Processing...' : 'Accept'}
            </button>
          </div>
        )}

        {!isRecipient && (
          <div className="text-center text-gray-500 text-sm">
            Waiting for {recipientName} to respond...
          </div>
        )}
      </div>
    </div>
  );
}
