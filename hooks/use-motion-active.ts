"use client";
import { useSyncExternalStore, type RefObject } from "react";
import { useInView, useReducedMotion } from "framer-motion";
const subscribe = (notify: () => void) => { document.addEventListener("visibilitychange", notify); return () => document.removeEventListener("visibilitychange", notify); };
const snapshot = () => document.visibilityState === "visible";
const serverSnapshot = () => false;
export function useMotionActive<T extends HTMLElement>(ref: RefObject<T | null>) {
  const inView = useInView(ref, { amount: 0.05 });
  const visible = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const reduced = useReducedMotion();
  return inView && visible && !reduced;
}
