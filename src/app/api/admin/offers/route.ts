interface Offer {
  id: number;
  title: string;
  description: string;
  type: 'win' | 'lose';
  emoji: string;
  contact: string;
  timestamp: number;
  consumed?: boolean;
  uniqueId?: string;
}

import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { getCurrentUTC, isCooldownActive } from '@/lib/time-utils';

// Simple admin session management
function isAuthorizedAdmin(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  const adminKey = process.env.ADMIN_API_KEY || 'admin-secret-key';
  
  if (authHeader === `Bearer ${adminKey}`) {
    return adminKey; // Return session identifier
  }
  return null;
}

// GET: Fetch offers with filtering options
export async function GET(request: NextRequest) {
  try {
    const session = isAuthorizedAdmin(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // YYYY-MM-DD format
    const email = searchParams.get('email');
    const status = searchParams.get('status'); // 'active', 'expired', 'consumed', 'all'
    
    // For mock implementation, we'll simulate data
    // In real implementation, this would scan all history:* keys
    const allOffers = await getAllOffers();
    
    let filteredOffers = allOffers;

    // Filter by date
    if (date) {
      const targetDate = new Date(date);
      filteredOffers = filteredOffers.filter(offer => {
        const offerDate = new Date(offer.timestamp);
        return offerDate.toDateString() === targetDate.toDateString();
      });
    }

    // Filter by email
    if (email) {
      filteredOffers = filteredOffers.filter(offer => 
        offer.contact.toLowerCase().includes(email.toLowerCase())
      );
    }

    // Filter by status
    if (status && status !== 'all') {
      filteredOffers = filteredOffers.filter(offer => {
        const isExpired = !isCooldownActive(new Date(offer.timestamp));
        const isConsumed = offer.consumed || false;
        
        switch (status) {
          case 'active':
            return !isExpired && !isConsumed;
          case 'expired':
            return isExpired && !isConsumed;
          case 'consumed':
            return isConsumed;
          default:
            return true;
        }
      });
    }

    // Add computed fields
    const enrichedOffers = filteredOffers.map(offer => ({
      ...offer,
      isExpired: !isCooldownActive(new Date(offer.timestamp)),
      isConsumed: offer.consumed || false,
      generatedAtFormatted: new Date(offer.timestamp).toLocaleString(),
      status: offer.consumed 
        ? 'consumed' 
        : !isCooldownActive(new Date(offer.timestamp)) 
          ? 'expired' 
          : 'active'
    }));

    // Sort by timestamp (newest first)
    enrichedOffers.sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({
      success: true,
      offers: enrichedOffers,
      totalCount: enrichedOffers.length,
      filters: { date, email, status },
      generatedAt: getCurrentUTC().toISOString()
    });

  } catch (error) {
    console.error('Error fetching admin offers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch offers' },
      { status: 500 }
    );
  }
}

// POST: Mark offer as consumed/not consumed
export async function POST(request: NextRequest) {
  try {
    const session = isAuthorizedAdmin(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { action, identifier, consumed, staffMember } = await request.json();
    
    if (!action || !identifier) {
      return NextResponse.json(
        { error: 'Action and identifier are required' },
        { status: 400 }
      );
    }

    let updatedCount = 0;

    if (action === 'mark_consumed') {
      updatedCount = await markOfferAsConsumed(identifier, consumed !== false, staffMember);
    }

    return NextResponse.json({
      success: true,
      message: `Offer(s) updated successfully`,
      updatedCount,
      actionTime: getCurrentUTC().toISOString()
    });

  } catch (error) {
    console.error('Error updating offer:', error);
    return NextResponse.json(
      { error: 'Failed to update offer' },
      { status: 500 }
    );
  }
}

// Helper function to get all offers from Redis
async function getAllOffers(): Promise<Offer[]> {
  const allOffers: Offer[] = [];
  
  try {
    // Since we can't easily scan Redis keys in Vercel KV, we'll implement a registry approach
    // Store contact emails in a registry and fetch their histories
    
    // For now, we'll use a simple registry approach or direct scanning if supported
    // This is a workaround for Vercel KV limitations
    
    // Get the registry of all contacts (if it exists)
    const contactRegistry = await kv.get('admin:contact_registry') || [];
    
    if (Array.isArray(contactRegistry)) {
      // Fetch history for each contact
      for (const contact of contactRegistry) {
        const historyKey = `history:${contact}`;
        const userHistory = await kv.get(historyKey);
        
        if (userHistory && Array.isArray(userHistory)) {
          // Add all offers from this user's history
          userHistory.forEach(offer => {
            allOffers.push({
              ...offer,
              contact: contact
            });
          });
        }
      }
    }
    
    // If registry doesn't exist or is empty, try some common patterns
    // This is a fallback and not scalable for production
    if (allOffers.length === 0) {
      console.log('No offers found via registry, admin panel may be empty until contacts are registered');
    }
    
  } catch (error) {
    console.error('Error getting all offers:', error);
  }
  
  return allOffers;
}



// Helper function to mark an offer as consumed
async function markOfferAsConsumed(identifier: string, consumed: boolean, staffMember?: string): Promise<number> {
  let updatedCount = 0;
  
  try {
    // The identifier is expected to be the user's contact (email/phone)
    const historyKey = `history:${identifier}`;
    const userHistory = await kv.get(historyKey);
    
    if (userHistory && Array.isArray(userHistory) && userHistory.length > 0) {
      // Update the latest offer (last one in array) as consumed
      const updatedHistory = [...userHistory];
      const lastOfferIndex = updatedHistory.length - 1;
      
      updatedHistory[lastOfferIndex] = {
        ...updatedHistory[lastOfferIndex],
        consumed: consumed,
        consumedAt: consumed ? getCurrentUTC().toISOString() : undefined,
        consumedBy: consumed ? (staffMember || 'admin') : undefined
      };
      
      await kv.set(historyKey, updatedHistory);
      updatedCount = 1;
      
      console.log(`Successfully marked offer for ${identifier} as consumed: ${consumed}`);
    } else {
      console.log(`No offer history found for ${identifier}`);
    }
    
  } catch (error) {
    console.error('Error marking offer as consumed:', error);
  }
  
  return updatedCount;
}