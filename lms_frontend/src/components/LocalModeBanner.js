import React from 'react';
import { DATA_SOURCE } from '../lib/dataMode';

/**
 * PUBLIC_INTERFACE
 * LocalModeBanner renders a small notice when the app is using local seed data.
 */
export default function LocalModeBanner() {
  if (DATA_SOURCE !== 'local') return null;
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        background: '#FEF3C7',
        color: '#92400E',
        padding: '6px 12px',
        fontSize: 12,
        borderBottom: '1px solid #FDE68A',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
      data-testid="local-mode-banner"
      title="Local demo data mode"
    >
      <span style={{ fontWeight: 600 }}>Local demo data mode</span>
      <span>— configure Supabase to load live data.</span>
    </div>
  );
}
