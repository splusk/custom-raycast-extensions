import { exec } from "node:child_process";
import fs, { stat } from "node:fs/promises";
import path from 'path';

export const getFiles = async (directory: string) => {
  const files = await fs.readdir(directory);
  const filesWithStats = await Promise.all(
        files.map(async (file) => {
            const filePath = path.join(directory, file);
            const fileStat = await stat(filePath);
            return { file, createdAt: fileStat.birthtime, isDir: !fileStat.isFile() };
        })
    );

    return filesWithStats
        .filter(entry => !entry.file.startsWith('.'))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((entry) => { 
          return {
            file: entry.file, 
            isDir: entry.isDir 
          }
        });
}

export const openFile = async (filePath: string) => {
  exec(`qlmanage -p "${filePath}"`);
}


