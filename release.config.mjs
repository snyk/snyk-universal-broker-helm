/**
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
  branches: [
    {
      name: "main",
      prerelease: false,
    },
    {
      name: "rc",
      prerelease: true,
    },
  ],
  repositoryUrl: "git@github.com:snyk/snyk-universal-broker-helm.git",
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    [
      "@semantic-release/exec",
      {
        prepareCmd:
          "helm dep up && helm package --version ${nextRelease.version} .",
        // publishCmd:
        //   "helm push snyk-universal-broker-*.tgz oci://registry-1.docker.io/snyk",
        execCwd: "snyk-universal-broker",
      }
    ],
    [
      "@semantic-release/github",
      {
        assets: [
          {
            path: "snyk-universal-broker/snyk-universal-broker-*.tgz",
          },
        ],
        successCommentCondition: false,
        failCommentCondition: false,
      },
    ],
  ],
};
