// Forked from https://github.com/jacob-8/sveltefirets/
import {
  getPerformance,
  trace,
  type PerformanceTrace,
} from "firebase/performance";
import { app } from "$lib/stores/app";

export function startTrace(name: string) {
  const perf = getPerformance(app);
  const t = trace(perf, name);
  t.start();
  return t;
}

export function stopTrace(t: PerformanceTrace) {
  t.stop();
  return null;
}

// add more from https://modularfirebase.web.app/common-use-cases/performance-monitoring/
