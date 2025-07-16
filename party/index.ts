import type * as Party from 'partykit/server';
import {
	Poll,
	VoteMessage,
	PollUpdateMessage,
	Message,
	CreatePollRequest,
	MessageSchema,
	CreatePollRequestSchema,
	PollSchema
} from './types';

export default class PollServer implements Party.Server {
	constructor(readonly room: Party.Room) {}

	// Store poll data in memory
	poll: Poll | null = null;

	// Load poll data from storage when the room starts
	async onStart() {
		const storedPoll = await this.room.storage.get<Poll>('poll');
		if (storedPoll) {
			this.poll = storedPoll;
		}
	}

	// Handle new WebSocket connections
	async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
		// Send current poll data to new connections
		if (this.poll) {
			conn.send(
				JSON.stringify({
					type: 'poll-update',
					poll: this.poll
				} as PollUpdateMessage)
			);
		}
	}

	// Handle incoming WebSocket messages
	async onMessage(message: string, sender: Party.Connection) {
		try {
			const data = JSON.parse(message);
			const validatedMessage = MessageSchema.parse(data);

			if (validatedMessage.type === 'vote' && this.poll) {
				// Process the vote
				if (this.poll.options.includes(validatedMessage.option)) {
					this.poll.votes[validatedMessage.option] = (this.poll.votes[validatedMessage.option] || 0) + 1;

					// Save updated poll to storage
					await this.savePoll();

					// Broadcast updated poll to all connected clients
					this.room.broadcast(
						JSON.stringify({
							type: 'poll-update',
							poll: this.poll
						} as PollUpdateMessage)
					);
				}
			}
		} catch (error) {
			console.error('Error processing message:', error);
		}
	}

	// Handle HTTP requests (for creating polls)
	async onRequest(req: Party.Request): Promise<Response> {
		const url = new URL(req.url);

		if (req.method === 'POST') {
			try {
				const data = await req.json();
				const validatedData = CreatePollRequestSchema.parse(data);

				const title = validatedData.title || 'Anonymous poll';
				const options = validatedData.options || [];

				// Validate options
				if (options.length < 2) {
					return new Response('At least 2 options required', { status: 400 });
				}

				// Create new poll
				const poll: Poll = {
					id: this.room.id,
					title: title,
					options: options,
					votes: {}
				};

				// Initialize votes for each option
				options.forEach((option: string) => {
					poll.votes[option] = 0;
				});

				// Validate the created poll
				const validatedPoll = PollSchema.parse(poll);
				this.poll = validatedPoll;
				await this.savePoll();

				return new Response(JSON.stringify(validatedPoll), {
					headers: { 'Content-Type': 'application/json' }
				});
			} catch (error) {
				console.error('Error creating poll:', error);
				return new Response('Bad Request', { status: 400 });
			}
		}

		if (req.method === 'GET') {
			// Return current poll data
			if (this.poll) {
				return new Response(JSON.stringify(this.poll), {
					headers: { 'Content-Type': 'application/json' }
				});
			} else {
				return new Response('Not found', { status: 404 });
			}
		}

		return new Response('Method not allowed', { status: 405 });
	}

	// Helper method to save poll to storage
	private async savePoll() {
		if (this.poll) {
			await this.room.storage.put('poll', this.poll);
		}
	}
}

PollServer satisfies Party.Worker;
