import { FrontMatterResult } from "front-matter";
import { constants } from "node:fs";
import * as path from "node:path";
import * as fs from "node:fs/promises";

export const formatDateForFileName = (date: Date|undefined): string => {
  if (date) {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
  }
  return "";
}

export const formatDateForAttribute = (date: Date|undefined): string => {
  if (date) {
    return date.toLocaleString([], {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute:'2-digit'}).replace(', ', 'T');
  }
  return new Date().toLocaleString([], {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute:'2-digit'}).replace(', ', 'T');
}

export const isFrontMatter = (v: unknown): v is FrontMatter => {
  if (v == null || typeof v !== "object") return false;
  const frontMatter = v as FrontMatter;
  return (
    typeof frontMatter.source === "string" &&
    typeof frontMatter.title === "string" &&
    typeof frontMatter.created === "string" &&
    (frontMatter.publisher == null || typeof frontMatter.publisher === "string") &&
    isStringArray(frontMatter.tags)
  );
}

export const isFile = (v: unknown): v is File => {
  if (v == null || typeof v !== "object") return false;
  const file = v as File;
  return (
    (file.body == null || typeof file.body === "string") &&
    (file.bodyBegin == null || typeof file.bodyBegin === "number") &&
    (file.frontmatter == null || typeof file.frontmatter === "string") &&
    typeof file.fileName === "string" &&
    typeof file.fullPath === "string" &&
    isFrontMatter(file.attributes)
  );
}

export const fileExists = async(filename: string): Promise<boolean> => {
  try {
    const stat = await fs.stat(filename);
    return Boolean(stat);
  } catch {
    return false;
  }
}

export const isSubdirectory = (parent: string, child: string): boolean => {
  const relative = path.relative(parent, child);
  return !relative.startsWith("..") && !path.isAbsolute(relative);
}

export const isReadWrite = async(filename: string): Promise<boolean> => {
  try {
    await fs.access(filename, constants.R_OK | constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

export const isStringArray = (val: unknown): val is string[] => {
    if (val == null) return false;
    return Array.isArray(val) && val.every((item) => typeof item === "string");
}

export const unique = (files: File[]): File[] => {
  const record = files.reduce((memo, file) => ({ ...memo, [file.fullPath]: file }), {} as Record<string, File>);
  return Object.values(record);
}

export interface FrontMatter {
  icon: string;
  source: string;
  publisher: string | null;
  title: string;
  tags: string[];
  created?: Date;
  saved?: Date;
  updated?: Date;
  rank?: number;
}

export interface File extends Omit<FrontMatterResult<FrontMatter>, "body" | "bodyBegin"> {
  fileName: string;
  fullPath: string;
  body?: string;
  bodyBegin?: number;
}