'use client';

import { useState } from 'react';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { Button } from '@/components/ui/button';
import { Heart, Gift, Coffee } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';

export function SupportMission() {
  const { user } = useAuth();
  const [amount, setAmount] = useState<number>(1000);
  const [isCustom, setIsCustom] = useState(false);
  const [customAmount, setCustomAmount] = useState('');

  const config = {
    public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || '',
    tx_ref: Date.now().toString(),
    amount: isCustom ? parseFloat(customAmount) : amount,
    currency: 'NGN',
    payment_options: 'card,mobilemoney,ussd',
    customer: {
      email: user?.email || 'supporter@muslimdesk.com',
      phone_number: '',
      name: user?.displayName || 'Muslim Desk Supporter',
    },
    customizations: {
      title: 'Support Muslim Desk',
      description: 'Funding the development of Islamic Productivity Tools',
      logo: 'https://st2.depositphotos.com/4403291/7418/v/450/depositphotos_74189661-stock-illustration-online-shop-log.jpg',
    },
  };

  const handleFlutterPayment = useFlutterwave(config);

  const predefinedAmounts = [
    { value: 1000, label: '₦1,000', icon: <Coffee className="w-4 h-4" /> },
    { value: 5000, label: '₦5,000', icon: <Heart className="w-4 h-4 text-red-500" /> },
    { value: 10000, label: '₦10,000', icon: <Gift className="w-4 h-4 text-primary" /> },
  ];

  return (
    <div className="bg-accent/30 rounded-2xl p-6 border border-border/50 text-center w-full max-w-md mx-auto my-6">
      <Heart className="w-10 h-10 text-red-500 mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-2">Support Our Mission</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Help us keep Muslim Desk free and ad-free for everyone. Your support funds servers, APIs, and future features!
      </p>

      <div className="flex gap-3 justify-center mb-4 flex-wrap">
        {predefinedAmounts.map((preset) => (
          <Button
            key={preset.value}
            variant={amount === preset.value && !isCustom ? "default" : "outline"}
            onClick={() => {
              setIsCustom(false);
              setAmount(preset.value);
            }}
            className="flex items-center gap-2"
          >
            {preset.icon} {preset.label}
          </Button>
        ))}
      </div>

      <div className="mb-6">
        {isCustom ? (
          <div className="flex items-center justify-center gap-2">
            <span className="text-muted-foreground font-medium">₦</span>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Custom Amount"
              className="bg-background border border-border rounded-md px-3 py-2 text-sm w-32 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Button variant="ghost" size="sm" onClick={() => setIsCustom(false)}>Cancel</Button>
          </div>
        ) : (
          <Button variant="link" size="sm" onClick={() => setIsCustom(true)} className="text-muted-foreground">
            Enter a custom amount
          </Button>
        )}
      </div>

      <Button
        className="w-full sm:w-auto px-8"
        size="lg"
        disabled={isCustom && !customAmount}
        onClick={() => {
          handleFlutterPayment({
            callback: async (response) => {
              console.log(response);
              closePaymentModal();
              try {
                const donAmount = isCustom ? parseFloat(customAmount) : amount;
                const tier = donAmount >= 10000 ? 'Patron' : donAmount >= 5000 ? 'Sustainer' : 'Contributor';

                // Record transaction in Firestore
                await addDoc(collection(db, 'transactions'), {
                  supporterName: user?.displayName || user?.email?.split('@')[0] || 'Muslim Desk Supporter',
                  email: user?.email || 'supporter@muslimdesk.com',
                  amount: donAmount,
                  currency: 'NGN',
                  tier: tier,
                  date: new Date().toISOString().slice(0, 10),
                  status: 'Successful',
                  txRef: response.tx_ref || `FLW-${Date.now()}`,
                  transactionId: response.transaction_id ? String(response.transaction_id) : '',
                  createdAt: serverTimestamp()
                });

                // Update user document if authenticated
                if (user?.uid) {
                  const userRef = doc(db, 'users', user.uid);
                  await updateDoc(userRef, {
                    isSupporter: true,
                    totalDonation: increment(donAmount)
                  });
                }
              } catch (e) {
                console.error("Error saving donation record:", e);
              }
              alert('Jazakallah Khair for your generous support of Muslim Desk!');
            },
            onClose: () => {},
          });
        }}
      >
        Donate {isCustom ? (customAmount ? `₦${customAmount}` : '') : `₦${amount.toLocaleString()}`}
      </Button>
    </div>
  );
}
