import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';

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