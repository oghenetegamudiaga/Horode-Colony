import crypto from 'crypto';
import { z } from 'zod';
import { config } from './config';
import { handleAnalyzeSlide, handleAnalyzeCrossSlide } from '../lib/analysisService';

export type SupportedImageType = 'image/jpeg' | 'image/png' | 'image/webp';

/**
 * Checks magic bytes of a buffer to verify JPEG, PNG, or WebP.
 * - JPEG: FFD8FF
 * - PNG: 89504E470D0A1A0A
 * - WebP: RIFF....WEBP
 */
export function validateImageMagicBytes(buffer: Buffer): { valid: boolean; type?: SupportedImageType } {
  if (!buffer || buffer.length < 3) {
    return { valid: false };
  }

  // JPEG: FFD8FF
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, type: 'image/jpeg' };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, type: 'image/png' };
  }

  // WebP: RIFF....WEBP (RIFF at 0..3, WEBP at 8..11)
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return { valid: true, type: 'image/webp' };
  }

  return { valid: false };
}

/**
 * Decodes base64 string, strips data URI prefixes, and validates size and magic bytes.
 */
export function decodeAndValidateImage(
  imageBase64: string,
  maxBytes: number = config.MAX_IMAGE_BYTES
): { valid: boolean; buffer?: Buffer; mimeType?: SupportedImageType; errorCode?: string } {
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return { valid: false, errorCode: 'INVALID_IMAGE' };
  }

  const commaIndex = imageBase64.indexOf(',');
  const cleanBase64 = commaIndex !== -1 ? imageBase64.slice(commaIndex + 1) : imageBase64;

  let buffer: Buffer;
  try {
    buffer = Buffer.from(cleanBase64, 'base64');
  } catch {
    return { valid: false, errorCode: 'INVALID_BASE64' };
  }

  if (buffer.length === 0) {
    return { valid: false, errorCode: 'EMPTY_IMAGE' };
  }

  if (buffer.length > maxBytes) {
    return { valid: false, errorCode: 'IMAGE_TOO_LARGE' };
  }

  const magic = validateImageMagicBytes(buffer);
  if (!magic.valid || !magic.type) {
    return { valid: false, errorCode: 'UNSUPPORTED_IMAGE_TYPE' };
  }

  return { valid: true, buffer, mimeType: magic.type };
}

/**
 * Strips control characters and newlines, collapses whitespace, and truncates text for prompt safety.
 */
export function sanitizePromptText(text: string | undefined | null, maxLength = 300): string {
  if (!text) return '';
  const noNewlines = text.replace(/[\r\n\t]+/g, ' ');
  const noControls = noNewlines.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
  const collapsed = noControls.replace(/\s+/g, ' ').trim();
  if (collapsed.length > maxLength) {
    return collapsed.slice(0, maxLength).trim();
  }
  return collapsed;
}

/**
 * Access check using crypto.timingSafeEqual.
 * If APP_ACCESS_CODE is not set in production, rejects everything.
 */
export function checkAccess(
  providedCode: string | undefined,
  expectedCode: string = config.APP_ACCESS_CODE,
  isProduction: boolean = config.isProduction
): { ok: boolean; status?: number; error?: { error: string; code: string } } {
  if (isProduction && (!expectedCode || expectedCode.trim().length === 0)) {
    return {
      ok: false,
      status: 401,
      error: { error: 'Access code required.', code: 'ACCESS_REQUIRED' },
    };
  }

  if (!expectedCode || expectedCode.trim().length === 0) {
    return { ok: true };
  }

  if (!providedCode || typeof providedCode !== 'string') {
    return {
      ok: false,
      status: 401,
      error: { error: 'Access code required.', code: 'ACCESS_REQUIRED' },
    };
  }

  const providedHash = crypto.createHash('sha256').update(providedCode).digest();
  const expectedHash = crypto.createHash('sha256').update(expectedCode).digest();

  if (!crypto.timingSafeEqual(providedHash, expectedHash)) {
    return {
      ok: false,
      status: 401,
      error: { error: 'Access code required.', code: 'ACCESS_REQUIRED' },
    };
  }

  return { ok: true };
}

/**
 * Checks if origin is allowed under strict CORS rules:
 * - Allowed APP_URL
 * - Localhost allowed in development only
 */
export function isAllowedOrigin(
  origin: string | undefined,
  allowedAppUrl: string = config.APP_URL,
  isProduction: boolean = config.isProduction
): boolean {
  if (!origin) return true;

  const cleanOrigin = origin.trim().replace(/\/+$/, '').toLowerCase();
  const cleanAppUrl = allowedAppUrl.trim().replace(/\/+$/, '').toLowerCase();

  if (cleanAppUrl && cleanOrigin === cleanAppUrl) {
    return true;
  }

  if (!isProduction) {
    try {
      const parsed = new URL(origin);
      if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
        return true;
      }
    } catch {
      return false;
    }
  }

  return false;
}

export function applyCorsHeaders(
  req: { headers: Record<string, string | string[] | undefined> },
  res: { setHeader: (name: string, value: string) => void },
  allowedAppUrl: string = config.APP_URL,
  isProduction: boolean = config.isProduction
): boolean {
  const rawOrigin = req.headers['origin'];
  const origin = Array.isArray(rawOrigin) ? rawOrigin[0] : rawOrigin;

  if (origin) {
    if (isAllowedOrigin(origin, allowedAppUrl, isProduction)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    } else {
      return false;
    }
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-access-code');
  return true;
}

// In-memory rate limiter
// Note: Serverless instances do not share memory, so this is a stopgap until Build 4.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  ip: string,
  route: 'analyze-slide' | 'analyze-cross-slide',
  limits = {
    'analyze-slide': { max: 20, windowMs: 60_000 },
    'analyze-cross-slide': { max: 10, windowMs: 60_000 },
  }
): { allowed: boolean; retryAfter?: number } {
  const key = `${route}:${ip}`;
  const now = Date.now();
  const routeLimit = limits[route];

  const record = rateLimitMap.get(key);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + routeLimit.windowMs });
    return { allowed: true };
  }

  if (record.count >= routeLimit.max) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  record.count += 1;
  return { allowed: true };
}

export function resetRateLimiter(): void {
  rateLimitMap.clear();
}

export function extractClientIp(req: {
  headers: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
  ip?: string;
}): string {
  const xForwardedFor = req.headers['x-forwarded-for'];
  if (xForwardedFor) {
    const raw = Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor;
    const firstIp = raw.split(',')[0].trim();
    if (firstIp) return firstIp;
  }
  const xRealIp = req.headers['x-real-ip'];
  if (xRealIp) {
    return Array.isArray(xRealIp) ? xRealIp[0] : xRealIp;
  }
  return req.ip || req.socket?.remoteAddress || '127.0.0.1';
}

// Request validation schemas
export const analyzeSlideRequestSchema = z.object({
  imageBase64: z.string().min(1),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']).optional(),
  strictness: z.enum(['relaxed', 'standard', 'strict']).default('standard'),
  languageVariant: z.enum(['british', 'american', 'nigerian']).default('british'),
  dictionaryTerms: z
    .array(
      z.object({
        term: z.string().max(100),
        note: z.string().max(300).optional(),
      })
    )
    .max(200)
    .default([]),
  ignoreRules: z
    .array(
      z.object({
        original: z.string().max(200),
        ruleType: z.string().optional(),
      })
    )
    .max(500)
    .default([]),
  slidePosition: z.number().int().min(1).max(config.MAX_SLIDES_PER_CHECK).default(1),
});

export const analyzeCrossSlideRequestSchema = z.object({
  slides: z
    .array(
      z.object({
        position: z.number().int().min(1).max(config.MAX_SLIDES_PER_CHECK),
        text: z.string().max(6000),
      })
    )
    .min(1)
    .max(config.MAX_SLIDES_PER_CHECK),
  strictness: z.enum(['relaxed', 'standard', 'strict']).default('standard'),
  languageVariant: z.enum(['british', 'american', 'nigerian']).default('british'),
  dictionaryTerms: z
    .array(
      z.object({
        term: z.string().max(100),
        note: z.string().max(300).optional(),
      })
    )
    .max(200)
    .default([]),
  ignoreRules: z
    .array(
      z.object({
        original: z.string().max(200),
        ruleType: z.string().optional(),
      })
    )
    .max(500)
    .default([]),
});

// Output validation schemas
export const modelSlideIssueSchema = z.object({
  type: z.string().default('spelling'),
  original: z.string().min(1),
  suggestion: z.string().default(''),
  reason: z.string().default('Flagged text issue'),
  confidence: z.enum(['high', 'medium', 'low']).catch('high'),
  bbox: z.array(z.number()).length(4).optional(),
});

export const modelUnreadableRegionSchema = z.object({
  description: z.string().default("Couldn't read this clearly"),
  bbox: z.array(z.number()).length(4).catch([0.1, 0.1, 0.3, 0.1]),
});

export const modelSlideOutputSchema = z.object({
  slide_text: z.string().default(''),
  unreadable_regions: z.array(modelUnreadableRegionSchema).default([]),
  issues: z.array(modelSlideIssueSchema).default([]),
});

export const modelCrossIssueSchema = z.object({
  type: z.string().default('consistency'),
  original: z.string().min(1),
  suggestion: z.string().default(''),
  reason: z.string().default('Cross-slide inconsistency'),
  confidence: z.enum(['high', 'medium', 'low']).catch('high'),
  affected_slides: z.array(z.number().int()).default([1, 2]),
});

export const modelCrossOutputSchema = z.object({
  issues: z.array(modelCrossIssueSchema).default([]),
});

/**
 * Shared route handler for POST /api/analyze-slide used by both api/analyze-slide.ts and server.ts
 */
export async function handleAnalyzeSlideRoute(req: any, res: any): Promise<void> {
  const corsOk = applyCorsHeaders(req, res);
  if (!corsOk) {
    return res.status(403).json({ error: 'Origin not allowed.', code: 'FORBIDDEN_ORIGIN' });
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed.', code: 'METHOD_NOT_ALLOWED' });
  }

  // JSON body size cap: reject over MAX_IMAGE_BYTES * 1.4 with 413
  const maxBodyBytes = Math.floor(config.MAX_IMAGE_BYTES * 1.4);
  const contentLength = Number(req.headers['content-length'] || 0);
  if (contentLength > maxBodyBytes) {
    return res.status(413).json({ error: 'Payload too large.', code: 'PAYLOAD_TOO_LARGE' });
  }

  // Access check
  const accessHeader = req.headers['x-access-code'];
  const accessCode = Array.isArray(accessHeader) ? accessHeader[0] : accessHeader;
  const accessResult = checkAccess(accessCode);
  if (!accessResult.ok) {
    return res.status(accessResult.status || 401).json(accessResult.error);
  }

  // Rate limiter check
  const ip = extractClientIp(req);
  const rateResult = checkRateLimit(ip, 'analyze-slide');
  if (!rateResult.allowed) {
    res.setHeader('Retry-After', String(rateResult.retryAfter || 60));
    return res.status(429).json({ error: 'Too many requests. Please try again shortly.', code: 'RATE_LIMITED' });
  }

  // Schema validation
  const parseResult = analyzeSlideRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid request payload.', code: 'INVALID_PAYLOAD' });
  }

  const validatedParams = parseResult.data;
  const imgCheck = decodeAndValidateImage(validatedParams.imageBase64, config.MAX_IMAGE_BYTES);
  if (!imgCheck.valid) {
    if (imgCheck.errorCode === 'IMAGE_TOO_LARGE') {
      return res.status(413).json({ error: 'Image too large.', code: 'IMAGE_TOO_LARGE' });
    }
    return res.status(400).json({ error: 'Invalid or unsupported image.', code: 'INVALID_IMAGE' });
  }

  try {
    const result = await handleAnalyzeSlide({
      ...validatedParams,
      mimeType: imgCheck.mimeType,
    });
    return res.status(200).json(result);
  } catch (err: any) {
    // Log server-side WITHOUT slide text, image data, dictionary content, or API key
    console.error('Slide analysis failed on server:', err?.name || 'Error');
    return res.status(500).json({
      error: "Slide analysis didn't finish. Try again.",
      code: 'ANALYSIS_FAILED',
    });
  }
}

/**
 * Shared route handler for POST /api/analyze-cross-slide used by both api/analyze-cross-slide.ts and server.ts
 */
export async function handleAnalyzeCrossSlideRoute(req: any, res: any): Promise<void> {
  const corsOk = applyCorsHeaders(req, res);
  if (!corsOk) {
    return res.status(403).json({ error: 'Origin not allowed.', code: 'FORBIDDEN_ORIGIN' });
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed.', code: 'METHOD_NOT_ALLOWED' });
  }

  // JSON body size cap
  const maxBodyBytes = Math.floor(config.MAX_IMAGE_BYTES * 1.4);
  const contentLength = Number(req.headers['content-length'] || 0);
  if (contentLength > maxBodyBytes) {
    return res.status(413).json({ error: 'Payload too large.', code: 'PAYLOAD_TOO_LARGE' });
  }

  // Access check
  const accessHeader = req.headers['x-access-code'];
  const accessCode = Array.isArray(accessHeader) ? accessHeader[0] : accessHeader;
  const accessResult = checkAccess(accessCode);
  if (!accessResult.ok) {
    return res.status(accessResult.status || 401).json(accessResult.error);
  }

  // Rate limiter check
  const ip = extractClientIp(req);
  const rateResult = checkRateLimit(ip, 'analyze-cross-slide');
  if (!rateResult.allowed) {
    res.setHeader('Retry-After', String(rateResult.retryAfter || 60));
    return res.status(429).json({ error: 'Too many requests. Please try again shortly.', code: 'RATE_LIMITED' });
  }

  // Schema validation
  const parseResult = analyzeCrossSlideRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid request payload.', code: 'INVALID_PAYLOAD' });
  }

  try {
    const result = await handleAnalyzeCrossSlide(parseResult.data);
    return res.status(200).json(result);
  } catch (err: any) {
    // Log server-side WITHOUT slide text, image data, dictionary content, or API key
    console.error('Cross-slide analysis failed on server:', err?.name || 'Error');
    return res.status(500).json({
      error: "Cross-slide analysis didn't finish. Try again.",
      code: 'ANALYSIS_FAILED',
    });
  }
}
