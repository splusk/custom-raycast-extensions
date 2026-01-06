import { getPreferenceValues } from "@raycast/api";
import { execSync } from "child_process";

const { aiProgram, executablePath } = getPreferenceValues<Preferences>();

export const ask = (text: string) => {
    return execSync(
        `${aiProgram} "${text}"`,
        { env: { ...process.env, PATH: `${executablePath}:/usr/local/bin:/usr/bin` }, encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 }
    );
}