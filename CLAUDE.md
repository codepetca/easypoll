# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EasyPoll is a real-time polling application built with SvelteKit and PartyKit. It allows users to create polls and see live voting results via WebSocket connections.

## Key Commands

### Development
```bash
npm run dev              # Run both SvelteKit and PartyKit dev servers
npm run dev:sveltekit    # Run only SvelteKit frontend
npm run dev:party        # Run only PartyKit WebSocket server
```

### Build & Deploy
```bash
npm run build            # Build production SvelteKit app
npm run preview          # Preview production build
npm run party:deploy     # Deploy PartyKit server to production
```

### Code Quality
```bash
npm run check            # TypeScript type checking
npm run check:watch      # Type check in watch mode
npm run lint             # Check code formatting
npm run format           # Auto-format code with Prettier
```

## Architecture

This is a full-stack real-time application with three main components:

1. **SvelteKit Frontend** (`src/routes/`)
   - Server-side rendering with client-side interactivity
   - Form actions for poll creation
   - WebSocket client for real-time updates

2. **PartyKit Backend** (`party/index.ts`)
   - WebSocket server handling real-time vote updates
   - HTTP endpoints for poll creation and retrieval
   - Persistent storage using PartyKit's room storage

3. **Shared Types** (`src/lib/types.ts`)
   - TypeScript interfaces used by both frontend and backend
   - Ensures type safety across WebSocket messages

## Key Patterns

### Poll Creation Flow
1. User submits form on homepage (`src/routes/+page.svelte`)
2. SvelteKit server action (`src/routes/+page.server.ts`) validates and sends to PartyKit
3. PartyKit stores poll data and returns poll ID
4. User is redirected to poll page

### Real-time Voting Flow
1. Poll page establishes WebSocket connection to PartyKit room
2. User clicks vote option, sends WebSocket message
3. PartyKit updates vote count and broadcasts to all connected clients
4. All clients receive update and re-render vote counts

### Data Storage
- Polls are stored in PartyKit room storage (persisted automatically)
- Each poll has its own room identified by poll ID
- Vote tracking uses client-side localStorage (not secure, suitable for casual polls)

## Important Files

- `party/index.ts` - WebSocket server and HTTP endpoints
- `src/routes/+page.server.ts` - Poll creation server logic
- `src/routes/[poll_id]/+page.svelte` - Poll voting interface with WebSocket client
- `src/lib/types.ts` - Shared TypeScript types

## Development Notes

- The app uses PartyKit's development server for local WebSocket testing
- Both servers must run for full functionality (`npm run dev`)
- Poll IDs are 9-character random strings
- No authentication system - all polls are anonymous
- Vote prevention is client-side only using localStorage