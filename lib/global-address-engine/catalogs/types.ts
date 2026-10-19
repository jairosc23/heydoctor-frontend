import type { AdminLevelKey, LocalizedLabel } from "../types";

export interface FlatCatalogNode {
  code: string;
  name: string;
  admin2?: NestedAdmin2[];
}

export interface NestedAdmin2 {
  code: string;
  name: string;
  admin3?: NestedAdmin3[];
}

export interface NestedAdmin3 {
  code: string;
  name: string;
  admin4?: { code: string; name: string }[];
}

export interface CountryCatalogFile {
  countryCode: string;
  levels: { key: AdminLevelKey; label: LocalizedLabel }[];
  admin1: FlatCatalogNode[];
}
