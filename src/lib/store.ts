import {
  CheckRecord,
  ClientRecord,
  CrossSlideIssue,
  DictionaryTerm,
  IgnoreRule,
  IssueStatus,
  SlideData,
  SlideIssue,
  StrictnessLevel,
} from '../types';
import { generateSampleApexCarousel, generateSampleCleanCarousel } from './goldenSet';

const STORAGE_KEYS = {
  CLIENTS: 'hp_clients',
  CHECKS: 'hp_checks',
  DICTIONARY: 'hp_dictionary',
  IGNORE_RULES: 'hp_ignore_rules',
  THEME: 'hp_theme',
  SIDEBAR: 'hp_sidebar_collapsed',
};

// Initial Seed Data
const DEFAULT_CLIENTS: ClientRecord[] = [
  {
    id: 'client_apex',
    name: 'Apex Capital',
    defaultStrictness: 'standard',
    languageVariant: 'british',
    toneNote: 'Sharp institutional finance, authoritative, modern fintech tone.',
    retentionDays: 30,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    lastCheckDate: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'client_horode',
    name: 'Horode Design Studio',
    defaultStrictness: 'strict',
    languageVariant: 'british',
    toneNote: 'Quiet, premium craft, minimalist design systems.',
    retentionDays: 60,
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    lastCheckDate: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'client_aura',
    name: 'Aura Skincare',
    defaultStrictness: 'standard',
    languageVariant: 'american',
    toneNote: 'Warm, minimalist, conscious beauty.',
    retentionDays: 30,
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    lastCheckDate: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'client_lumina',
    name: 'Lumina Health',
    defaultStrictness: 'relaxed',
    languageVariant: 'nigerian',
    toneNote: 'Accessible preventative wellness, warm Nigerian healthcare context.',
    retentionDays: 30,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    lastCheckDate: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
];

const DEFAULT_DICTIONARY: DictionaryTerm[] = [
  {
    id: 'dict_1',
    clientId: 'client_apex',
    term: 'Apex Capital',
    note: 'Primary brand name',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dict_2',
    clientId: 'client_apex',
    term: 'Horizons Ventures',
    note: 'Lead investor',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dict_3',
    clientId: 'client_apex',
    term: 'FinTech',
    note: 'CamelCase styling',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dict_4',
    clientId: 'client_horode',
    term: 'Horode',
    note: 'Brand studio name',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dict_5',
    clientId: 'client_horode',
    term: '@horodedesign',
    note: 'Social handle',
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_IGNORE_RULES: IgnoreRule[] = [
  {
    id: 'ign_1',
    clientId: 'client_apex',
    original: 'fee-free',
    ruleType: 'exact',
    createdAt: new Date().toISOString(),
  },
];

function seedDefaultChecks(): CheckRecord[] {
  // Pre-configured checks
  const apexSlides = generateSampleApexCarousel();
  const cleanSlides = generateSampleCleanCarousel();

  const check1: CheckRecord = {
    id: 'chk_apex_series_a',
    clientId: 'client_apex',
    clientName: 'Apex Capital',
    title: 'Series A Funding Carousel',
    strictness: 'standard',
    languageVariant: 'british',
    status: 'completed',
    slideCount: 4,
    issueCount: 5,
    resolvedCount: 2,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    costEstimate: '$0.006',
    slides: [
      {
        id: 's_apex_1',
        checkId: 'chk_apex_series_a',
        position: 1,
        name: '01_Apex_Fintech_Hero.png',
        imageUrl: apexSlides[0]?.imageUrl || '',
        status: 'done',
        slideText: 'APEX CAPITAL ANNOUNCEMENT 1 / 4\nWe are thrilled to recieve our Series A funding\nWith $12M led by Horizons Ventures, our next chapter begins today.\nApex Capital • 12th Nov 2026',
        unreadableRegions: [],
        issues: [
          {
            id: 'iss_apex_1',
            slideId: 's_apex_1',
            slidePosition: 1,
            type: 'spelling',
            original: 'recieve',
            suggestion: 'receive',
            reason: "Misspelling of 'receive'.",
            confidence: 'high',
            bbox: [0.38, 0.28, 0.16, 0.05],
            status: 'open',
            scope: 'slide',
          },
        ],
      },
      {
        id: 's_apex_2',
        checkId: 'chk_apex_series_a',
        position: 2,
        name: '02_Apex_Fintech_Mission.png',
        imageUrl: apexSlides[1]?.imageUrl || '',
        status: 'done',
        slideText: 'OUR MISSION & VISION 2 / 4\nBuilding the the infrastructure for modern cross-border finance\nInstant liquidity, zero foreign exchange delays, and unified compliance.\nApex Capital • November 12, 2026',
        unreadableRegions: [],
        issues: [
          {
            id: 'iss_apex_2',
            slideId: 's_apex_2',
            slidePosition: 2,
            type: 'repeated_word',
            original: 'the the',
            suggestion: 'the',
            reason: "Duplicated consecutive word 'the'.",
            confidence: 'high',
            bbox: [0.25, 0.28, 0.12, 0.05],
            status: 'open',
            scope: 'slide',
          },
        ],
      },
      {
        id: 's_apex_3',
        checkId: 'chk_apex_series_a',
        position: 3,
        name: '03_Apex_Fintech_Product.png',
        imageUrl: apexSlides[2]?.imageUrl || '',
        status: 'done',
        slideText: 'INTRODUCING APEX FLOW 3 / 4\nYour going to love our new merchant checkout experience\nSettlements that take seconds instead of business days across 40 countries.\nApex Capital • 12/11/2026\nFine print terms: Subject to local central bank jurisdiction and tier-2 partner clearance.',
        unreadableRegions: [
          {
            description: "Couldn't read this clearly. Low contrast against dark background.",
            bbox: [0.09, 0.67, 0.51, 0.08],
          },
        ],
        issues: [
          {
            id: 'iss_apex_3',
            slideId: 's_apex_3',
            slidePosition: 3,
            type: 'grammar',
            original: 'Your going',
            suggestion: "You're going",
            reason: "Grammar slip: use the contraction 'You're' instead of possessive 'Your'.",
            confidence: 'high',
            bbox: [0.09, 0.28, 0.24, 0.05],
            status: 'accepted',
            scope: 'slide',
          },
        ],
      },
      {
        id: 's_apex_4',
        checkId: 'chk_apex_series_a',
        position: 4,
        name: '04_Apex_Fintech_CallToAction.png',
        imageUrl: apexSlides[3]?.imageUrl || '',
        status: 'done',
        slideText: 'JOIN THE BETA 4 / 4\nTry APEX today and get 3 months fee-free processing\nSign up at apexcapital.co or DM us for early developer sandbox access.\nAPEX Capital • 12 November 2026',
        unreadableRegions: [],
        issues: [
          {
            id: 'iss_apex_4',
            slideId: 's_apex_4',
            slidePosition: 4,
            type: 'consistency',
            original: 'APEX Capital',
            suggestion: 'Apex Capital',
            reason: "Brand casing drift: 'APEX Capital' versus 'Apex Capital' on earlier slides.",
            confidence: 'medium',
            bbox: [0.09, 0.90, 0.22, 0.04],
            status: 'accepted',
            scope: 'slide',
          },
        ],
      },
    ],
    crossSlideIssues: [
      {
        id: 'cross_1',
        checkId: 'chk_apex_series_a',
        type: 'format_inconsistency',
        original: '12th Nov vs November 12 vs 12/11/2026',
        suggestion: 'Choose one unified date format across all slides (e.g. 12 November 2026)',
        reason: 'Date formatting style changes between Slide 1 (12th Nov), Slide 2 (November 12), and Slide 3 (12/11/2026).',
        confidence: 'high',
        affectedSlidePositions: [1, 2, 3, 4],
        status: 'open',
      },
    ],
  };

  const check2: CheckRecord = {
    id: 'chk_horode_showcase',
    clientId: 'client_horode',
    clientName: 'Horode Design Studio',
    title: 'Brand Systems Manifesto',
    strictness: 'strict',
    languageVariant: 'british',
    status: 'completed',
    slideCount: 3,
    issueCount: 0,
    resolvedCount: 0,
    createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    costEstimate: '$0.004',
    slides: [
      {
        id: 's_horode_1',
        checkId: 'chk_horode_showcase',
        position: 1,
        name: '01_Horode_Identity_Cover.png',
        imageUrl: cleanSlides[0]?.imageUrl || '',
        status: 'done',
        slideText: 'HORODE DESIGN STUDIO 1 / 3\nSystems that scale with ambitious founders\nBrand strategy, design engineering, and digital craft.\nHorode Studio • horodedesign.com',
        unreadableRegions: [],
        issues: [],
      },
      {
        id: 's_horode_2',
        checkId: 'chk_horode_showcase',
        position: 2,
        name: '02_Horode_Identity_Principles.png',
        imageUrl: cleanSlides[1]?.imageUrl || '',
        status: 'done',
        slideText: 'DESIGN PHILOSOPHY 2 / 3\nQuiet clarity over loud decoration\nEvery shape, line, and token serves a direct purpose.\nHorode Studio • horodedesign.com',
        unreadableRegions: [],
        issues: [],
      },
      {
        id: 's_horode_3',
        checkId: 'chk_horode_showcase',
        position: 3,
        name: '03_Horode_Identity_Deliver.png',
        imageUrl: cleanSlides[2]?.imageUrl || '',
        status: 'done',
        slideText: 'FINAL DELIVERY 3 / 3\nDelivered ready for production\nFigma tokens, accessible components, and comprehensive design systems.\nHorode Studio • horodedesign.com',
        unreadableRegions: [],
        issues: [],
      },
    ],
    crossSlideIssues: [],
  };

  return [check1, check2];
}

class Store {
  private clients: ClientRecord[] = [];
  private checks: CheckRecord[] = [];
  private dictionary: DictionaryTerm[] = [];
  private ignoreRules: IgnoreRule[] = [];
  private theme: 'dark' | 'light' | 'system' = 'dark';
  private sidebarCollapsed = false;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    try {
      const savedClients = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      if (savedClients) {
        this.clients = JSON.parse(savedClients);
      } else {
        this.clients = DEFAULT_CLIENTS;
        this.saveClients();
      }

      const savedDict = localStorage.getItem(STORAGE_KEYS.DICTIONARY);
      if (savedDict) {
        this.dictionary = JSON.parse(savedDict);
      } else {
        this.dictionary = DEFAULT_DICTIONARY;
        this.saveDictionary();
      }

      const savedIgnore = localStorage.getItem(STORAGE_KEYS.IGNORE_RULES);
      if (savedIgnore) {
        this.ignoreRules = JSON.parse(savedIgnore);
      } else {
        this.ignoreRules = DEFAULT_IGNORE_RULES;
        this.saveIgnoreRules();
      }

      const savedChecks = localStorage.getItem(STORAGE_KEYS.CHECKS);
      if (savedChecks) {
        this.checks = JSON.parse(savedChecks);
      } else {
        this.checks = seedDefaultChecks();
        this.saveChecks();
      }

      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) as any;
      if (savedTheme) {
        this.theme = savedTheme;
      }
      this.applyTheme(this.theme);

      const savedSidebar = localStorage.getItem(STORAGE_KEYS.SIDEBAR);
      if (savedSidebar !== null) {
        this.sidebarCollapsed = savedSidebar === 'true';
      }
    } catch (e) {
      console.error('Failed to load store data:', e);
      this.clients = DEFAULT_CLIENTS;
      this.checks = seedDefaultChecks();
      this.dictionary = DEFAULT_DICTIONARY;
      this.ignoreRules = DEFAULT_IGNORE_RULES;
    }
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  private saveClients() {
    try {
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(this.clients));
    } catch {}
    this.notify();
  }

  private saveChecks() {
    try {
      localStorage.setItem(STORAGE_KEYS.CHECKS, JSON.stringify(this.checks));
    } catch {}
    this.notify();
  }

  private saveDictionary() {
    try {
      localStorage.setItem(STORAGE_KEYS.DICTIONARY, JSON.stringify(this.dictionary));
    } catch {}
    this.notify();
  }

  private saveIgnoreRules() {
    try {
      localStorage.setItem(STORAGE_KEYS.IGNORE_RULES, JSON.stringify(this.ignoreRules));
    } catch {}
    this.notify();
  }

  // Getters
  getClients() {
    return this.clients;
  }

  getClient(id: string) {
    return this.clients.find(c => c.id === id);
  }

  getChecks() {
    return this.checks;
  }

  getCheck(id: string) {
    return this.checks.find(c => c.id === id);
  }

  getDictionaryForClient(clientId: string) {
    return this.dictionary.filter(d => d.clientId === clientId);
  }

  getIgnoreRulesForClient(clientId: string) {
    return this.ignoreRules.filter(r => r.clientId === clientId);
  }

  getTheme() {
    return this.theme;
  }

  isSidebarCollapsed() {
    return this.sidebarCollapsed;
  }

  // Client Mutations
  addClient(data: Omit<ClientRecord, 'id' | 'createdAt' | 'lastCheckDate'>) {
    const newClient: ClientRecord = {
      ...data,
      id: `client_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.clients.unshift(newClient);
    this.saveClients();
    return newClient;
  }

  updateClient(id: string, updates: Partial<ClientRecord>) {
    this.clients = this.clients.map(c => (c.id === id ? { ...c, ...updates } : c));
    this.saveClients();
  }

  deleteClient(id: string) {
    this.clients = this.clients.filter(c => c.id !== id);
    this.checks = this.checks.filter(c => c.clientId !== id);
    this.dictionary = this.dictionary.filter(d => d.clientId !== id);
    this.ignoreRules = this.ignoreRules.filter(r => r.clientId !== id);
    this.saveClients();
    this.saveChecks();
    this.saveDictionary();
    this.saveIgnoreRules();
  }

  // Dictionary Mutations
  addDictionaryTerm(clientId: string, term: string, note?: string) {
    const trimmed = term.trim();
    if (!trimmed) return;
    const newTerm: DictionaryTerm = {
      id: `dict_${Date.now()}`,
      clientId,
      term: trimmed,
      note: note?.trim(),
      createdAt: new Date().toISOString(),
    };
    this.dictionary.unshift(newTerm);
    this.saveDictionary();
    return newTerm;
  }

  removeDictionaryTerm(id: string) {
    this.dictionary = this.dictionary.filter(d => d.id !== id);
    this.saveDictionary();
  }

  // Ignore Rules Mutations
  addIgnoreRule(clientId: string, original: string) {
    const trimmed = original.trim();
    if (!trimmed) return;
    const newRule: IgnoreRule = {
      id: `ign_${Date.now()}`,
      clientId,
      original: trimmed,
      ruleType: 'exact',
      createdAt: new Date().toISOString(),
    };
    this.ignoreRules.unshift(newRule);
    this.saveIgnoreRules();
    return newRule;
  }

  removeIgnoreRule(id: string) {
    this.ignoreRules = this.ignoreRules.filter(r => r.id !== id);
    this.saveIgnoreRules();
  }

  // Checks Mutations
  addCheck(check: CheckRecord) {
    this.checks.unshift(check);
    // Update client's lastCheckDate
    this.updateClient(check.clientId, {
      lastCheckDate: check.createdAt,
    });
    this.saveChecks();
    return check;
  }

  updateCheck(id: string, updates: Partial<CheckRecord>) {
    this.checks = this.checks.map(c => {
      if (c.id !== id) return c;
      const updated = { ...c, ...updates };
      // Recalculate issue counts
      let totalIssues = updated.crossSlideIssues.length;
      let resolvedCount = updated.crossSlideIssues.filter(i => i.status !== 'open').length;

      updated.slides.forEach(s => {
        totalIssues += s.issues.length;
        resolvedCount += s.issues.filter(i => i.status !== 'open').length;
      });

      updated.issueCount = totalIssues;
      updated.resolvedCount = resolvedCount;
      return updated;
    });
    this.saveChecks();
  }

  deleteCheck(id: string) {
    this.checks = this.checks.filter(c => c.id !== id);
    this.saveChecks();
  }

  updateIssueStatus(
    checkId: string,
    issueId: string,
    status: IssueStatus,
    scope: 'slide' | 'cross_slide'
  ) {
    const check = this.getCheck(checkId);
    if (!check) return;

    if (scope === 'cross_slide') {
      const crossSlideIssues = check.crossSlideIssues.map(i =>
        i.id === issueId ? { ...i, status } : i
      );
      this.updateCheck(checkId, { crossSlideIssues });
    } else {
      const slides = check.slides.map(slide => ({
        ...slide,
        issues: slide.issues.map(iss =>
          iss.id === issueId ? { ...iss, status } : iss
        ),
      }));
      this.updateCheck(checkId, { slides });
    }
  }

  setTheme(theme: 'dark' | 'light' | 'system') {
    this.theme = theme;
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch {}
    this.applyTheme(theme);
    this.notify();
  }

  private applyTheme(theme: 'dark' | 'light' | 'system') {
    if (typeof document === 'undefined') return;
    const isDark =
      theme === 'dark' ||
      (theme === 'system' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    try {
      localStorage.setItem(STORAGE_KEYS.SIDEBAR, String(this.sidebarCollapsed));
    } catch {}
    this.notify();
  }

  setSidebarCollapsed(collapsed: boolean) {
    this.sidebarCollapsed = collapsed;
    try {
      localStorage.setItem(STORAGE_KEYS.SIDEBAR, String(collapsed));
    } catch {}
    this.notify();
  }
}

export const store = new Store();
