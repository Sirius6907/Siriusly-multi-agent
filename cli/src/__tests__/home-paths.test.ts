import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  describeLocalInstancePaths,
  expandHomePrefix,
  resolveSiriusHomeDir,
  resolveSiriusInstanceId,
} from "../config/home.js";

const ORIGINAL_ENV = { ...process.env };

describe("home path resolution", () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("defaults to ~/.sirius and default instance", () => {
    delete process.env.SIRIUS_HOME;
    delete process.env.SIRIUS_INSTANCE_ID;

    const paths = describeLocalInstancePaths();
    expect(paths.homeDir).toBe(path.resolve(os.homedir(), ".sirius"));
    expect(paths.instanceId).toBe("default");
    expect(paths.configPath).toBe(path.resolve(os.homedir(), ".sirius", "instances", "default", "config.json"));
  });

  it("supports SIRIUS_HOME and explicit instance ids", () => {
    process.env.SIRIUS_HOME = "~/sirius-home";

    const home = resolveSiriusHomeDir();
    expect(home).toBe(path.resolve(os.homedir(), "sirius-home"));
    expect(resolveSiriusInstanceId("dev_1")).toBe("dev_1");
  });

  it("rejects invalid instance ids", () => {
    expect(() => resolveSiriusInstanceId("bad/id")).toThrow(/Invalid instance id/);
  });

  it("expands ~ prefixes", () => {
    expect(expandHomePrefix("~")).toBe(os.homedir());
    expect(expandHomePrefix("~/x/y")).toBe(path.resolve(os.homedir(), "x/y"));
  });
});
