import { handleAnalyzeSlideRoute } from '../src/server/guards';

export const config = {
  maxDuration: 60,
};

export default async function handler(req: any, res: any) {
  return handleAnalyzeSlideRoute(req, res);
}
