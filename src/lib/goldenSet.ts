/**
 * Helper to generate crisp, high-fidelity slide canvas images for sample carousels.
 * Generates data URLs for carousels with intentional, realistic typos/grammar/consistency slips.
 */

export function createSlideImage(config: {
  width?: number;
  height?: number;
  backgroundColor: string;
  tagline: string;
  headline: string;
  body: string;
  footer: string;
  slideNumber: number;
  totalSlides: number;
  accentColor?: string;
  badge?: string;
  unreadableBox?: { x: number; y: number; w: number; h: number; text: string };
}): string {
  const width = config.width || 1080;
  const height = config.height || 1080;

  if (typeof document === 'undefined') {
    return '';
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = config.backgroundColor;
  ctx.fillRect(0, 0, width, height);

  // Subtle background aesthetic grid / glow
  const gradient = ctx.createRadialGradient(width * 0.8, height * 0.2, 50, width * 0.8, height * 0.2, 500);
  gradient.addColorStop(0, config.accentColor ? `${config.accentColor}25` : 'rgba(35, 131, 226, 0.15)');
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Decorative border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 2;
  ctx.strokeRect(60, 60, width - 120, height - 120);

  // Tagline & Slide Number
  ctx.font = '600 24px Inter, sans-serif';
  ctx.fillStyle = config.accentColor || '#2383E2';
  ctx.fillText(config.tagline.toUpperCase(), 100, 130);

  ctx.font = '500 22px Inter, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.textAlign = 'right';
  ctx.fillText(`${config.slideNumber} / ${config.totalSlides}`, width - 100, 130);
  ctx.textAlign = 'left';

  // Badge if present
  if (config.badge) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(100, 160, 180, 36);
    ctx.font = '500 16px Inter, sans-serif';
    ctx.fillStyle = '#EBEBEB';
    ctx.fillText(config.badge, 120, 184);
  }

  // Headline
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 58px Inter, sans-serif';
  const headlineWords = config.headline.split(' ');
  let line = '';
  let y = 300;
  const maxWidth = width - 200;

  for (let n = 0; n < headlineWords.length; n++) {
    const testLine = line + headlineWords[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, 100, y);
      line = headlineWords[n] + ' ';
      y += 72;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, 100, y);

  // Body
  y += 50;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.font = '400 32px Inter, sans-serif';
  const bodyWords = config.body.split(' ');
  line = '';
  for (let n = 0; n < bodyWords.length; n++) {
    const testLine = line + bodyWords[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, 100, y);
      line = bodyWords[n] + ' ';
      y += 48;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, 100, y);

  // Optional unreadable low-contrast or noisy region for testing FR-08
  if (config.unreadableBox) {
    const box = config.unreadableBox;
    // Draw busy background
    ctx.fillStyle = '#1e242b';
    ctx.fillRect(box.x, box.y, box.w, box.h);
    // Draw low contrast text
    ctx.fillStyle = '#262f38'; // Very low contrast against #1e242b
    ctx.font = '400 20px Inter, sans-serif';
    ctx.fillText(box.text, box.x + 15, box.y + 40);
  }

  // Footer
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.font = '500 22px Inter, sans-serif';
  ctx.fillText(config.footer, 100, height - 100);

  return canvas.toDataURL('image/png');
}

export function generateSampleApexCarousel(): Array<{
  name: string;
  imageUrl: string;
}> {
  return [
    {
      name: '01_Apex_Fintech_Hero.png',
      imageUrl: createSlideImage({
        backgroundColor: '#0F172A',
        accentColor: '#38BDF8',
        tagline: 'Apex Capital Announcement',
        headline: 'We are thrilled to recieve our Series A funding',
        body: 'With $12M led by Horizons Ventures, our next chapter begins today.',
        footer: 'Apex Capital • 12th Nov 2026',
        slideNumber: 1,
        totalSlides: 4,
      }),
    },
    {
      name: '02_Apex_Fintech_Mission.png',
      imageUrl: createSlideImage({
        backgroundColor: '#0F172A',
        accentColor: '#38BDF8',
        tagline: 'Our Mission & Vision',
        headline: 'Building the the infrastructure for modern cross-border finance',
        body: 'Instant liquidity, zero foreign exchange delays, and unified compliance.',
        footer: 'Apex Capital • November 12, 2026',
        slideNumber: 2,
        totalSlides: 4,
      }),
    },
    {
      name: '03_Apex_Fintech_Product.png',
      imageUrl: createSlideImage({
        backgroundColor: '#0F172A',
        accentColor: '#38BDF8',
        tagline: 'Introducing Apex Flow',
        headline: 'Your going to love our new merchant checkout experience',
        body: 'Settlements that take seconds instead of business days across 40 countries.',
        footer: 'Apex Capital • 12/11/2026',
        slideNumber: 3,
        totalSlides: 4,
        unreadableBox: {
          x: 100,
          y: 720,
          w: 550,
          h: 80,
          text: 'Fine print terms: Subject to local central bank jurisdiction and tier-2 partner clearance.',
        },
      }),
    },
    {
      name: '04_Apex_Fintech_CallToAction.png',
      imageUrl: createSlideImage({
        backgroundColor: '#0F172A',
        accentColor: '#38BDF8',
        tagline: 'Join the Beta',
        headline: 'Try APEX today and get 3 months fee-free processing',
        body: 'Sign up at apexcapital.co or DM us for early developer sandbox access.',
        footer: 'APEX Capital • 12 November 2026',
        slideNumber: 4,
        totalSlides: 4,
      }),
    },
  ];
}

export function generateSampleCleanCarousel(): Array<{
  name: string;
  imageUrl: string;
}> {
  return [
    {
      name: '01_Horode_Identity_Cover.png',
      imageUrl: createSlideImage({
        backgroundColor: '#161616',
        accentColor: '#2383E2',
        tagline: 'Horode Design Studio',
        headline: 'Systems that scale with ambitious founders',
        body: 'Brand strategy, design engineering, and digital craft.',
        footer: 'Horode Studio • horodedesign.com',
        slideNumber: 1,
        totalSlides: 3,
      }),
    },
    {
      name: '02_Horode_Identity_Principles.png',
      imageUrl: createSlideImage({
        backgroundColor: '#161616',
        accentColor: '#2383E2',
        tagline: 'Design Philosophy',
        headline: 'Quiet clarity over loud decoration',
        body: 'Every shape, line, and token serves a direct purpose.',
        footer: 'Horode Studio • horodedesign.com',
        slideNumber: 2,
        totalSlides: 3,
      }),
    },
    {
      name: '03_Horode_Identity_Deliver.png',
      imageUrl: createSlideImage({
        backgroundColor: '#161616',
        accentColor: '#2383E2',
        tagline: 'Final Delivery',
        headline: 'Delivered ready for production',
        body: 'Figma tokens, accessible components, and comprehensive design systems.',
        footer: 'Horode Studio • horodedesign.com',
        slideNumber: 3,
        totalSlides: 3,
      }),
    },
  ];
}
