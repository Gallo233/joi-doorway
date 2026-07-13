"use client";

import Script from "next/script";
import { useEffect } from "react";

export function Live2DRouteMount() {
  useEffect(() => {
    document.body.dataset.state = "home";
    return () => {
      delete document.body.dataset.state;
    };
  }, []);

  return <Script src="/live2d/joi-live2d.js" strategy="afterInteractive" />;
}
