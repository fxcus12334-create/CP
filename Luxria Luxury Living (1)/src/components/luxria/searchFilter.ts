import { useSyncExternalStore } from "react";

export type SearchFilter = {
  listing: "rent" | "buy" | "all";
  propertyType: "house" | "commercial" | "villa" | "land" | "all";
  location: string;
  price: string;
  applied: boolean;
};

let state: SearchFilter = {
  listing: "all",
  propertyType: "all",
  location: "all",
  price: "all",
  applied: false,
};

const listeners = new Set<() => void>();
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnapshot = () => state;

export function setSearchFilter(next: SearchFilter) {
  state = next;
  listeners.forEach((l) => l());
}

export function useSearchFilter() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

// Price ranges in millions (Rs M)
export const PRICE_RANGES: Record<string, [number, number]> = {
  "1-5": [1, 5],
  "5-15": [5, 15],
  "15+": [15, Number.POSITIVE_INFINITY],
};