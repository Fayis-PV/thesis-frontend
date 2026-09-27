import type { Department, ThesisCategory, Thesis, Institution } from "@/types/api";
import {
  DRP_INSTITUTIONS,
  DRP_DEPARTMENTS,
  DRP_CATEGORIES,
  DRP_THESES,
  DRP_TOTAL_STATS,
} from "@/lib/mock/drp-mock-data";

export const ACADEMIC_INSTITUTIONS: Institution[] = DRP_INSTITUTIONS as unknown as Institution[];
export const ACADEMIC_DEPARTMENTS: Department[] = DRP_DEPARTMENTS as unknown as Department[];
export const ACADEMIC_CATEGORIES: ThesisCategory[] = DRP_CATEGORIES as unknown as ThesisCategory[];
export const ACADEMIC_THESES: Thesis[] = DRP_THESES as unknown as Thesis[];
export const TOTAL_STATS = DRP_TOTAL_STATS;
