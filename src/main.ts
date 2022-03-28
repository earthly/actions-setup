import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import * as os from "os";
import * as fs from "fs/promises";
import * as io from "@actions/io";
import * as path from "path";
import { getVersionObject } from "./lib/get-version";
import * as semver from "semver";

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
    const releaseArch = nodeArchToReleaseArch[os.arch()];

    const range = core.getInput("version");
    core.info(`Configured range: ${range}`);
    const version = await getVersionObject(range);

    core.info(`Matched version: ${version.tag_name}`);

    const destination = path.join(os.homedir(), `.${pkgName}`);
    core.info(`Install destination is ${destination}`);

    await io
      .rmRF(path.join(destination, "bin"))
      .catch()
      .then(() => {
        core.info(
          `Successfully deleted pre-existing ${path.join(destination, "bin")}`
        );
      });

    const buildURL = `https://github.com/earthly/earthly/releases/download/${version.tag_name}/${pkgName}-${releasePlatform}-${releaseArch}`;

    const downloaded = await tc.downloadTool(buildURL);
    core.debug(`successfully downloaded ${buildURL} to ${destination}`);

    await io.mkdirP(path.join(destination, "bin"));
    core.info(`Successfully created ${path.join(destination, "bin")}`);

    const oldPath = path.join(downloaded);
    const newPath = path.join(destination, "bin", pkgName);

    await io.mv(oldPath, newPath);
    core.info(`Successfully renamed ${oldPath} to ${newPath}`);

    await fs.chmod(newPath, 0o755);

    const cachedPath = await tc.cacheDir(
      path.join(destination, "bin"),
      pkgName,
      semver.clean(version.tag_name) || version.tag_name.substring(1)
    );
    core.addPath(cachedPath);
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
