import { getVersionObject } from "../get-version";
import * as semver from 'semver';

// The latest version since this test was last changed
// Feel free to update it if earthly has been updated
const latest = '0.6.23';

describe("get-version", () => {
  describe('latest range versions', () => {
    it.each(["latest", "^0", "0.*.*"] as const)("should match %s versions", async (ver) => {
      const v = await getVersionObject(ver);
      expect(semver.gte(v.tag_name, latest));
    });
  });
  describe("range versions", () => {
    it.each([{spec: "0.4.*", gte: "0.4.0"}, {spec: "v0.4.*", gte: "0.4.0"}, {spec: "0.6.1", eq: '0.6.1'}, {spec: "v0.6.0", eq: "0.6.1"}] as const)("should match %s versions", async (test) => {
      const v = await getVersionObject(test.spec);
      if (test.gte) expect(semver.gte(v.tag_name, test.gte));
      if (test.eq) expect(semver.eq(v.tag_name, test.eq));
    });
  });
});
