import { type ClassValue } from "clsx";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function ice(impact: number, confidence: number, effort: number) {
  return (impact * confidence) / Math.max(1, effort);
}
