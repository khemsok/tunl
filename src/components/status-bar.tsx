import { COLORS } from "../theme";

export function StatusBar({
  blockedCount,
  blockedSites,
  timerStatus,
}: {
  blockedCount: number;
  blockedSites: string[];
  timerStatus: "idle" | "running" | "paused" | "finished";
}) {
  const sitesDisplay =
    blockedSites.length > 0
      ? blockedSites.join(", ")
      : "";

  return (
    <box
      flexDirection="column"
      width="100%"
      borderStyle="single"
      border={["top"]}
      borderColor={COLORS.border}
    >
      <box justifyContent="center" alignItems="center" width="100%">
        <text>
          <span fg={COLORS.textMuted}>q</span>
          <span fg={COLORS.textDim}> quit</span>
          <span fg={COLORS.border}> · </span>
          <span fg={COLORS.textMuted}>space</span>
          <span fg={COLORS.textDim}>
            {timerStatus === "idle" ? " start" :
             timerStatus === "running" ? " pause" :
             timerStatus === "paused" ? " resume" : " restart"}
          </span>
          {timerStatus === "idle" && (
            <>
              <span fg={COLORS.border}> · </span>
              <span fg={COLORS.textMuted}>+/-</span>
              <span fg={COLORS.textDim}> time</span>
              <span fg={COLORS.border}> · </span>
              <span fg={COLORS.textMuted}>s</span>
              <span fg={COLORS.textDim}> sites</span>
              <span fg={COLORS.border}> · </span>
              <span fg={COLORS.textMuted}>t</span>
              <span fg={COLORS.textDim}> theme</span>
              <span fg={COLORS.border}> · </span>
              <span fg={COLORS.textMuted}>i</span>
              <span fg={COLORS.textDim}> stats</span>
            </>
          )}
          {(timerStatus === "running" || timerStatus === "paused") && (
            <>
              <span fg={COLORS.border}> · </span>
              <span fg={COLORS.textMuted}>r</span>
              <span fg={COLORS.textDim}> stop</span>
            </>
          )}
          {timerStatus === "running" && blockedCount > 0 && (
            <>
              <span fg={COLORS.border}> · </span>
              <span fg={COLORS.error}>✕ {blockedCount} blocked</span>
            </>
          )}
        </text>
      </box>
    </box>
  );
}
