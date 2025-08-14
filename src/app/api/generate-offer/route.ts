import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { 
  getCurrentUTC, 
  getSameTimeTomorrowUTC, 
  getRemainingTimeUntil, 
  formatRemainingTime,
  isCooldownActive
} from '@/lib/time-utils';

// Helper function to register contact for admin panel
async function registerContactForAdmin(contact: string): Promise<void> {
  try {
    const registry = await kv.get('admin:contact_registry') || [];
    const updatedRegistry = Array.isArray(registry) ? [...registry] : [];
    
    if (!updatedRegistry.includes(contact)) {
      updatedRegistry.push(contact);
      await kv.set('admin:contact_registry', updatedRegistry);
    }
  } catch (error) {
    console.error('Error registering contact for admin:', error);
  }
}

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
      const lastGenerationTime = new Date(Number(lastOfferTime));
      
      if (isCooldownActive(lastGenerationTime)) {
        const nextAvailableTime = getSameTimeTomorrowUTC(lastGenerationTime);
        const remainingMs = getRemainingTimeUntil(nextAvailableTime);
        const timeInfo = formatRemainingTime(remainingMs);
        
        // Get the existing offer to return it
        const historyKey = `history:${contact}`;
        const userHistory = await kv.get(historyKey) || [];
        const lastOffer = Array.isArray(userHistory) && userHistory.length > 0 
          ? userHistory[userHistory.length - 1] 
          : null;

        return NextResponse.json(
          { 
            error: 'Cooldown active',
            message: `Please wait ${timeInfo.display} before generating another offer`,
            cooldownInfo: {
              remainingMs,
              nextAvailableAt: nextAvailableTime.getTime(),
              nextAvailableAtUTC: nextAvailableTime.toISOString(),
              ...timeInfo
            },
            existingOffer: lastOffer ? {
              ...lastOffer,
              generatedAt: Number(lastOfferTime),
              generatedAtUTC: lastGenerationTime.toISOString(),
              contact: contact,
              uniqueId: `${contact}_${lastOfferTime}_${lastOffer.id}`
            } : null
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

    // Set cooldown until same time tomorrow (UTC-based)
    const generatedAt = getCurrentUTC();
    const nextAvailableTime = getSameTimeTomorrowUTC(generatedAt);
    const cooldownDurationMs = getRemainingTimeUntil(nextAvailableTime);
    const cooldownDurationSeconds = Math.ceil(cooldownDurationMs / 1000);
    
    await kv.setex(cooldownKey, cooldownDurationSeconds, generatedAt.getTime().toString());

    // Register contact for admin panel
    await registerContactForAdmin(contact);

    // Store the offer in user history
    const historyKey = `history:${contact}`;
    const userHistory = await kv.get(historyKey) || [];
    const newHistory = Array.isArray(userHistory) ? [...userHistory] : [];
    const offerWithMetadata = {
      ...selectedOffer,
      timestamp: generatedAt.getTime(),
      date: generatedAt.toISOString(),
      generatedAtUTC: generatedAt.toISOString(),
      nextAvailableAt: nextAvailableTime.getTime(),
      nextAvailableAtUTC: nextAvailableTime.toISOString(),
      consumed: false // Track if admin has marked as consumed
    };
    
    newHistory.push(offerWithMetadata);
    
    // Keep only last 10 offers
    if (newHistory.length > 10) {
      newHistory.splice(0, newHistory.length - 10);
    }
    
    await kv.set(historyKey, newHistory);

    const offerWithTimestamp = {
      ...selectedOffer,
      generatedAt: generatedAt.getTime(),
      generatedAtUTC: generatedAt.toISOString(),
      contact: contact,
      // Add unique identifier for this specific offer generation
      uniqueId: `${contact}_${generatedAt.getTime()}_${selectedOffer.id}`,
      nextAvailableAt: nextAvailableTime.getTime(),
      nextAvailableAtUTC: nextAvailableTime.toISOString()
    };

    return NextResponse.json({
      success: true,
      offer: offerWithTimestamp,
      cooldownInfo: {
        remainingMs: cooldownDurationMs,
        nextAvailableAt: nextAvailableTime.getTime(),
        nextAvailableAtUTC: nextAvailableTime.toISOString(),
        hours: Math.floor(cooldownDurationMs / 3600000),
        minutes: Math.floor((cooldownDurationMs % 3600000) / 60000),
        seconds: Math.floor((cooldownDurationMs % 60000) / 1000),
        totalSeconds: Math.floor(cooldownDurationMs / 1000),
        display: formatRemainingTime(cooldownDurationMs).display
      },
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