import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSettings } from '../context/SettingsContext';
import { ComparisonResult, ServerProperties } from '../types';
import './ComparePage.css';

function ServerPropCard({ label, props }: { label: string; props: ServerProperties }) {
  const rows: [string, string | null | boolean][] = [
    ['Version', props.productVersion],
    ['Level', props.productLevel],
    ['Edition', props.edition],
    ['Collation', props.collation],
    ['Machine', props.machineName],
    ['Instance', props.instanceName || '(default)'],
    ['Clustered', props.isClustered ? 'Yes' : 'No'],
    ['Full-Text', props.isFullTextInstalled ? 'Installed' : 'Not installed'],
  ];
  return (
    <div className="server-prop-card">
      <h3>{label}</h3>
      {rows.map(([key, val]) => (
        <div className="prop-row" key={key}>
          <span className="prop-key">{key}</span>
          <span className="prop-val">{String(val ?? '—')}</span>
        </div>
      ))}
    </div>
  );
}

export default function ComparePage() {
  const { settings, log } = useSettings();
  const [conn1, setConn1] = useState('');
  const [conn2, setConn2] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [diffsOnly, setDiffsOnly] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setConn1(settings.server1ConnectionString);
    setConn2(settings.server2ConnectionString);
  }, [settings.server1ConnectionString, settings.server2ConnectionString]);

  const compare = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    log('info', 'Starting comparison', { server1: conn1, server2: conn2 });
    try {
      const res = await axios.post<ComparisonResult>(
        `${settings.apiBaseUrl}/config/compare`,
        { server1ConnectionString: conn1, server2ConnectionString: conn2 }
      );
      log('info', 'Comparison complete', res.data);
      log('debug', 'Full result payload', JSON.stringify(res.data, null, 2));
      setResult(res.data);
    } catch (e: any) {
      const msg = e.response?.data?.error ?? e.message ?? 'Unknown error';
      log('error', 'Comparison failed', msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const filteredDiffs = result?.diffs.filter(d => {
    if (diffsOnly && !d.isDifferent) return false;
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }) ?? [];

  return (
    <div className="compare-page">
      <div className="page-header">
        <h1>Compare</h1>
        <p>Fetch and diff SQL Server configurations side by side.</p>
      </div>

      <div className="connection-panel">
        <h2>Servers</h2>
        <div className="connection-grid">
          <div className="connection-field">
            <label>Server 1 — Connection String</label>
            <input
              value={conn1}
              onChange={e => setConn1(e.target.value)}
              placeholder="Server=...;Database=master;Trusted_Connection=True;"
            />
          </div>
          <div className="connection-field">
            <label>Server 2 — Connection String</label>
            <input
              value={conn2}
              onChange={e => setConn2(e.target.value)}
              placeholder="Server=...;Database=master;Trusted_Connection=True;"
            />
          </div>
        </div>
        <button
          className="btn-compare"
          onClick={compare}
          disabled={loading || !conn1.trim() || !conn2.trim()}
        >
          {loading ? 'Comparing…' : 'Compare'}
        </button>
      </div>

      {error && <div className="error-box">{error}</div>}
      {loading && <div className="loading">Connecting to servers…</div>}

      {result && (
        <>
          <div className="stats-bar">
            <div className="stat-card total">
              <div className="stat-value">{result.totalSettings}</div>
              <div className="stat-label">Total settings</div>
            </div>
            <div className="stat-card diffs">
              <div className="stat-value">{result.differentCount}</div>
              <div className="stat-label">Differences</div>
            </div>
            <div className="stat-card matches">
              <div className="stat-value">{result.matchingCount}</div>
              <div className="stat-label">Matching</div>
            </div>
          </div>

          <div className="server-props">
            <ServerPropCard label={result.server1.connectionLabel} props={result.server1.properties} />
            <ServerPropCard label={result.server2.connectionLabel} props={result.server2.properties} />
          </div>

          <div className="filter-bar">
            <input
              placeholder="Filter settings…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button
              className={`filter-toggle ${diffsOnly ? 'active' : ''}`}
              onClick={() => setDiffsOnly(v => !v)}
            >
              {diffsOnly ? 'Showing diffs only' : 'Show diffs only'}
            </button>
          </div>

          <div className="comparison-table-wrap">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Setting</th>
                  <th>{result.server1.connectionLabel}</th>
                  <th>{result.server2.connectionLabel}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredDiffs.map(d => (
                  <tr key={d.name} className={d.isDifferent ? 'is-diff' : ''}>
                    <td className="diff-indicator">
                      <div className="td-name">{d.name}</div>
                      {d.description && <div className="td-desc">{d.description}</div>}
                    </td>
                    <td className={`td-value ${d.isDifferent ? 'changed' : ''}`}>
                      {d.value1 ?? '—'}
                    </td>
                    <td className={`td-value ${d.isDifferent ? 'changed' : ''}`}>
                      {d.value2 ?? '—'}
                    </td>
                    <td>
                      {d.isDifferent && <span className="badge-diff">diff</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
