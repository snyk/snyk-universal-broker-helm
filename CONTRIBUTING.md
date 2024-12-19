# Contributing

## Prerequisites

- Homebrew
- Helm `>3.8.0`
- Access to a K8s environment
- [Prettier](https://prettier.io/docs/en/install)

1. Install `make`, `pre-commit` with `brew bundle`
2. Install the `helm-unittest` Helm plugin:
   ```
   helm plugin install https://github.com/helm-unittest/helm-unittest --version=>0.6.0
   ```

## Set Up

Clone this repository with git.

The default branch is `rc`, which contains the latest release candidate of the Universal Broker Helm Chart.
The `main` branch is used to create releases of the Universal Broker Helm Chart only, and should not be committed to directly.

## Building

From within the cloned repository, fetch dependencies for the Universal Broker Helm Chart:

```
cd snyk-universal-broker
helm dep up
```

## Writing Tests

### Unit Tests

All unit tests end in `_test.yaml`, and are contained within [snyk-universal-broker/tests](snyk-universal-broker/tests).

Identify if the test relates to an already existing test suite - if not, create a new file within this directory.

Each test must include the default values file. Any other values may either be set in each test suite, or (if re-used across many suites) defined in the [fixtures](snyk-universal-broker/tests/fixtures) directory.

Snapshot testing is not permitted.

### Integration Tests

An integration exists that leverages the Snyk API to perform an import. This test is executed on each PR, written in TypeScript and is contained within [.circleci/scripts/testImport/](.circleci/scripts/testImport/). This test requires a Snyk Org to be configured with the Universal Broker ahead of time.

## Running Tests

From within the cloned repository, execute the `helm-unittest` plugin:

```
helm unittest snyk-universal-broker
```

Any test failures may be interrogated with the debug (`-d`), quick (`-q`) flags, and by targeting a specific test file (`-f`):

```
helm unittest -d -q -f tests/name_of_test.yaml snyk-universal-broker
```

Any rendered templates will be stored within a `.debug` directory.

## Code Style

### General

An [.editorconfig](.editorconfig) is included with this repository.

### Helm

Consider the use of Helm Templates to reduce duplication. Deeply nested Helm values are discouraged.

### TypeScript

Prettier is used to format `.ts` files, with configuration in [prettier.config.mjs](prettier.config.mjs).

### Markdown

Prettier will also format `.md` files.

## Updating Documentation

Any changes to Helm values must be reference in both the [values.yaml](snyk-universal-broker/values.yaml) and [values.schema.json](snyk-universal-broker/values.schema.json) files.

Within the [values.yaml](snyk-universal-broker/values.yaml) file, ensure the value exists within an appropriately named section (denoted by `## @section`). If one does not exist that is relevant, add one.

Each value must be accompanied with a description:

```
# @@param myNewValue [modifier?] Description
```

See the [Bitnami Readme Generator](https://github.com/bitnami/readme-generator-for-helm) for options.

If a value is added without a description, the pre-commit hook will fail.

## Creating Branches

Branches must be created with the following format:

```
type/description-of-change
```

Where `type` must be one of the recognised conventional commit types (`feat`, `fix`, `docs`, etc.)

When creating a new branch, use `rc` as the base.

## Creating Commits

Commits must follow the conventional commit standard.

| Type       | Description                                    |
| ---------- | ---------------------------------------------- |
| `feat`     | A new feature                                  |
| `fix`      | A fix for an existing feature                  |
| `chore`    | Changes to build, workflow or pipelines        |
| `test`     | Changes to tests for existing features         |
| `refactor` | Changes which do not affect existing features  |
| `docs`     | Changes to documentation for existing features |
| `revert`   | Reverting a previous commit                    |

Commits are consumed when creating a release to populate release notes. A commit message that focuses on _why_ something changes instead of _what_ changes can be more meaningful.

**Breaking changes are not permitted. Any changes must be backwards compatible.**

All commits _must_ be [signed](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits).

### Pre Commit Hooks

`pre-commit` will run before each commit, validating:

- No secrets are part of this commit
- Commits are well formed
- The [README.md](README.md) document is up-to-date with content from the [values.yaml](snyk-universal-broker/values.yaml) file
- Any TypeScript is appropriately formatted
- `helm-unittest` passes

All hooks must pass before creating a successful commit.

## Creating Pull Requests

All pull requests should initially be created as Drafts; this ensures tests pass before a review is requested. Pull Requests should target the `rc` branch.

### Pull Request Checks

When raising a pull request (and on each subsequent commit to the branch associated with a pull request) CircleCI will execute a Pull Request pipeline. The following steps are carried out:

- Secret and security scanning
- Chart Validation (helm-unittest, kubeconform)
- Documentation Validation (content in [README.md](README.md) matches [values.yaml](snyk-universal-broker/values.yaml))
- Deploy and Test (`helm install` and execute the Snyk Import integration test)

These stages must pass before a PR may be merged. Once ready, mark the PR as ready for review.

### Merging Pull Requests

The "squash and merge" method should not be used, as this masks the commit history of `rc` when merging to `main`.

## Creating Releases

The release process is orchestrated by CircleCI, and controlled by `semantic-release`, with configuration located in [release.config.mjs](release.config.mjs). This process occurs on the `rc` and `main` branches.

### Release Process

1. Commits are analyzed by `semantic-release` to generate Release Notes and a CHANGELOG entry.
2. The Universal Broker Helm Chart is packaged with the version as determined by `semantic-release`
3. A GitHub Release (or Pre-Release) is created with the packaged Helm Chart
4. The packaged Helm Chart is pushed to Dockerhub under `snyk/snyk-universal-broker`
5. The Helm Chart is signed with `cosign`

### Pre-Release

Every merge to the `rc` branch creates a pre-release candidate, with version `x.y.z-rc.N`, where `x.y.z` is the next version determined by semantic-release, and `N` is incremented by one from the previous pre-release candidate. Versions may be pulled by Helm with:

```
helm pull oci://registry-1.docker.io/snyk/snyk-universal-broker --version x.y.z-rc.N
```

### Release

When ready to create a public release, a PR is created from `rc` to `main`. The `chore:` prefix should be used to avoid mutating the version.

When merged, a release is created with version `x.y.z`. This version will drop the `-rc.N` suffix, and will become the default version when the Universal Broker Helm Chart is pulled.

### Chart Signing

The GitHub Actions certificate is used to perform keyless signing with cosign upon each pre-release and public release. See the [GitHub Actions Workflow](.github/workflows/sigstore.yml) for steps.

## Removing a Release

If a release must be removed:

- Delete the associated GitHub Release. Do not delete the tag to avoid version collision
- Delete the Helm Chart and corresponding signature artefact from DockerHub
