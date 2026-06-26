// FIXME: No real type due https://github.com/DataDog/browser-sdk/issues/2208

/* eslint-disable @typescript-eslint/no-unsafe-call  */

"use client";
import { useEffect } from "react";


export const Tracking = ({ info }: { info: Record<string, string> }) => {
  useEffect(() => {
    console.debug("[Logging] Tracking", info);
    // @ts-expect-error No reference to the library in the project
    window.__edgio__info__ = info;
  }, [info]);
  return false;
};
