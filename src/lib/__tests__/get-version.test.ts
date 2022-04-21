import * as playback from "jest-playback";
import { getVersionObject } from "../get-version";
playback.setup(__dirname);

describe("get-version", () => {
  // process.env.GITHUB_TOKEN = process.env.GITHUB_TOKEN || "my-token";
  describe("range versions", () => {
    it.each([
      "latest",
      "^0",
      "0.*.*",
      "0.4.*",
      "v0.4.*",
      "0.6.1",
      "v0.6.0",
      "0.6.1",
    ] as const)("should match %s versions", async (ver) => {
      const v = await getVersionObject(ver);
      expect(v.tag_name).toMatchSnapshot();
    });
  });
});
