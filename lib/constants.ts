// Shared constants - can be used in both client and server components

export const DEPARTMENTS = [
  "CSE", "ECE", "ME", "CE", "IT", "AIDS", "EE", "IP", "MATH", "CHEM", "PHY", "T&P", "MECH"
] as const;

export type Department = typeof DEPARTMENTS[number];
