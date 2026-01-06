import { useState, useEffect } from "react";
import { getVaultMode, setVaultMode, VaultMode, getVaultModes } from "./sort";

export const useVaultMode = () => {
  const [vaultMode, setVaultModeState] = useState<VaultMode>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getVaultMode().then((mode) => {
      setVaultModeState(mode);
      setIsLoading(false);
    });
  }, []);

  const updateVaultMode = async (mode: VaultMode) => {
    await setVaultMode(mode);
    setVaultModeState(mode);
  };

  return {
    vaultMode,
    updateVaultMode,
    isLoading,
  };
};
