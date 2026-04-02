import crypto from 'crypto';

const SECRET = process.env.MARKETING_SECRET || 'richse-marketing-secret-key-2026';

export function signToken(payload: object, expiresHash?: string): string {
  const data = JSON.stringify({ ...payload, h: expiresHash });
  const hmac = crypto.createHmac('sha256', SECRET);
  hmac.update(data);
  const signature = hmac.digest('hex');
  
  // Return base64 encoded payload + signature
  return Buffer.from(JSON.stringify({ d: data, s: signature })).toString('base64url');
}

export interface TrackingPayload {
  c: string; // campaignId
  e: string; // email
  h?: string; // extra hash
}

export function verifyToken(token: string): TrackingPayload | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64url').toString('utf8'));
    const { d, s } = decoded;
    
    const hmac = crypto.createHmac('sha256', SECRET);
    hmac.update(d);
    const expectedSignature = hmac.digest('hex');
    
    if (s === expectedSignature) {
      return JSON.parse(d);
    }
  } catch (e) {
    console.error('Token verification failed:', e);
  }
  return null;
}
