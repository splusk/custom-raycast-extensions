import { FrontMatterResult } from "front-matter";
import { constants } from "node:fs";
import * as path from "node:path";
import * as fs from "node:fs/promises";

export function isFrontMatter(v: unknown): v is FrontMatter {
  if (v == null || typeof v !== "object") return false;
  const frontMatter = v as FrontMatter;
  return (
    typeof frontMatter.source === "string" &&
    typeof frontMatter.title === "string" &&
    typeof frontMatter.saved === "string" &&
    typeof frontMatter.read === "boolean" &&
    (frontMatter.publisher == null || typeof frontMatter.publisher === "string") &&
    isStringArray(frontMatter.tags)
  );
}

export function isFile(v: unknown): v is File {
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

export async function fileExists(filename: string): Promise<boolean> {
  try {
    const stat = await fs.stat(filename);
    return Boolean(stat);
  } catch {
    return false;
  }
}

export function isSubdirectory(parent: string, child: string): boolean {
  const relative = path.relative(parent, child);
  return !relative.startsWith("..") && !path.isAbsolute(relative);
}

export async function isReadWrite(filename: string): Promise<boolean> {
  try {
    await fs.access(filename, constants.R_OK | constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

export function isStringArray(val: unknown): val is string[] {
    if (val == null) return false;
    return Array.isArray(val) && val.every((item) => typeof item === "string");
}

export function unique(files: File[]): File[] {
  const record = files.reduce((memo, file) => ({ ...memo, [file.fullPath]: file }), {} as Record<string, File>);
  return Object.values(record);
}

export interface FrontMatter {
  source: string;
  publisher: string | null;
  title: string;
  tags: string[];
  saved: Date;
  read: boolean;
}

export interface File extends Omit<FrontMatterResult<FrontMatter>, "body" | "bodyBegin"> {
  fileName: string;
  fullPath: string;
  body?: string;
  bodyBegin?: number;
  lastOpened?: Date;
}