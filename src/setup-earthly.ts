import * as os from "os";
import * as fs from "fs";
import * as path from "path";
import * as semver from "semver";

import * as io from "@actions/io";
import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";

import { getVersionObject } from "./lib/get-version";
import { restoreCache } from "./cache-restore";

const IS_WINDOWS = process.platform === "win32";

async function run() {
  try {
    const nodeArchToReleaseArch = {
      x64: "amd64",
      arm: "arm64",
    };
    const nodePlatformToReleasePlatform = {
      darwin: "darwin",
      freebsd: "freebsd",
      linux: "linux",
      openbsd: "openbsd",
      win32: "windows",
    };
    const runnerPlatform = os.platform();
    const pkgName = "earthly";

    if (!(runnerPlatform in nodePlatformToReleasePlatform)) {
      throw new Error(
        `Unsupported operating system - ${pkgName} is only released for ${Object.keys(
          nodePlatformToReleasePlatform
        ).join(", ")}`
      );
    }

    const releasePlatform = nodePlatformToReleasePlatform[runnerPlatform];
    const osArch = os.arch();
    const releaseArch = nodeArchToReleaseArch[os.arch()] || osArch;

    const range = core.getInput("version");
    core.info(`Configured range: ${range}`);
    const version = await getVersionObject(range);

    const destination = path.join(os.homedir(), `.${pkgName}`);
    core.info(`Install destination is ${destination}`);

    const installationDir = path.join(destination, "bin");
    const installationPath = path.join(
      installationDir,
      `${pkgName}${IS_WINDOWS ? ".exe" : ""}`
    );
    core.info(`Matched version: ${version.tag_name}`);

    // first see if earthly is in the toolcache (installed locally)
    const toolcacheDir = tc.find(
      pkgName,
      semver.clean(version.tag_name) || version.tag_name.substring(1),
      os.arch()
    );

    if (toolcacheDir) {
      core.addPath(toolcacheDir);
      core.info(`using earthly from toolcache (${toolcacheDir})`);
      return;
    }

    // then try to restore earthly from the github action cache
    core.addPath(installationDir);
    const restored = await restoreCache(
      installationPath,
      semver.clean(version.tag_name) || version.tag_name.substring(1)
    );
    if (restored) {
      await fs.promises.chmod(installationPath, 0o755);
      return;
    }

    // finally, dowload earthly release binary
    await io
      .rmRF(installationDir)
      .catch()
      .then(() => {
        core.info(`Successfully deleted pre-existing ${installationDir}`);
      });

    const buildURL = `https://github.com/earthly/earthly/releases/download/${
      version.tag_name
    }/${pkgName}-${releasePlatform}-${releaseArch}${IS_WINDOWS ? ".exe" : ""}`;

    core.debug(`downloading ${buildURL}`);
    const downloaded = await tc.downloadTool(buildURL, installationPath);
    core.debug(`successfully downloaded ${buildURL} to ${downloaded}`);

    await fs.promises.chmod(installationPath, 0o755);

    await tc.cacheDir(
      path.join(destination, "bin"),
      pkgName,
      semver.clean(version.tag_name) || version.tag_name.substring(1),
      os.arch()
    );
    core.exportVariable("FORCE_COLOR", "1");
  } catch (error: unknown) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed(String(error));
    }
  }
}

run();
