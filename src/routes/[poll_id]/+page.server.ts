import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import type { Poll } from '$lib/types';
import { env } from '$env/dynamic/private';

// Fallback to default development URL if not set
const PARTYKIT_URL = env.PARTYKIT_URL || 'http://127.0.0.1:1999';

export const load: PageLoad = async ({ params, fetch }) => {
	const pollId = params.poll_id;

	try {
		const response = await fetch(`${PARTYKIT_URL}/parties/main/${pollId}`);

		if (!response.ok) {
			if (response.status === 404) {
				throw error(404, 'Poll not found');
			}
			throw error(500, 'Failed to load poll');
		}

		const poll: Poll = await response.json();

		return {
			poll,
			pollId
		};
	} catch (err) {
		if (err instanceof Response) {
			throw err;
		}
		throw error(500, 'Failed to load poll');
	}
};
