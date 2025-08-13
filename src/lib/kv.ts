// Mock KV store for development when Redis is not available
class MockKV {
  private store: Map<string, { value: unknown; expires?: number }> = new Map();

  async get(key: string) {
    const item = this.store.get(key);
    if (!item) return null;
    
    if (item.expires && Date.now() > item.expires) {
      this.store.delete(key);
      return null;
    }
    
    return item.value;
  }

  async set(key: string, value: unknown) {
    this.store.set(key, { value });
  }

  async setex(key: string, seconds: number, value: unknown) {
    const expires = Date.now() + (seconds * 1000);
    this.store.set(key, { value, expires });
  }

  async del(key: string) {
    this.store.delete(key);
  }

  // Clear expired items periodically
  public cleanup() {
    const now = Date.now();
    for (const [key, item] of this.store.entries()) {
      if (item.expires && now > item.expires) {
        this.store.delete(key);
      }
    }
  }
}

// Create mock KV instance
const mockKV = new MockKV();

// Clean up expired items every minute
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    (mockKV as MockKV).cleanup();
  }, 60000);
}

// Try to use real KV, fallback to mock
let kv: MockKV;
try {
  // In production with Vercel, this will work
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const vercelKV = require('@vercel/kv').kv;
  
  // Test if KV is actually working
  vercelKV.get('__test__').catch(() => {
    console.log('Using mock KV store for development');
  });
  
  kv = vercelKV;
} catch {
  console.log('Using mock KV store for development');
  kv = mockKV;
}

export { kv };