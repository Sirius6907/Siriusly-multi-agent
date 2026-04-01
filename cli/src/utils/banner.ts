import pc from "picocolors";

const SIRIUS_ART = [
  "███████╗██╗██████╗ ██╗██╗   ██╗███████╗",
  "██╔════╝██║██╔══██╗██║██║   ██║██╔════╝",
  "███████╗██║██████╔╝██║██║   ██║███████╗",
  "╚════██║██║██╔══██╗██║██║   ██║╚════██║",
  "███████║██║██║  ██║██║╚██████╔╝███████║",
  "╚══════╝╚═╝╚═╝  ╚═╝╚═╝ ╚═════╝ ╚══════╝",
] as const;

const TAGLINE = "Open-source orchestration for zero-human companies";

export function printSiriusCliBanner(): void {
  const lines = [
    "",
    ...SIRIUS_ART.map((line) => pc.cyan(line)),
    pc.blue("  ───────────────────────────────────────────────────────"),
    pc.bold(pc.white(`  ${TAGLINE}`)),
    "",
  ];

  console.log(lines.join("\n"));
}
