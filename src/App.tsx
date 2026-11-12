import React, { useState, useEffect } from 'react';
import { store } from './lib/store';
import { Sidebar } from './components/Sidebar';
import { CommandPalette } from './components/CommandPalette';
import { ShortcutsModal } from './components/ShortcutsModal';
import { Toast, ToastMessage } from './components/Toast';
import { HomeView } from './views/HomeView';
import { NewCheckView } from './views/NewCheckView';
import { ResultsView } from './views/ResultsView';
import { ClientsListView } from './views/ClientsListView';
import { ClientDetailView } from './views/ClientDetailView';
import { AddClientView } from './views/AddClientView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  const [, setTick] = useState(0);

  // Subscribe to central store changes
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setTick(t => t + 1);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Simple, robust client-side routing
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.hash ? window.location.hash.replace('#', '') : '/';
  });

  const navigate = (route: string) => {
    window.location.hash = route;
    setCurrentRoute(route);
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash ? window.location.hash.replace('#', '') : '/';
      setCurrentRoute(hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Command Palette & Shortcuts Modal
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (text: string, undoAction?: () => void) => {
    setToast({
      id: `t_${Date.now()}`,
      text,
      undoAction,
    });
    setTimeout(() => {
      setToast(prev => (prev?.text === text ? null : prev));
    }, 4500);
  };

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setIsShortcutsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Route parsing
  let activeCheckId: string | null = null;
  let activeClientId: string | null = null;
  let newCheckClientId: string | undefined = undefined;

  if (currentRoute.startsWith('/checks/') && currentRoute !== '/checks/new') {
    activeCheckId = currentRoute.replace('/checks/', '').split('?')[0];
  } else if (currentRoute.startsWith('/checks/new')) {
    const params = new URLSearchParams(currentRoute.split('?')[1] || '');
    newCheckClientId = params.get('clientId') || undefined;
  } else if (currentRoute.startsWith('/clients/') && currentRoute !== '/clients/new') {
    activeClientId = currentRoute.replace('/clients/', '').split('?')[0];
  }

  const activeCheck = activeCheckId ? store.getCheck(activeCheckId) : null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#191919] text-[#EBEBEB] font-sans">
      {/* Sidebar (260px collapsible) */}
      <Sidebar
        currentRoute={currentRoute}
        onNavigate={navigate}
        onOpenSearch={() => setIsCommandPaletteOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto bg-[#191919]">
        {currentRoute === '/' && (
          <HomeView
            onNavigate={navigate}
            onOpenCheck={id => navigate(`/checks/${id}`)}
          />
        )}

        {currentRoute.startsWith('/checks/new') && (
          <NewCheckView
            onNavigate={navigate}
            onCheckCreated={checkId => navigate(`/checks/${checkId}`)}
            initialClientId={newCheckClientId}
          />
        )}

        {activeCheckId && (
          <ResultsView
            key={activeCheckId}
            checkId={activeCheckId}
            onNavigate={navigate}
            onShowToast={showToast}
            onOpenShortcuts={() => setIsShortcutsOpen(true)}
          />
        )}

        {currentRoute === '/clients' && (
          <ClientsListView
            onNavigate={navigate}
            onOpenClient={clientId => navigate(`/clients/${clientId}`)}
          />
        )}

        {currentRoute === '/clients/new' && (
          <AddClientView
            onNavigate={navigate}
            onClientCreated={clientId => navigate(`/clients/${clientId}`)}
          />
        )}

        {activeClientId && (
          <ClientDetailView
            key={activeClientId}
            clientId={activeClientId}
            onNavigate={navigate}
            onOpenCheck={checkId => navigate(`/checks/${checkId}`)}
            onShowToast={showToast}
          />
        )}

        {currentRoute === '/settings' && (
          <SettingsView
            onShowShortcuts={() => setIsShortcutsOpen(true)}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={navigate}
        activeCheck={activeCheck}
        onCopyCorrections={() => {
          if (activeCheck) {
            // Trigger copy
            navigator.clipboard.writeText(`Corrections for ${activeCheck.title}`);
            showToast('Corrections copied to clipboard');
          }
        }}
      />

      {/* Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
