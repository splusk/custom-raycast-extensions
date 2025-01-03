import { getPreferenceValues } from '@raycast/api';
import * as fs from 'fs';
import * as path from 'path';
import { SimplifiedWorkspace } from '.';

const { orgName, defaultApp, clientDefaultApp } = getPreferenceValues()

export const getLocalRepos = (folderPath: string): SimplifiedWorkspace[] => {
  const dirs: SimplifiedWorkspace[] = [];

  try {
    const nodes = fs.readdirSync(folderPath);

    if (nodes) {
      nodes.forEach(async (node: string) => {
        const childFolderPath = path.join(folderPath, node);
        const isDir = fs.statSync(childFolderPath).isDirectory();
        if (isDir) {
          const hasPackageJson = isFile(path.join(childFolderPath, 'package.json'));
          dirs.push({
            path: childFolderPath,
            name: node,
            icon: `https://github.com/${orgName}.png?size=32`,
            openWith: hasPackageJson && clientDefaultApp ? clientDefaultApp : defaultApp
          });
        }
      });
    }
  } catch (error) {
    console.error('Can not read folder: ', folderPath, '. Detail error: ', error);
  }

  return dirs;
}

/**
 * Check a file is exist or not
 */
export const isFile = (filePath: string) => {
  try {
    fs.accessSync(filePath);
    return true;
  } catch (e) {
    return false;
  }
}