'use client';

import { useEffect } from 'react';

export default function SWRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('[Peryahan] SW registered successfully:', reg.scope);
            // Check for updates automatically
            reg.update().catch(() => {});
          })
          .catch((err) => {
            console.error('[Peryahan] SW registration error:', err);
          });
      });
    }
  }, []);

  return null;
}
