import { z } from 'zod';

// Poll schema
export const PollSchema = z.object({
	id: z.string(),
	title: z.string(),
	options: z.array(z.string()).min(2),
	votes: z.record(z.string(), z.number())
});

// Vote message schema
export const VoteMessageSchema = z.object({
	type: z.literal('vote'),
	option: z.string()
});

// Poll update message schema
export const PollUpdateMessageSchema = z.object({
	type: z.literal('poll-update'),
	poll: PollSchema
});

// Union of all WebSocket message types
export const MessageSchema = z.discriminatedUnion('type', [
	VoteMessageSchema,
	PollUpdateMessageSchema
]);

// HTTP request schema for creating a poll
export const CreatePollRequestSchema = z.object({
	title: z.string().optional(),
	options: z.array(z.string()).optional()
});

// Export TypeScript types inferred from schemas
export type Poll = z.infer<typeof PollSchema>;
export type VoteMessage = z.infer<typeof VoteMessageSchema>;
export type PollUpdateMessage = z.infer<typeof PollUpdateMessageSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type CreatePollRequest = z.infer<typeof CreatePollRequestSchema>;