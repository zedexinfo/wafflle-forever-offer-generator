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
import { formatISTTime, getCurrentIST, isCooldownActive } from '@/lib/time-utils';

// Simple admin authentication
function isAuthorizedAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const adminKey = process.env.ADMIN_API_KEY || 'admin-secret-key';
  return authHeader === `Bearer ${adminKey}`;
}

// GET: Fetch offers with filtering options
export async function GET(request: NextRequest) {
  try {
    if (!isAuthorizedAdmin(request)) {
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
      generatedAtFormatted: formatISTTime(new Date(offer.timestamp)),
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
      generatedAt: getCurrentIST().toISOString()
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
    if (!isAuthorizedAdmin(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { action, identifier, consumed } = await request.json();
    
    if (!action || !identifier) {
      return NextResponse.json(
        { error: 'Action and identifier are required' },
        { status: 400 }
      );
    }

    let updatedCount = 0;

    if (action === 'mark_consumed') {
      updatedCount = await markOfferAsConsumed(identifier, consumed !== false);
    }

    return NextResponse.json({
      success: true,
      message: `Offer(s) updated successfully`,
      updatedCount,
      actionTime: getCurrentIST().toISOString()
    });

  } catch (error) {
    console.error('Error updating offer:', error);
    return NextResponse.json(
      { error: 'Failed to update offer' },
      { status: 500 }
    );
  }
}

// Helper function to get all offers (simplified for mock implementation)
async function getAllOffers(): Promise<Offer[]> {
  const allOffers: Offer[] = [];
  
  // In a real implementation, this would scan all history:* keys
  // For now, we'll simulate some data or try to get from known patterns
  
  try {
    // This is a simplified approach - in reality we'd scan the database
    // For the mock implementation, we can't easily scan all keys
    // So we'll return empty array or implement a registry system
    
    // TODO: Implement proper key scanning for real Redis implementation
    console.log('Getting all offers - this would scan all history:* keys in production');
    
  } catch (error) {
    console.error('Error getting all offers:', error);
  }
  
  return allOffers;
}

// Helper function to mark an offer as consumed
async function markOfferAsConsumed(identifier: string, consumed: boolean): Promise<number> {
  const updatedCount = 0;
  
  try {
    // The identifier could be an email, verification ID, or unique offer ID
    // We need to search through histories to find matching offers
    
    // This is where we'd implement the actual update logic
    // For example, if identifier is an email:
    // const historyKey = `history:${identifier}`;
    // const userHistory = await kv.get(historyKey);
    // if (userHistory && Array.isArray(userHistory)) {
    //   // Update the latest offer or find by unique ID
    //   const updatedHistory = userHistory.map(offer => ({
    //     ...offer,
    //     consumed,
    //     consumedAt: consumed ? getCurrentIST().toISOString() : undefined
    //   }));
    //   await kv.set(historyKey, updatedHistory);
    //   updatedCount = userHistory.length;
    // }
    
    console.log(`Would mark offers for ${identifier} as consumed: ${consumed}`);
    
  } catch (error) {
    console.error('Error marking offer as consumed:', error);
  }
  
  return updatedCount;
}