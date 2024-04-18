import { Octokit } from "@octokit/core";
import { Endpoints } from "@octokit/types";
import { maxSatisfying, gte } from "semver";
import { paginateRest } from "@octokit/plugin-paginate-rest";
import * as core from "@actions/core";

type ReleaseResponse =
  Endpoints["GET /repos/{owner}/{repo}/releases"]["response"]["data"][0];

export async function getVersionObject(
  range: string,
  prerelease: boolean,
): Promise<ReleaseResponse> {
  const MyOctokit = Octokit.plugin(paginateRest);
  const octokit = new MyOctokit({
    auth:
      core.getInput("github-token") || process.env.GITHUB_TOKEN || undefined,
  });
  const versions = (
    await octokit.paginate("GET /repos/{owner}/{repo}/releases", {
      owner: "idodod",
      repo: "earthly",
      per_page: 100,
    })
  ).filter(release => {
    return (prerelease || !release.prerelease) && release.assets?.length > 0;
  }).reduce((acc, cur) => {
    // remove 'v' from tag name
    const tag = cur.tag_name.substring(1);

    acc[tag] = cur;

    return acc;
  }, {} as Record<string, ReleaseResponse>);

  if (range == "latest") {
    const latest = Object.keys(versions).reduce((prev, cur) => {
      return gte(cur, prev) ? cur : prev;
    });
    invariant(latest, "expect a latest version to exists");
    return versions[latest];
  }

  const resp = maxSatisfying(Object.keys(versions), range);
  if (resp === null) {
    throw new Error(
      "Could not find a version that satisfied the version range"
    );
  }

  const ver = versions[resp];
  if (!ver) {
    throw new Error(
      "Could not find a version that satisfied the version range"
    );
  }

  return ver;
}

/* eslint @typescript-eslint/explicit-module-boundary-types: 0 */
export function invariant(
  condition: unknown,
  message?: string
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}
