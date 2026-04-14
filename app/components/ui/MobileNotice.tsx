'use client';

import { useState } from 'react';

export default function MobileNotice() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="mobile-notice" role="alert">
      <div className="mobile-notice-content">
        <h2>Desktop Recommended</h2>
        <p>
          JWire is a visual IDE designed for desktop use. For the best experience
          with drag-and-drop flowcharts, please use a device with a larger screen.
        </p>
        <button onClick={() => setDismissed(true)}>
          Continue Anyway
        </button>
      </div>
    </div>
  );
}
