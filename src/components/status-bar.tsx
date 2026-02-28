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
      borderColor="#6C7086"
    >
      {/* Controls row — context-sensitive */}
      <box justifyContent="center" alignItems="center" width="100%">
        <text>
          <span fg="#9399B2">q</span>
          <span fg="#7F849C"> quit</span>
          <span fg="#6C7086"> · </span>
          <span fg="#9399B2">space</span>
          <span fg="#7F849C">
            {timerStatus === "idle" ? " start" :
             timerStatus === "running" ? " pause" :
             timerStatus === "paused" ? " resume" : " restart"}
          </span>
          {timerStatus === "idle" && (
            <>
              <span fg="#6C7086"> · </span>
              <span fg="#9399B2">+/-</span>
              <span fg="#7F849C"> time</span>
              <span fg="#6C7086"> · </span>
              <span fg="#9399B2">s</span>
              <span fg="#7F849C"> sites</span>
              <span fg="#6C7086"> · </span>
              <span fg="#9399B2">t</span>
              <span fg="#7F849C"> theme</span>
            </>
          )}
          {(timerStatus === "running" || timerStatus === "paused") && (
            <>
              <span fg="#6C7086"> · </span>
              <span fg="#9399B2">r</span>
              <span fg="#7F849C"> stop</span>
            </>
          )}
          {timerStatus === "running" && blockedCount > 0 && (
            <>
              <span fg="#6C7086"> · </span>
              <span fg="#ED8796">✕ {blockedCount} blocked</span>
            </>
          )}
        </text>
      </box>
    </box>
  );
}
