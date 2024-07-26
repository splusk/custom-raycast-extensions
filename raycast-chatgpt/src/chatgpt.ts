import { execSync } from "child_process";

export const ask = (text: string) => {
    return execSync(
        `chatgpt ${text}`,
        { env: { ...process.env, PATH: "/usr/local/bin:/usr/bin" }, encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 }
    );
}