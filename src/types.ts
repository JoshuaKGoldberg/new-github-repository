import type * as OctokitTypes from "@octokit/openapi-types";

import { Octokit } from "octokit";

export interface NewGitHubRepositoryResult {
	/**
	 * Whether the repository seems to have finished being initialized by GitHub.
	 */
	data: OctokitRepositoryData;

	initialized: boolean;
}

export interface NewGitHubRepositorySettings extends RepositoryLocator {
	octokit?: Octokit;

	/**
	 * Whether to create the repository as private (default: `false`).
	 */
	private?: boolean;

	template?: RepositoryLocator;
}

export type OctokitRepositoryData =
	OctokitTypes.components["schemas"]["full-repository"];

export interface RepositoryLocator {
	owner: string;
	repository: string;
}
