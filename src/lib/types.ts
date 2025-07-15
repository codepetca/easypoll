export interface Poll {
	id: string;
	title: string;
	options: string[];
	votes: { [option: string]: number };
}

export interface VoteMessage {
	type: 'vote';
	option: string;
}

export interface PollUpdateMessage {
	type: 'poll-update';
	poll: Poll;
}

export type Message = VoteMessage | PollUpdateMessage;
