import { getPreferenceValues } from "@raycast/api";
import { readFile } from "fs/promises";
import { homedir } from 'os';
import { execSync } from "child_process";

export interface ViewProfile {
    profile: string;
    vars: string | undefined
};

const preferences: {
    awsCommand: string;
    awsHostname: string;
  } = getPreferenceValues();

export const requiresAuthentication = (value: string) => value.toLocaleLowerCase().indexOf('has not been authenticated yet') > -1;

export const parseCredentialsFile = async () => {
    const now = new Date();
    return getFileContent(homedir() + '/.aws/credentials').then(contents => {
        if (contents) {
            const profileSections = contents.split(/\n\s*\n/).filter(Boolean);
            return profileSections.map(section => getProfileDetails(section, now));
        }
        return [];
    });
}

export const parseConfigFile = () => {
    return getFileContent(homedir() + '/.aws/config').then(contents => {
        if (contents) {
            const profileLines = contents.split(/\r?\n/).filter(line => line.startsWith('['));
            return profileLines.map(line => {
                const profile = line.startsWith('[profile') ? line.replace('profile', '') : line;
                return withoutSquareBrackets(profile);
            });
        }
        return [];
    });
}

export const getExportableProperties = (profileEnvs: ViewProfile[], selectedItem: string) => {
    if (profileEnvs && selectedItem) {
        const result = profileEnvs.filter(item => item.profile === selectedItem && item.vars);
        if (result.length > 0 && result[0].vars) {
            return result[0].vars;
        }
    }
    return `Profile: **${selectedItem}** has NOT been authenticated yet. \n\rHit the **Enter** key to authenticate`;
}

export const getMetaDetails = (metaDetails: string) => {
    if (!requiresAuthentication(metaDetails)) {
        return metaDetails.replaceAll('export', '').split('\n').map(ss => ss.split('='));
    }
    return [['', ''],['', ''],['', '']];
}

export const authenticate = (profile: string) => {
    return execSync(
        `yawsso auto -e --profile ${profile}`,
        { env: { ...process.env, PATH: "/opt/homebrew/bin:/usr/bin" }, encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 }
    );
}

export const login = () => {
    const loginCmd = `aws sso login`; // `yawsso login`;
    const cmd = execSync(
        loginCmd,
        { env: { ...process.env, PATH: "/opt/homebrew/bin:/usr/bin" }, encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 }
    );
    return cmd;
}

export const runAutoCmd = async (hostname?: string) => {
    const host = hostname && hostname.endsWith('.amazonaws.com') ? hostname : preferences.awsHostname;
    if (preferences.awsCommand.length > 0 && host.length > 0) {
        return execSync(
            `${preferences.awsCommand} --hostname ${host}`,
            { env: { ...process.env, PATH: "/opt/homebrew/bin:/usr/bin" }, encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 }
        ).replace(/\n/g, "");    
    }
}

const withoutSquareBrackets = (item: string) => item.replace('[', '').replace(']', '').replace(/\s/g, '');

const getFileContent = (path: string) => {
    return readFile(path, 'utf8')
}

const getExportString = (entry: string) => {
    const splits = entry.replace(/\s/g, '').split("=");
    return `export ${splits[0].toLocaleUpperCase()}=${splits[1]}`;
}

const getProfileDetails = (section: string, now: Date) => {
    const sectionLines = section.split(/\r?\n/).filter(Boolean);
    const profileExpiration = sectionLines[sectionLines.length - 1].split("=")[1].trim();
    const profileVaribaleParts = sectionLines.slice(0, 4);
    const hasExpired = new Date(profileExpiration) < now;
    return {
        profile: withoutSquareBrackets(profileVaribaleParts[0]),
        vars: !hasExpired ?
            getExportString(profileVaribaleParts[1]) + "\n" + getExportString(profileVaribaleParts[2]) + "\n" + getExportString(profileVaribaleParts[3]) : undefined
    }
}