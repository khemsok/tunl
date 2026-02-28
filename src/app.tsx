import { useState, useEffect } from "react";
import { useKeyboard, useTerminalDimensions } from "@opentui/react";

import { TimerDisplay } from "./components/timer";
import { ProgressBar } from "./components/progress-bar";
import { ArtCanvas } from "./components/art-canvas";
import { StatusBar } from "./components/status-bar";
import { StatsScreen } from "./components/stats-screen";
import { Onboarding, type OnboardingResult } from "./components/onboarding";
import { SiteEditor } from "./components/site-editor";
import { ThemePicker } from "./components/theme-picker";
import { cityTheme, type ArtTheme } from "./art/city";
import { forestTheme } from "./art/forest";
import { spaceTheme } from "./art/space";
import { loadConfig, saveConfig } from "./config";
import { recordSession } from "./lib/session";
import { registerCleanup } from "./lib/terminal";
import { unblockSites } from "./lib/blocker";
import { useTimer } from "./hooks/use-timer";
import { useAnimation } from "./hooks/use-animation";
import { useCelebration } from "./hooks/use-celebration";
import { useBlocker } from "./hooks/use-blocker";
import { COLORS } from "./theme";

const ALL_THEMES: ArtTheme[] = [cityTheme, forestTheme, spaceTheme];

type Screen =
  | "onboarding"
  | "timer"
  | "completed"
  | "sites"
  | "themes"
  | "stats";

type AppProps = {
  initialDuration?: number;
  noblock?: boolean;
  extraBlocks?: string[];
};

export function App({ initialDuration, noblock, extraBlocks }: AppProps) {
  const [config, setConfig] = useState(() => loadConfig());

  const [screen, setScreen] = useState<Screen>(
    config.isFirstRun ? "onboarding" : "timer",
  );
  const [blockedSites, setBlockedSites] = useState<string[]>(
    config.blockedSites,
  );
  const [currentTheme, setCurrentTheme] = useState<ArtTheme>(
    ALL_THEMES.find((t) => t.name === config.theme) || cityTheme,
  );

  const initialSeconds = (initialDuration || config.duration) * 60;

  const { isBlocking, blockError, startBlocking, stopBlocking } = useBlocker();

  const timer = useTimer(initialSeconds, () => {
    setScreen("completed");
    recordSession(Math.round(timer.totalSeconds / 60));
    setConfig(loadConfig());
    stopBlocking();
  });

  const { animTick, resetAnimation } = useAnimation(timer.timerStatus);
  const celebrationColor = useCelebration(screen === "completed");
  const { width } = useTerminalDimensions();

  useEffect(() => {
    registerCleanup();
  }, []);

  function startSession(): void {
    if (!noblock && blockedSites.length > 0) {
      const sites = [...blockedSites, ...(extraBlocks || [])];
      startBlocking(sites);
    }
    timer.setTimerStatus("running");
  }

  function resetSession(): void {
    stopBlocking();
    timer.resetTimer();
    resetAnimation();
  }

  useKeyboard((key) => {
    if (key.ctrl && key.name === "c") {
      stopBlocking();
      process.exit(0);
    }

    if (screen === "stats") {
      if (key.name === "escape" || key.name === "q" || key.name === "i") {
        setScreen("timer");
      }
      return;
    }

    if (
      screen === "onboarding" ||
      screen === "sites" ||
      screen === "themes"
    ) {
      return;
    }

    if (key.name === "q") {
      stopBlocking();
      process.exit(0);
    }

    if (screen === "timer") {
      handleTimerKeys(key);
    }

    if (screen === "completed" && key.name === "space") {
      timer.resetTimer();
      resetAnimation();
      setScreen("timer");
    }
  });

  function handleTimerKeys(key: { name?: string }): void {
    if (timer.timerStatus === "idle") {
      if (key.name === "s") {
        setScreen("sites");
        return;
      }
      if (key.name === "t") {
        setScreen("themes");
        return;
      }
      if (key.name === "i") {
        setScreen("stats");
        return;
      }
      if (key.name === "space") {
        startSession();
        return;
      }
      if (key.name === "=" || key.name === "+") {
        const newTotal = timer.totalSeconds + 300;
        timer.adjustDuration(300);
        saveConfig({ duration: newTotal / 60 });
        return;
      }
      if (key.name === "-") {
        const newTotal = Math.max(timer.totalSeconds - 300, 60);
        timer.adjustDuration(-300);
        saveConfig({ duration: newTotal / 60 });
        return;
      }
    }

    if (key.name === "space") {
      if (timer.timerStatus === "running") {
        timer.setTimerStatus("paused");
      } else if (timer.timerStatus === "paused") {
        timer.setTimerStatus("running");
      }
    }

    if (
      key.name === "r" &&
      (timer.timerStatus === "running" || timer.timerStatus === "paused")
    ) {
      resetSession();
    }
  }

  function handleOnboardingComplete(result: OnboardingResult): void {
    setBlockedSites(result.blockedSites);
    timer.setDuration(result.duration * 60);
    saveConfig({
      duration: result.duration,
      blockedSites: result.blockedSites,
    });
    setScreen("timer");
  }

  function handleSitesSave(sites: string[]): void {
    setBlockedSites(sites);
    saveConfig({ blockedSites: sites });
    setScreen("timer");
  }

  function handleThemeSelect(theme: ArtTheme): void {
    setCurrentTheme(theme);
    saveConfig({ theme: theme.name });
    setScreen("timer");
  }

  if (screen === "onboarding") {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (screen === "sites") {
    return (
      <SiteEditor
        currentSites={blockedSites}
        onSave={handleSitesSave}
        onCancel={() => setScreen("timer")}
      />
    );
  }

  if (screen === "themes") {
    return (
      <ThemePicker
        themes={ALL_THEMES}
        currentTheme={currentTheme.name}
        onSelect={handleThemeSelect}
        onCancel={() => setScreen("timer")}
      />
    );
  }

  if (screen === "stats") {
    return <StatsScreen config={config} />;
  }

  const progress =
    timer.totalSeconds > 0
      ? 1 - timer.remainingSeconds / timer.totalSeconds
      : 0;

  const timerColor = screen === "completed" ? celebrationColor : COLORS.text;
  const displayStatus =
    screen === "completed" ? ("finished" as const) : timer.timerStatus;

  return (
    <box flexDirection="column" width="100%" height="100%">
      <box height={1} />
      <TimerDisplay remaining={timer.remainingSeconds} color={timerColor} />
      <ProgressBar progress={progress} width={Math.min(width, 70)} />

      <box justifyContent="center" alignItems="center" width="100%">
        <TimerStatusMessage
          screen={screen}
          timerStatus={timer.timerStatus}
          blockError={blockError}
          config={config}
          totalSeconds={timer.totalSeconds}
          celebrationColor={celebrationColor}
        />
      </box>

      <ArtCanvas stage={0} theme={currentTheme} animTick={animTick} />

      <StatusBar
        blockedCount={isBlocking ? blockedSites.length : 0}
        blockedSites={isBlocking ? blockedSites : []}
        timerStatus={displayStatus}
      />
    </box>
  );
}

type TimerStatusMessageProps = {
  screen: Screen;
  timerStatus: "idle" | "running" | "paused" | "finished";
  blockError: string | null;
  config: ReturnType<typeof loadConfig>;
  totalSeconds: number;
  celebrationColor: string;
};

function TimerStatusMessage({
  screen,
  timerStatus,
  blockError,
  config,
  totalSeconds,
}: TimerStatusMessageProps) {
  if (screen === "completed") {
    return (
      <text>
        <span fg={COLORS.accent}>done. </span>
        <span fg={COLORS.textMuted}>
          {config.totalSessions} sessions ·{" "}
          {config.totalMinutesFocused} min total
          {config.currentStreak > 0
            ? ` · ${config.currentStreak} day streak`
            : ""}
        </span>
      </text>
    );
  }

  if (blockError) {
    return <text fg={COLORS.error}>{blockError}</text>;
  }

  if (timerStatus === "idle") {
    return (
      <text>
        <span fg={COLORS.border}>space to begin</span>
        {config.totalSessions > 0 && (
          <span fg={COLORS.textDimmer}>
            {" · " +
              config.totalSessions +
              " sessions" +
              (config.currentStreak > 1
                ? " · " + config.currentStreak + " day streak"
                : "")}
          </span>
        )}
      </text>
    );
  }

  if (timerStatus === "paused") {
    return <text fg={COLORS.warning}>paused</text>;
  }

  return <text fg={COLORS.border}> </text>;
}
