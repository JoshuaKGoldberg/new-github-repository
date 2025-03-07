import { Octokit } from "octokit";
import { describe, expect, it, vi } from "vitest";

import { newGitHubRepository } from "./newGitHubRepository.js";

const locator = { owner: "StubOwner", repository: "stub-repository" };

const mockCreateUsingTemplate = vi.fn();
const mockCreateInOrg = vi.fn();
const mockCreateForAuthenticatedUser = vi.fn();
const mockGetAuthenticated = vi.fn();
const mockRequest = vi.fn();

const mockRepositoryResponse = {
	data: { created: true },
};

const createMockOctokit = () =>
	({
		request: mockRequest,
		rest: {
			repos: {
				createForAuthenticatedUser:
					mockCreateForAuthenticatedUser.mockResolvedValue(
						mockRepositoryResponse,
					),
				createInOrg: mockCreateInOrg.mockResolvedValue(mockRepositoryResponse),
				createUsingTemplate: mockCreateUsingTemplate.mockResolvedValue(
					mockRepositoryResponse,
				),
			},
			users: {
				getAuthenticated: mockGetAuthenticated,
			},
		},
	}) as unknown as Octokit;

describe("newGitHubRepository", () => {
	it("creates using a template when one is provided", async () => {
		mockRequest.mockResolvedValue({ data: [{}] });

		const template = {
			owner: "JoshuaKGoldberg",
			repository: "create-typescript-app",
		};

		const actual = await newGitHubRepository({
			...locator,
			octokit: createMockOctokit(),
			template,
		});

		expect(actual).toEqual({
			data: mockRepositoryResponse.data,
			initialized: true,
		});
		expect(mockCreateForAuthenticatedUser).not.toHaveBeenCalled();
		expect(mockCreateInOrg).not.toHaveBeenCalled();
		expect(mockCreateUsingTemplate).toHaveBeenCalledWith({
			name: locator.repository,
			owner: locator.owner,
			template_owner: template.owner,
			template_repo: template.repository,
		});
	});

	it("creates under the user when the user is the owner", async () => {
		mockGetAuthenticated.mockResolvedValueOnce({
			data: {
				login: locator.owner,
			},
		});
		mockRequest.mockResolvedValue({ data: [{}] });

		const actual = await newGitHubRepository({
			...locator,
			octokit: createMockOctokit(),
		});

		expect(actual).toEqual({
			data: mockRepositoryResponse.data,
			initialized: true,
		});
		expect(mockCreateForAuthenticatedUser).toHaveBeenCalledWith({
			name: locator.repository,
		});
		expect(mockCreateInOrg).not.toHaveBeenCalled();
		expect(mockCreateUsingTemplate).not.toHaveBeenCalled();
	});

	it("creates under an org when the user is not the owner", async () => {
		const login = "other-user";
		mockGetAuthenticated.mockResolvedValueOnce({ data: { login } });
		mockRequest.mockResolvedValue({ data: [{}] });

		const actual = await newGitHubRepository({
			...locator,
			octokit: createMockOctokit(),
		});

		expect(actual).toEqual({
			data: mockRepositoryResponse.data,
			initialized: true,
		});
		expect(mockCreateForAuthenticatedUser).not.toHaveBeenCalled();
		expect(mockCreateInOrg).toHaveBeenCalledWith({
			name: locator.repository,
			org: locator.owner,
		});
		expect(mockCreateUsingTemplate).not.toHaveBeenCalled();
	});

	it("resolves only after labels have the same length thrice in a row when the repository does not have labels for fewer than 35 calls", async () => {
		mockGetAuthenticated.mockResolvedValueOnce({ data: {} });
		mockRequest
			.mockResolvedValueOnce({ data: [] })
			.mockResolvedValueOnce({ data: [] })
			.mockResolvedValueOnce({ data: [{}] })
			.mockResolvedValueOnce({ data: [{}] })
			.mockResolvedValueOnce({ data: [{}] });

		const actual = await newGitHubRepository({
			...locator,
			octokit: createMockOctokit(),
		});

		expect(actual).toEqual({
			data: mockRepositoryResponse.data,
			initialized: true,
		});
		expect(mockRequest).toHaveBeenCalledTimes(5);
	});

	it("resolves after 35 retries when the repository does not have labels for 35 calls", async () => {
		mockGetAuthenticated.mockResolvedValueOnce({ data: {} });
		mockRequest.mockResolvedValue({ data: [] });

		const actual = await newGitHubRepository({
			...locator,
			octokit: createMockOctokit(),
		});

		expect(actual).toEqual({
			data: mockRepositoryResponse.data,
			initialized: false,
		});
		expect(mockRequest).toHaveBeenCalledTimes(35);
	});

	it("resolves after 35 retries when the repository labels keep increasing in count for 35 calls", async () => {
		let callCount = 0;

		mockGetAuthenticated.mockResolvedValueOnce({ data: {} });
		mockRequest.mockImplementation(() => {
			callCount += 1;
			return Promise.resolve({ data: new Array(callCount).map(() => ({})) });
		});

		const actual = await newGitHubRepository({
			...locator,
			octokit: createMockOctokit(),
		});

		expect(actual).toEqual({
			data: mockRepositoryResponse.data,
			initialized: false,
		});
		expect(mockRequest).toHaveBeenCalledTimes(35);
	});
});
