import { useState, useEffect } from "react";
import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import { TimerDisplay } from "./components/timer";
import { ProgressBar } from "./components/progress-bar";
import { ArtCanvas } from "./components/art-canvas";
import { StatusBar } from "./components/status-bar";
import { Onboarding, type OnboardingResult } from "./components/onboarding";
import { SiteEditor } from "./components/site-editor";
import { ThemePicker } from "./components/theme-picker";
import { cityTheme, NUM_STAGES, type ArtTheme } from "./art/city";
import { forestTheme } from "./art/forest";
import { spaceTheme } from "./art/space";
import { loadConfig, saveConfig } from "./config";
import { blockSites, unblockSites, registerCleanup } from "./blocker";

const ALL_THEMES: ArtTheme[] = [cityTheme, forestTheme, spaceTheme];

type Screen = "onboarding" | "timer" | "completed" | "sites" | "themes";
type TimerStatus = "idle" | "running" | "paused" | "finished";

export function App({
  initialDuration,
  noblock,
  extraBlocks,
}: {
  initialDuration?: number;
  noblock?: boolean;
  extraBlocks?: string[];
}) {
  const config = loadConfig();

  const [screen, setScreen] = useState<Screen>(
    config.isFirstRun ? "onboarding" : "timer"
  );
  const [timerStatus, setTimerStatus] = useState<TimerStatus>("idle");
  const [totalSeconds, setTotalSeconds] = useState(
    (initialDuration || config.duration) * 60
  );
  const [remainingSeconds, setRemainingSeconds] = useState(
    (initialDuration || config.duration) * 60
  );
  const [artStage, setArtStage] = useState(0);
  const [blockedSites, setBlockedSites] = useState<string[]>(
    config.blockedSites
  );
  const [isBlocking, setIsBlocking] = useState(false);
  const [celebrationColor, setCelebrationColor] = useState("#E0F0FF");
  const [blockError, setBlockError] = useState<string | null>(null);
  const [animTick, setAnimTick] = useState(0);
  const [currentTheme, setCurrentTheme] = useState<ArtTheme>(
    ALL_THEMES.find((t) => t.name === config.theme) || cityTheme
  );

  const { width } = useTerminalDimensions();

  useEffect(() => {
    registerCleanup();
  }, []);

  // Animation tick — runs every 800ms for continuous art evolution
  useEffect(() => {
    if (screen === "onboarding" || screen === "sites" || screen === "themes") return;
    const interval = setInterval(() => {
      setAnimTick((t) => t + 1);
    }, 800);
    return () => clearInterval(interval);
  }, [screen]);

  // Timer interval — uses eased curve so early art reveals come fast
  useEffect(() => {
    if (timerStatus !== "running") return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerStatus("finished");
          setArtStage(NUM_STAGES - 1);
          setScreen("completed");
          if (isBlocking) {
            try { unblockSites(); } catch {}
            setIsBlocking(false);
          }
          return 0;
        }
        const next = prev - 1;
        const elapsed = totalSeconds - next;
        const progress = elapsed / totalSeconds; // 0 to 1

        // Ease-out curve: fast at start, slow at end
        // sqrt gives ~50% of stages revealed by ~25% of time
        const easedProgress = Math.sqrt(progress);
        const newStage = Math.min(
          Math.floor(easedProgress * NUM_STAGES),
          NUM_STAGES - 1
        );
        setArtStage(newStage);
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerStatus, totalSeconds]);

  // Celebration color cycling
  useEffect(() => {
    if (screen !== "completed") return;
    const colors = ["#C6A0F6", "#7FDBCA", "#F5A97F", "#E0F0FF", "#EED49F"];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % colors.length;
      setCelebrationColor(colors[idx]);
    }, 400);
    return () => clearInterval(interval);
  }, [screen]);

  const startSession = () => {
    if (!noblock && blockedSites.length > 0) {
      try {
        const sites = [...blockedSites, ...(extraBlocks || [])];
        blockSites(sites);
        setIsBlocking(true);
        setBlockError(null);
      } catch (err: any) {
        setBlockError(err?.message || "Failed to block sites");
      }
    }
    setTimerStatus("running");
  };

  // Keyboard handling
  useKeyboard((key) => {
    // Ctrl+C to quit from any screen
    if (key.ctrl && key.name === "c") {
      if (isBlocking) {
        try { unblockSites(); } catch {}
      }
      process.exit(0);
    }

    if (screen === "onboarding" || screen === "sites" || screen === "themes") return;

    if (key.name === "q") {
      if (isBlocking) {
        try { unblockSites(); } catch {}
      }
      process.exit(0);
    }

    if (screen === "timer") {
      if (key.name === "s" && timerStatus === "idle") {
        setScreen("sites");
        return;
      }
      if (key.name === "t" && timerStatus === "idle") {
        setScreen("themes");
        return;
      }
      if (key.name === "space") {
        if (timerStatus === "idle") {
          startSession();
        } else if (timerStatus === "running") {
          setTimerStatus("paused");
        } else if (timerStatus === "paused") {
          setTimerStatus("running");
        }
      }
      if (key.name === "r" && (timerStatus === "running" || timerStatus === "paused")) {
        // Stop session — unblock sites, reset timer, go back to idle
        if (isBlocking) {
          try { unblockSites(); } catch {}
          setIsBlocking(false);
        }
        setTimerStatus("idle");
        setRemainingSeconds(totalSeconds);
        setArtStage(0);
      }
      if (timerStatus === "idle") {
        if (key.name === "=" || key.name === "+") {
          const newTotal = totalSeconds + 300;
          setTotalSeconds(newTotal);
          setRemainingSeconds(newTotal);
        }
        if (key.name === "-") {
          const newTotal = Math.max(totalSeconds - 300, 60);
          setTotalSeconds(newTotal);
          setRemainingSeconds(newTotal);
        }
      }
    }

    if (screen === "completed") {
      if (key.name === "space") {
        setRemainingSeconds(totalSeconds);
        setArtStage(0);
        setTimerStatus("idle");
        setScreen("timer");
      }
    }
  });

  const handleOnboardingComplete = (result: OnboardingResult) => {
    setBlockedSites(result.blockedSites);
    setTotalSeconds(result.duration * 60);
    setRemainingSeconds(result.duration * 60);
    saveConfig({
      duration: result.duration,
      blockedSites: result.blockedSites,
    });
    setScreen("timer");
  };

  if (screen === "onboarding") {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (screen === "sites") {
    return (
      <SiteEditor
        currentSites={blockedSites}
        onSave={(sites) => {
          setBlockedSites(sites);
          saveConfig({ blockedSites: sites });
          setScreen("timer");
        }}
        onCancel={() => setScreen("timer")}
      />
    );
  }

  if (screen === "themes") {
    return (
      <ThemePicker
        themes={ALL_THEMES}
        currentTheme={currentTheme.name}
        onSelect={(theme) => {
          setCurrentTheme(theme);
          saveConfig({ theme: theme.name });
          setScreen("timer");
        }}
        onCancel={() => setScreen("timer")}
      />
    );
  }

  const progress =
    totalSeconds > 0 ? 1 - remainingSeconds / totalSeconds : 0;
  const timerColor =
    screen === "completed" ? celebrationColor : "#E0F0FF";

  return (
    <box flexDirection="column" width="100%" height="100%">
      {/* Header */}
      <box justifyContent="center" alignItems="center" width="100%">
        <text fg="#7FDBCA">
          {screen === "completed" ? "✦ tunl ✦" : "◉ tunl"}
        </text>
      </box>

      {/* Timer */}
      <TimerDisplay remaining={remainingSeconds} color={timerColor} />

      {/* Progress Bar */}
      <ProgressBar progress={progress} width={Math.min(width, 70)} />

      {/* Session info */}
      <box justifyContent="center" alignItems="center" width="100%">
        {screen === "completed" ? (
          <text fg={celebrationColor}>
            {"✦ Session complete! " +
              Math.round(totalSeconds / 60) +
              " minutes of pure focus. ✦"}
          </text>
        ) : blockError ? (
          <text fg="#ED8796">{"⚠ " + blockError}</text>
        ) : timerStatus === "idle" ? (
          <text fg="#9399B2">press space to start focusing</text>
        ) : timerStatus === "paused" ? (
          <text fg="#EED49F">paused — press space to resume</text>
        ) : (
          <text fg="#9399B2">stay focused...</text>
        )}
      </box>

      {/* Art Canvas */}
      <ArtCanvas stage={artStage} theme={currentTheme} animTick={animTick} />

      {/* Status Bar */}
      <StatusBar
        blockedCount={isBlocking ? blockedSites.length : 0}
        blockedSites={isBlocking ? blockedSites : []}
        timerStatus={screen === "completed" ? "finished" : timerStatus}
      />
    </box>
  );
}
