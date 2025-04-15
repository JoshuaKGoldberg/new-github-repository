<h1 align="center">New Github Repository</h1>

<p align="center">
	Creates a new repository on GitHub, including waiting for initialization.
	🆕
</p>

<p align="center">
	<!-- prettier-ignore-start -->
	<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
	<a href="#contributors" target="_blank"><img alt="👪 All Contributors: 1" src="https://img.shields.io/badge/%F0%9F%91%AA_all_contributors-1-21bb42.svg" /></a>
<!-- ALL-CONTRIBUTORS-BADGE:END -->
	<!-- prettier-ignore-end -->
	<a href="https://github.com/JoshuaKGoldberg/new-github-repository/blob/main/.github/CODE_OF_CONDUCT.md" target="_blank"><img alt="🤝 Code of Conduct: Kept" src="https://img.shields.io/badge/%F0%9F%A4%9D_code_of_conduct-kept-21bb42" /></a>
	<a href="https://codecov.io/gh/JoshuaKGoldberg/new-github-repository" target="_blank"><img alt="🧪 Coverage" src="https://img.shields.io/codecov/c/github/JoshuaKGoldberg/new-github-repository?label=%F0%9F%A7%AA%20coverage" /></a>
	<a href="https://github.com/JoshuaKGoldberg/new-github-repository/blob/main/LICENSE.md" target="_blank"><img alt="📝 License: MIT" src="https://img.shields.io/badge/%F0%9F%93%9D_license-MIT-21bb42.svg" /></a>
	<a href="http://npmjs.com/package/new-github-repository" target="_blank"><img alt="📦 npm version" src="https://img.shields.io/npm/v/new-github-repository?color=21bb42&label=%F0%9F%93%A6%20npm" /></a>
	<img alt="💪 TypeScript: Strict" src="https://img.shields.io/badge/%F0%9F%92%AA_typescript-strict-21bb42.svg" />
</p>

## Usage

```shell
npm i new-github-repository
```

```ts
import { newGitHubRepository } from "new-github-repository";

await newGitHubRepository({
	owner: "YourUsername",
	repository: "a-great-new-repository",
});
```

`newGitHubRepository` returns an object containing:

- `data`: response data from the GitHub OpenAPI REST call to create the repository
- `initialized`: whether polling the GitHub API (see: [Why Polling?](#why-polling)) seemed to show the repository done being created

`newGitHubRepository` allows the following properties in its parameter object:

- Required:
  - `owner` _(`string`)_: owning user or organization to create the repository under
  - `repository` _(`string`)_: name of the repository to create
- Optional:
  - `octokit` _(`Octokit`)_: [Octokit](https://github.com/octokit/octokit.js#octokit-api-client) instance to use for requests
  - `template` _(`{ owner, string }`)_: locator of a [GitHub template repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository) to create from

### `octokit`

[Octokit](https://github.com/octokit/octokit.js#octokit-api-client) instance to use for requests.
If not provided, defaults to creating one with [`octokit-from-auth`](https://github.com/JoshuaKGoldberg/octokit-from-auth).

Manually passing an `octokit` can be useful if you already have one created separately and/or wish to customize how the GitHub API is interacted with:

```ts
import { newGitHubRepository } from "new-github-repository";
import { Octokit } from "octokit";

const octokit = new Octokit({ auth: "personal-access-token123" });

await newGitHubRepository({
	octokit,
	owner: "YourUsername",
	repository: "a-great-new-repository",
});
```

### `template`

Locator of a [GitHub template repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository) to create from.

Repositories created by a template repository show a _"generated from ..."_ notice in their homepage header that links to their template.

```ts
import { newGitHubRepository } from "new-github-repository";

await newGitHubRepository({
	owner: "YourUsername",
	repository: "a-great-new-repository",
	template: {
		owner: "JoshuaKGoldberg",
		repository: "create-typescript-app",
	},
});
```

## Why?

> Or: why not create repositories by directly calling the GitHub API?

`new-github-repository` smooths over two areas of GitHub repository creation:

- There are three different APIs to create a new repository, depending on how it should be formed:
  - [Creating from a template repository](https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#create-a-repository-using-a-template)
  - [Creating a repository for the authenticated user](https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#create-a-repository-for-the-authenticated-user)
  - [Creating an organization repository](https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#create-an-organization-repository)
- GitHub asynchronously initializes default repository metadata such as labels after the creation API call completes

It also handles creating an authenticated Octokit for you with [`octokit-from-auth`](https://github.com/JoshuaKGoldberg/octokit-from-auth).

### Why Polling?

At time of writing, GitHub does not provide an API to determine whether a repository's asynchronous initialization is complete.
Most noticeably, repository labels aren't created immediately, or even all at once.
Labels are added in over several seconds after a repository is created.

[Organization repositories may change default labels](https://docs.github.com/en/organizations/managing-organization-settings/managing-default-labels-for-repositories-in-your-organization) -including during repository creation- so it is not enough to check whether the number of repository labels matches an expected number.
The only known way to determine whether labels have finished being populated seems to be to check whether they've stopped being added over multiple API calls.

After creating a repository, `newGitHubRepository` continuously polls the [repository labels API](https://docs.github.com/en/rest/issues/labels?apiVersion=2022-11-28#list-labels-for-a-repository) up to an arbitrary 35 times.
It waits until the number of labels is the same non-zero number three times in a row.

## Development

See [`.github/CONTRIBUTING.md`](./.github/CONTRIBUTING.md), then [`.github/DEVELOPMENT.md`](./.github/DEVELOPMENT.md).
Thanks! 🆕

## Contributors

<!-- spellchecker: disable -->
<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center"><a href="http://www.joshuakgoldberg.com"><img src="https://avatars.githubusercontent.com/u/3335181?v=4?s=100" width="100px;" alt="Josh Goldberg ✨"/><br /><sub><b>Josh Goldberg ✨</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/new-github-repository/commits?author=JoshuaKGoldberg" title="Code">💻</a> <a href="#content-JoshuaKGoldberg" title="Content">🖋</a> <a href="https://github.com/JoshuaKGoldberg/new-github-repository/commits?author=JoshuaKGoldberg" title="Documentation">📖</a> <a href="#ideas-JoshuaKGoldberg" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-JoshuaKGoldberg" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-JoshuaKGoldberg" title="Maintenance">🚧</a> <a href="#projectManagement-JoshuaKGoldberg" title="Project Management">📆</a> <a href="#tool-JoshuaKGoldberg" title="Tools">🔧</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
<!-- spellchecker: enable -->

> 💝 This package was templated with [`create-typescript-app`](https://github.com/JoshuaKGoldberg/create-typescript-app) using the [Bingo engine](https://create.bingo).
