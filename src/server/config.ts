import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;

export const envSchema = z
  .object({
    GEMINI_API_KEY: z.string().default(''),
    ANALYSIS_MODELS: z.string().default(''),
    APP_ACCESS_CODE: z.string().default(''),
    APP_URL: z.string().default(''),
    MAX_SLIDES_PER_CHECK: z.coerce.number().int().positive().default(30),
    MAX_IMAGE_BYTES: z.coerce.number().int().positive().default(4000000),
  })
  .superRefine((data, ctx) => {
    if (isProduction) {
      if (!data.GEMINI_API_KEY || data.GEMINI_API_KEY.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['GEMINI_API_KEY'],
          message: 'GEMINI_API_KEY is required in production',
        });
      }
      if (!data.ANALYSIS_MODELS || data.ANALYSIS_MODELS.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['ANALYSIS_MODELS'],
          message: 'ANALYSIS_MODELS is required in production',
        });
      }
      if (!data.APP_ACCESS_CODE || data.APP_ACCESS_CODE.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['APP_ACCESS_CODE'],
          message: 'APP_ACCESS_CODE is required in production',
        });
      }
    }
  });

export function loadConfig(env: NodeJS.ProcessEnv = process.env) {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    const errorMessages = result.error.issues
      .map(issue => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Server configuration validation failed: ${errorMessages}`);
  }
  const raw = result.data;
  return {
    GEMINI_API_KEY: raw.GEMINI_API_KEY.trim(),
    ANALYSIS_MODELS: raw.ANALYSIS_MODELS
      ? raw.ANALYSIS_MODELS.split(',').map(m => m.trim()).filter(Boolean)
      : [],
    APP_ACCESS_CODE: raw.APP_ACCESS_CODE.trim(),
    APP_URL: raw.APP_URL.trim(),
    MAX_SLIDES_PER_CHECK: raw.MAX_SLIDES_PER_CHECK,
    MAX_IMAGE_BYTES: raw.MAX_IMAGE_BYTES,
    isProduction,
  };
}

export const config = loadConfig();
export type Config = typeof config;

