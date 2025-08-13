import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';

// Simple OTP generator
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Simulate email sending (you can replace this with actual email service)
async function sendOTP(contact: string, otp: string, method: 'email' | 'phone') {
  console.log(`Sending OTP ${otp} to ${contact} via ${method}`);
  // In a real app, you would integrate with an email service like SendGrid, Resend, etc.
  // For now, we'll just log it to console for development
  return true;
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
      const timeDiff = Date.now() - Number(lastOfferTime);
      const oneDayInMs = 24 * 60 * 60 * 1000;
      
      if (timeDiff < oneDayInMs) {
        const remainingTime = oneDayInMs - timeDiff;
        const hoursLeft = Math.ceil(remainingTime / (60 * 60 * 1000));
        
        return NextResponse.json(
          { 
            error: 'Cooldown active',
            message: `You have already claimed your offer today. Please wait ${hoursLeft} more hours before trying again`,
            hoursLeft,
            cooldownActive: true
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
    await sendOTP(contact, otp, method);
    
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