import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { 
  getSameTimeTomorrowIST, 
  getRemainingTimeUntil, 
  formatRemainingTime,
  isCooldownActive,
  formatISTTime
} from '@/lib/time-utils';

export async function POST(request: NextRequest) {
  try {
    const { contact, otp } = await request.json();
    
    if (!contact || !otp) {
      return NextResponse.json(
        { error: 'Contact and OTP are required' },
        { status: 400 }
      );
    }

    // Get stored OTP from Redis
    const otpKey = `otp:${contact}`;
    const storedOTP = await kv.get(otpKey);
    
    if (!storedOTP) {
      return NextResponse.json(
        { error: 'OTP expired or not found' },
        { status: 400 }
      );
    }

    if (storedOTP !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // OTP is valid, delete it from Redis
    await kv.del(otpKey);
    
    // Check if user has already generated an offer today
    const cooldownKey = `cooldown:${contact}`;
    const lastOfferTime = await kv.get(cooldownKey);
    
    if (lastOfferTime) {
      const lastGenerationTime = new Date(Number(lastOfferTime));
      
      if (isCooldownActive(lastGenerationTime)) {
        const nextAvailableTime = getSameTimeTomorrowIST(lastGenerationTime);
        const remainingMs = getRemainingTimeUntil(nextAvailableTime);
        const timeInfo = formatRemainingTime(remainingMs);
        
        // Get the user's last offer from history to show it
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
              nextAvailableAtFormatted: formatISTTime(nextAvailableTime),
              ...timeInfo
            },
            existingOffer: lastOffer ? {
              ...lastOffer,
              generatedAt: Number(lastOfferTime),
              generatedAtFormatted: formatISTTime(lastGenerationTime),
              contact: contact,
              uniqueId: `${contact}_${lastOfferTime}_${lastOffer.id}`
            } : null
          },
          { status: 429 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully'
    });
    
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}