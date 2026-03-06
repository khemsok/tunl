import { useState, useEffect, useCallback } from "react";
import { defaultDurationStorage, autoStartStorage } from "@/lib/storage";

interface UseSettingsReturn {
  duration: number;
  autoStart: boolean;
  setDuration: (min: number) => void;
  setAutoStart: (val: boolean) => void;
}

export function useSettings(): UseSettingsReturn {
  const [duration, setDurationState] = useState(25);
  const [autoStart, setAutoStartState] = useState(false);

  useEffect(() => {
    void defaultDurationStorage.getValue().then(setDurationState);
    const unwatch = defaultDurationStorage.watch((v: number | null) => {
      if (v !== null) setDurationState(v);
    });
    return unwatch;
  }, []);

  useEffect(() => {
    void autoStartStorage.getValue().then(setAutoStartState);
    const unwatch = autoStartStorage.watch((v: boolean | null) => {
      if (v !== null) setAutoStartState(v);
    });
    return unwatch;
  }, []);

  const setDuration = useCallback((min: number) => {
    void defaultDurationStorage.setValue(min);
  }, []);

  const setAutoStart = useCallback((val: boolean) => {
    void autoStartStorage.setValue(val);
  }, []);

  return { duration, autoStart, setDuration, setAutoStart };
}
