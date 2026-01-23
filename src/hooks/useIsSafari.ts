"use client";

import { useEffect, useState } from "react";

export default function useIsSafari() {
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const ua = navigator.userAgent;
    const safari = /Safari/.test(ua) && !/Chrome|Chromium|Android/.test(ua);
    setIsSafari(safari);
  }, []);

  return isSafari;
}
