import { useEffect, useState } from "react";
import { Clipboard, Icon, MenuBarExtra, showHUD } from "@raycast/api";
import { authenticate, parseConfigFile, parseCredentialsFile } from "./utils";

export default function Command() {
  // const [profiles, setProfiles] = useState([] as string[]);
  const [allProfiles, setAllProfiles] = useState([] as {profile: string, vars: string|undefined}[]);

  useEffect(() => {
    const get = async () => {
      const profileName = await parseConfigFile();
      const profiles = await parseCredentialsFile();
      const result: {profile: string, vars: string|undefined}[] = profileName.map(p => {
        const match = profiles.find(pr => pr.profile === p);
        return {profile: p, vars: match?.vars};
      });
      setAllProfiles(result);
    }
    get();
  }, []);

  return (
    <MenuBarExtra icon={Icon.Cloud}>
      <MenuBarExtra.Item title="Profiles" />
      {allProfiles.map((profile) => {
        return (
        <MenuBarExtra.Item
          key={profile.profile}
          icon={profile.vars ? Icon.CircleFilled : Icon.Circle}
          title={profile.profile}
          onAction={async () => {
            const profileName = profile.profile;
            if (!profile.vars) {
              const r = await authenticate(profileName);
              if (!r.includes('Successfully logged into Start')) {
                await showHUD(`Failed to authenticate: ${profileName}`);
                return;
              }
            }
            await showHUD(`Copied: export AWS_PROFILE="${profileName}"`);
            Clipboard.copy(`export AWS_PROFILE="${profileName}"`);
          }}
        />
      )})}
    </MenuBarExtra>
  );
}
