import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  listCodexSkills,
  syncCodexSkills,
} from "@siriusly/adapter-codex-local/server";

async function makeTempDir(prefix: string): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

describe("codex local skill sync", () => {
  const siriusKey = "siriusly/sirius/sirius";
  const cleanupDirs = new Set<string>();

  afterEach(async () => {
    await Promise.all(Array.from(cleanupDirs).map((dir) => fs.rm(dir, { recursive: true, force: true })));
    cleanupDirs.clear();
  });

  it("reports configured Sirius EcoSystem skills for workspace injection on the next run", async () => {
    const codexHome = await makeTempDir("sirius-codex-skill-sync-");
    cleanupDirs.add(codexHome);

    const ctx = {
      agentId: "agent-1",
      companyId: "company-1",
      adapterType: "codex_local",
      config: {
        env: {
          CODEX_HOME: codexHome,
        },
        siriusSkillSync: {
          desiredSkills: [siriusKey],
        },
      },
    } as const;

    const before = await listCodexSkills(ctx);
    expect(before.mode).toBe("ephemeral");
    expect(before.desiredSkills).toContain(siriusKey);
    expect(before.entries.find((entry) => entry.key === siriusKey)?.required).toBe(true);
    expect(before.entries.find((entry) => entry.key === siriusKey)?.state).toBe("configured");
    expect(before.entries.find((entry) => entry.key === siriusKey)?.detail).toContain("CODEX_HOME/skills/");
  });

  it("does not persist Sirius EcoSystem skills into CODEX_HOME during sync", async () => {
    const codexHome = await makeTempDir("sirius-codex-skill-prune-");
    cleanupDirs.add(codexHome);

    const configuredCtx = {
      agentId: "agent-2",
      companyId: "company-1",
      adapterType: "codex_local",
      config: {
        env: {
          CODEX_HOME: codexHome,
        },
        siriusSkillSync: {
          desiredSkills: [siriusKey],
        },
      },
    } as const;

    const after = await syncCodexSkills(configuredCtx, [siriusKey]);
    expect(after.mode).toBe("ephemeral");
    expect(after.entries.find((entry) => entry.key === siriusKey)?.state).toBe("configured");
    await expect(fs.lstat(path.join(codexHome, "skills", "sirius"))).rejects.toMatchObject({
      code: "ENOENT",
    });
  });

  it("keeps required bundled Sirius EcoSystem skills configured even when the desired set is emptied", async () => {
    const codexHome = await makeTempDir("sirius-codex-skill-required-");
    cleanupDirs.add(codexHome);

    const configuredCtx = {
      agentId: "agent-2",
      companyId: "company-1",
      adapterType: "codex_local",
      config: {
        env: {
          CODEX_HOME: codexHome,
        },
        siriusSkillSync: {
          desiredSkills: [],
        },
      },
    } as const;

    const after = await syncCodexSkills(configuredCtx, []);
    expect(after.desiredSkills).toContain(siriusKey);
    expect(after.entries.find((entry) => entry.key === siriusKey)?.state).toBe("configured");
  });

  it("normalizes legacy flat Sirius EcoSystem skill refs before reporting configured state", async () => {
    const codexHome = await makeTempDir("sirius-codex-legacy-skill-sync-");
    cleanupDirs.add(codexHome);

    const snapshot = await listCodexSkills({
      agentId: "agent-3",
      companyId: "company-1",
      adapterType: "codex_local",
      config: {
        env: {
          CODEX_HOME: codexHome,
        },
        siriusSkillSync: {
          desiredSkills: ["sirius"],
        },
      },
    });

    expect(snapshot.warnings).toEqual([]);
    expect(snapshot.desiredSkills).toContain(siriusKey);
    expect(snapshot.desiredSkills).not.toContain("sirius");
    expect(snapshot.entries.find((entry) => entry.key === siriusKey)?.state).toBe("configured");
    expect(snapshot.entries.find((entry) => entry.key === "sirius")).toBeUndefined();
  });
});
