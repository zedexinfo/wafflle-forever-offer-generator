import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';

const offers = [
  { 
    id: 1, 
    title: "Free Chocolate Waffle", 
    description: "Enjoy a delicious chocolate waffle on us!",
    type: "win",
    emoji: "🧇"
  },
  { 
    id: 2, 
    title: "Free Pancake", 
    description: "A fluffy pancake with your favorite toppings!",
    type: "win",
    emoji: "🥞"
  },
  { 
    id: 3, 
    title: "Free Cooler", 
    description: "Beat the heat with a refreshing cooler!",
    type: "win",
    emoji: "🥤"
  },
  { 
    id: 4, 
    title: "Free Waffle Stick", 
    description: "Crispy waffle stick just for you!",
    type: "win",
    emoji: "🧇"
  },
  { 
    id: 5, 
    title: "Free Cold Coffee", 
    description: "Iced coffee to energize your day!",
    type: "win",
    emoji: "☕"
  },
  { 
    id: 6, 
    title: "Better luck Next Time", 
    description: "Don't give up! Come back tomorrow for another chance!",
    type: "lose",
    emoji: "🍀"
  },
  { 
    id: 7, 
    title: "You'll get it next time", 
    description: "Keep trying! Your perfect offer is waiting!",
    type: "lose",
    emoji: "🎯"
  },
  { 
    id: 8, 
    title: "It's okay, everyone experiences setbacks sometimes", 
    description: "Tomorrow brings new opportunities!",
    type: "lose",
    emoji: "💪"
  }
];

export async function POST(request: NextRequest) {
  try {
    const { contact } = await request.json();
    
    if (!contact) {
      return NextResponse.json(
        { error: 'Contact is required' },
        { status: 400 }
      );
    }

    // Check cooldown again (double check)
    const cooldownKey = `cooldown:${contact}`;
    const lastOfferTime = await kv.get(cooldownKey);
    
    if (lastOfferTime) {
      const timeDiff = Date.now() - Number(lastOfferTime);
      const oneDayInMs = 24 * 60 * 60 * 1000;
      
      if (timeDiff < oneDayInMs) {
        const remainingTime = oneDayInMs - timeDiff;
        const hoursLeft = Math.ceil(remainingTime / (60 * 60 * 1000));
        
        return NextResponse.json(
          { 
            error: 'Cooldown active',
            message: `Please wait ${hoursLeft} more hours before generating another offer`,
            hoursLeft
          },
          { status: 429 }
        );
      }
    }

    // Generate random offer with weighted probabilities
    // 40% chance for winning offers, 60% chance for losing offers
    const random = Math.random();
    let selectedOffer;
    
    if (random < 0.4) {
      // Select a winning offer
      const winOffers = offers.filter(offer => offer.type === 'win');
      selectedOffer = winOffers[Math.floor(Math.random() * winOffers.length)];
    } else {
      // Select a losing offer
      const loseOffers = offers.filter(offer => offer.type === 'lose');
      selectedOffer = loseOffers[Math.floor(Math.random() * loseOffers.length)];
    }

    // Set cooldown for 24 hours
    await kv.setex(cooldownKey, 86400, Date.now().toString()); // 24 hours in seconds

    // Store the offer in user history
    const historyKey = `history:${contact}`;
    const userHistory = await kv.get(historyKey) || [];
    const newHistory = Array.isArray(userHistory) ? [...userHistory] : [];
    newHistory.push({
      ...selectedOffer,
      timestamp: Date.now(),
      date: new Date().toISOString()
    });
    
    // Keep only last 10 offers
    if (newHistory.length > 10) {
      newHistory.splice(0, newHistory.length - 10);
    }
    
    await kv.set(historyKey, newHistory);

    return NextResponse.json({
      success: true,
      offer: selectedOffer,
      message: selectedOffer.type === 'win' 
        ? 'Congratulations! You won an amazing offer!' 
        : 'Keep trying! Better luck next time!'
    });
    
  } catch (error) {
    console.error('Error generating offer:', error);
    return NextResponse.json(
      { error: 'Failed to generate offer' },
      { status: 500 }
    );
  }
}