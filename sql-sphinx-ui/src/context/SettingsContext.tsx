import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type VerbosityLevel = 'none' | 'error' | 'warning' | 'info' | 'debug' | 'verbose';

export interface AppSettings {
  server1ConnectionString: string;
  server2ConnectionString: string;
  verbosity: VerbosityLevel;
  apiBaseUrl: string;
}

const DEFAULTS: AppSettings = {
  server1ConnectionString: '',
  server2ConnectionString: '',
  verbosity: 'info',
  apiBaseUrl: 'http://localhost:5181/api',
};

const STORAGE_KEY = 'sqlsphinx_settings';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  log: (level: VerbosityLevel, ...args: unknown[]) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

const LEVEL_RANK: Record<VerbosityLevel, number> = {
  none: 0, error: 1, warning: 2, info: 3, debug: 4, verbose: 5,
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULTS, ...JSON.parse(stored) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  const updateSettings = (patch: Partial<AppSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  // Load defaults from API once on mount (only fill blanks)
  useEffect(() => {
    fetch(`${settings.apiBaseUrl}/config/defaults`)
      .then(r => r.json())
      .then(data => {
        updateSettings({
          server1ConnectionString: settings.server1ConnectionString || data.server1 || '',
          server2ConnectionString: settings.server2ConnectionString || data.server2 || '',
        });
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const log = (level: VerbosityLevel, ...args: unknown[]) => {
    if (LEVEL_RANK[level] <= LEVEL_RANK[settings.verbosity]) {
      const prefix = `[SqlSphinx][${level.toUpperCase()}]`;
      if (level === 'error') console.error(prefix, ...args);
      else if (level === 'warning') console.warn(prefix, ...args);
      else console.log(prefix, ...args);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, log }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
