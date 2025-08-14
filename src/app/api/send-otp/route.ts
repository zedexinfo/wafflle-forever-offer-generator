import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { sendOTPEmail, sendOTPSMS } from '@/lib/email';
import { 
  getSameTimeTomorrowIST, 
  getRemainingTimeUntil, 
  formatRemainingTime,
  isCooldownActive,
  formatISTTime
} from '@/lib/time-utils';

// Simple OTP generator
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via email or SMS
async function sendOTP(contact: string, otp: string, method: 'email' | 'phone'): Promise<boolean> {
  try {
    if (method === 'email') {
      return await sendOTPEmail(contact, otp);
    } else if (method === 'phone') {
      return await sendOTPSMS(contact, otp);
    }
    return false;
  } catch (error) {
    console.error('Error sending OTP:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { contact, method } = await request.json();
    
    if (!contact || !method) {
      return NextResponse.json(
        { error: 'Contact and method are required' },
        { status: 400 }
      );
    }

    // Validate email or phone format
    if (method === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contact)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }
    } else if (method === 'phone') {
      const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
      if (!phoneRegex.test(contact)) {
        return NextResponse.json(
          { error: 'Invalid phone format' },
          { status: 400 }
        );
      }
    }

    // Check if user has already generated an offer today (cooldown check)
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
            message: `You have already claimed your offer today. Next spin available in ${timeInfo.display}`,
            cooldownActive: true,
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

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP in Redis with 10 minutes expiry
    const otpKey = `otp:${contact}`;
    await kv.setex(otpKey, 600, otp); // 10 minutes expiry
    
    // Send OTP
    const emailSent = await sendOTP(contact, otp, method);
    
    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send OTP. Please try again.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'OTP sent successfully',
      // For development only - remove in production
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
    
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}