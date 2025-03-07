import { octokitFromAuth } from "octokit-from-auth";

import {
	NewGitHubRepositoryResult,
	NewGitHubRepositorySettings,
} from "./types.js";

export async function newGitHubRepository(
	settings: NewGitHubRepositorySettings,
): Promise<NewGitHubRepositoryResult> {
	const { octokit = await octokitFromAuth(), template, ...locator } = settings;
	let response;

	if (template) {
		response = await octokit.rest.repos.createUsingTemplate({
			name: locator.repository,
			owner: locator.owner,
			template_owner: template.owner,
			template_repo: template.repository,
		});
	} else {
		const currentUser = await octokit.rest.users.getAuthenticated();

		if (currentUser.data.login === locator.owner) {
			response = await octokit.rest.repos.createForAuthenticatedUser({
				name: locator.repository,
			});
		} else {
			response = await octokit.rest.repos.createInOrg({
				name: locator.repository,
				org: locator.owner,
			});
		}
	}

	// GitHub asynchronously initializes default repo metadata such as labels.
	// There's no built-in API to determine whether initialization is done,
	// but we can approximate that by polling for whether labels are created.
	// https://github.com/JoshuaKGoldberg/bingo/issues/243
	let knownLabelsLength = 0;

	// Labels aren't all created at once: GitHub populates them asynchronously.
	// We need to wait until the number of labels stops changing.
	// https://github.com/JoshuaKGoldberg/bingo/issues/251
	let matchedLabelsLength = false;

	// We limit retries case of GitHub slowness or an org with no default labels.
	// Initial testing on a fast network found the maximum needed to be ~20-25.
	for (let i = 0; i < 35; i += 1) {
		const { data: labels } = await octokit.request(
			"GET /repos/{owner}/{repo}/labels",
			{
				owner: locator.owner,
				repo: locator.repository,
			},
		);

		if (knownLabelsLength && labels.length === knownLabelsLength) {
			if (matchedLabelsLength) {
				break;
			}

			matchedLabelsLength = true;
			continue;
		}

		knownLabelsLength = labels.length;
		matchedLabelsLength = false;
	}

	return {
		data: response.data,
		initialized: !!matchedLabelsLength,
	};
}
