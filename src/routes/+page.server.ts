import { redirect } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

// Fallback to default development URL if not set
const PARTYKIT_URL = env.PARTYKIT_URL || 'http://127.0.0.1:1999';

export const actions: Actions = {
	createPoll: async ({ request }) => {
		const data = await request.formData();
		const title = data.get('title')?.toString() ?? 'Anonymous poll';

		// Get options from form data
		const options: string[] = [];
		let i = 0;
		while (data.has(`option-${i}`)) {
			const option = data.get(`option-${i}`)?.toString();
			if (option && option.trim()) {
				options.push(option.trim());
			}
			i++;
		}

		// Ensure we have at least 2 options
		if (options.length < 2) {
			return {
				error: 'Please provide at least 2 options'
			};
		}

		// Generate a random poll ID
		const pollId = Math.random().toString(36).substr(2, 9);

		try {
			// Create poll on PartyKit server
			const response = await fetch(`${PARTYKIT_URL}/parties/main/${pollId}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					title,
					options
				})
			});

			if (!response.ok) {
				throw new Error('Failed to create poll');
			}

			// Redirect to the poll page
			throw redirect(302, `/${pollId}`);
		} catch (error) {
			if (error instanceof Response) {
				throw error; // Re-throw redirect
			}

			return {
				error: 'Failed to create poll. Please try again.'
			};
		}
	}
};
