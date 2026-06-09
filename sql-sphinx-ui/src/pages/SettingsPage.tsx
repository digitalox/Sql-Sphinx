import React, { useState } from 'react';
import { useSettings, VerbosityLevel } from '../context/SettingsContext';
import './SettingsPage.css';

const VERBOSITY_OPTIONS: { value: VerbosityLevel; label: string; description: string }[] = [
  { value: 'none',    label: 'None',    description: 'No logging' },
  { value: 'error',   label: 'Error',   description: 'Errors only' },
  { value: 'warning', label: 'Warning', description: 'Errors and warnings' },
  { value: 'info',    label: 'Info',    description: 'General operational messages' },
  { value: 'debug',   label: 'Debug',   description: 'Detailed diagnostic output' },
  { value: 'verbose', label: 'Verbose', description: 'Everything, including raw payloads' },
];

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ ...settings });

  const handleSave = () => {
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setForm({ ...settings });
  };

  const changed = JSON.stringify(form) !== JSON.stringify(settings);

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Configure servers and diagnostic options. Changes are saved to browser storage.</p>
      </div>

      <div className="settings-section">
        <div className="section-header">
          <h2>Servers</h2>
          <p>Default connection strings. These can be overridden on the Compare page.</p>
        </div>
        <div className="settings-fields">
          <div className="field">
            <label>Server 1 — Connection String</label>
            <input
              type="text"
              value={form.server1ConnectionString}
              onChange={e => setForm(f => ({ ...f, server1ConnectionString: e.target.value }))}
              placeholder="Server=...;Database=master;Trusted_Connection=True;TrustServerCertificate=True;"
            />
          </div>
          <div className="field">
            <label>Server 2 — Connection String</label>
            <input
              type="text"
              value={form.server2ConnectionString}
              onChange={e => setForm(f => ({ ...f, server2ConnectionString: e.target.value }))}
              placeholder="Server=...;Database=master;Trusted_Connection=True;TrustServerCertificate=True;"
            />
          </div>
          <div className="field">
            <label>API Base URL</label>
            <input
              type="text"
              value={form.apiBaseUrl}
              onChange={e => setForm(f => ({ ...f, apiBaseUrl: e.target.value }))}
              placeholder="http://localhost:5181/api"
            />
            <span className="field-hint">URL of the SqlSphinx.Api backend</span>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="section-header">
          <h2>Diagnostics</h2>
          <p>Control how much information is written to the browser console.</p>
        </div>
        <div className="verbosity-grid">
          {VERBOSITY_OPTIONS.map(opt => (
            <label
              key={opt.value}
              className={`verbosity-card ${form.verbosity === opt.value ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="verbosity"
                value={opt.value}
                checked={form.verbosity === opt.value}
                onChange={() => setForm(f => ({ ...f, verbosity: opt.value }))}
              />
              <span className="verbosity-label">{opt.label}</span>
              <span className="verbosity-desc">{opt.description}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="settings-actions">
        <button className="btn-save" onClick={handleSave} disabled={!changed && !saved}>
          {saved ? 'Saved ✓' : 'Save settings'}
        </button>
        {changed && (
          <button className="btn-reset" onClick={handleReset}>
            Discard changes
          </button>
        )}
      </div>
    </div>
  );
}
