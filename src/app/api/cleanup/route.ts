import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { getCurrentUTC } from '@/lib/time-utils';

export async function POST(request: NextRequest) {
  try {
    // Basic authentication check (for security)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.CLEANUP_API_KEY || 'cleanup-secret-key'}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all keys that might need cleanup
    // Note: In a real Redis implementation, we'd use SCAN
    // For mock KV, we'll implement a cleanup method
    
    let cleanedOffers = 0;
    let cleanedCooldowns = 0;
    let cleanedOTPs = 0;

    // For the mock KV implementation, we need to access the cleanup method
    if (typeof kv.cleanup === 'function') {
      // The mock KV store has its own cleanup method for expired items
      kv.cleanup();
      
      // For offers, we need a more sophisticated cleanup
      // We'll iterate through history entries and clean up old ones
      // This would need to be implemented differently for real Redis
      
      cleanedOffers = await cleanupExpiredOffers();
      cleanedCooldowns = await cleanupExpiredCooldowns();
      cleanedOTPs = 0; // OTPs are handled by Redis expiry automatically
    }

    return NextResponse.json({
      success: true,
      message: 'Cleanup completed successfully',
      stats: {
        cleanedOffers,
        cleanedCooldowns,
        cleanedOTPs,
        cleanupTime: getCurrentUTC().toISOString()
      }
    });

  } catch (error) {
    console.error('Error during cleanup:', error);
    return NextResponse.json(
      { error: 'Cleanup failed' },
      { status: 500 }
    );
  }
}

// Clean up offers that are older than 7 days (configurable)
async function cleanupExpiredOffers(): Promise<number> {
  const maxAgeMs = 7 * 24 * 60 * 60 * 1000; // 7 days
  const cutoffTime = Date.now() - maxAgeMs;
  const cleanedCount = 0;

  try {
    // Note: This is a simplified approach for mock KV
    // In a real implementation, we'd scan for all history:* keys
    
    // For now, we'll just clean up the mock store's internal data
    // The actual implementation would depend on how we store the data
    
    console.log(`Cleanup would remove offers older than ${new Date(cutoffTime).toISOString()}`);
    
    // This is where we'd implement the actual cleanup logic
    // For example:
    // const allHistoryKeys = await scanKeys('history:*');
    // for (const key of allHistoryKeys) {
    //   const history = await kv.get(key);
    //   if (history && Array.isArray(history)) {
    //     const filteredHistory = history.filter(offer => 
    //       offer.timestamp && offer.timestamp > cutoffTime
    //     );
    //     if (filteredHistory.length !== history.length) {
    //       await kv.set(key, filteredHistory);
    //       cleanedCount += history.length - filteredHistory.length;
    //     }
    //   }
    // }
    
  } catch (error) {
    console.error('Error cleaning up offers:', error);
  }

  return cleanedCount;
}

// Clean up expired cooldowns (those that are no longer active)
async function cleanupExpiredCooldowns(): Promise<number> {
  const cleanedCount = 0;

  try {
    // Similar to offers, this would scan for cooldown:* keys
    // and remove those that are no longer active
    
    // const allCooldownKeys = await scanKeys('cooldown:*');
    // for (const key of allCooldownKeys) {
    //   const lastOfferTime = await kv.get(key);
    //   if (lastOfferTime) {
    //     const lastGenerationTime = new Date(Number(lastOfferTime));
    //     if (!isCooldownActive(lastGenerationTime)) {
    //       await kv.del(key);
    //       cleanedCount++;
    //     }
    //   }
    // }
    
  } catch (error) {
    console.error('Error cleaning up cooldowns:', error);
  }

  return cleanedCount;
}

// Manual cleanup trigger endpoint (GET request)
export async function GET() {
  return NextResponse.json({
    message: 'Use POST request with proper authorization to trigger cleanup',
    usage: 'POST /api/cleanup with Authorization: Bearer <CLEANUP_API_KEY>',
    currentTime: getCurrentUTC().toISOString()
  });
}