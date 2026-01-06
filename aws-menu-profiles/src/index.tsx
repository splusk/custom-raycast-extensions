import { useEffect, useState } from "react";
import { Clipboard, Icon, Image, MenuBarExtra, showHUD } from "@raycast/api";
import { authenticate, parseConfigFile, parseCredentialsFile, syncProfile } from "./utils";


const awsIcon = { source: "aws-icon.png", mask: Image.Mask.RoundedRectangle };

export default function Command() {
  const [allProfiles, setAllProfiles] = useState([] as {profile: string, vars: string|undefined}[]);

  const get = async () => {
    const profileName = await parseConfigFile();
    const profiles = await parseCredentialsFile();
    const result: {profile: string, vars: string|undefined}[] = profileName.map(p => {
      const match = profiles.find(pr => pr.profile === p);
      return {profile: p, vars: match?.vars};
    });
    setAllProfiles(result);
  }

  useEffect(() => {
    get();
  }, []);

  return (
    <MenuBarExtra icon={awsIcon}>
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
              syncProfile(profileName);
              const profiles = await parseCredentialsFile();
              const match = profiles.find(pr => pr.profile === profileName);
              const msg = match?.vars ? `Authenticated: ${profileName}` : `Failed to authenticate: ${profileName}, could be due to aws_access_request is no longer valid`;
              Clipboard.copy(`export AWS_PROFILE="${profileName}"`);
              await showHUD(msg);
            }
          }}
        />
      )})}
    </MenuBarExtra>
  );
}
