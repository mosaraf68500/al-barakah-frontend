'use client';

import { useEffect, useRef } from 'react';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '947073184687-9303rtcuomi8it4t3nv0l6f75ndm3ofq.apps.googleusercontent.com';
const SCRIPT = 'https://accounts.google.com/gsi/client';

interface GoogleId {
  initialize: (config: { client_id: string; callback: (response: { credential?: string }) => void; auto_select?: boolean }) => void;
  renderButton: (parent: HTMLElement, options: Record<string, string | number>) => void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } };
  }
}

let scriptPromise: Promise<void> | undefined;

function loadGis(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT}"]`);
      const script = existing ?? document.createElement('script');
      script.src = SCRIPT;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Google sign-in failed to load'));
      if (!existing) document.head.appendChild(script);
      else if (window.google?.accounts?.id) resolve();
    });
  }
  return scriptPromise;
}

/** Official Google Identity Services button. The credential is an ID token for POST /v1/auth/google. */
export function ContinueWithGoogle({ onCredential }: { onCredential: (idToken: string) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);
  onCredentialRef.current = onCredential;

  useEffect(() => {
    if (!CLIENT_ID || !host.current) return;
    let cancelled = false;
    loadGis()
      .then(() => {
        const el = host.current;
        const gis = window.google?.accounts?.id;
        if (cancelled || !el || !gis || !CLIENT_ID) return;
        gis.initialize({
          client_id: CLIENT_ID,
          auto_select: false,
          callback: (response) => {
            if (response.credential) onCredentialRef.current(response.credential);
          },
        });
        el.replaceChildren();
        const width = Math.max(240, Math.min(400, el.clientWidth || 320));
        gis.renderButton(el, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width,
        });
      })
      .catch(() => {
        /* the phone form stays usable */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!CLIENT_ID) return null;
  return <div ref={host} className="w-full min-h-11 flex justify-center" />;
}
