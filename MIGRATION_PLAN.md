# Migration Plan: Server-Generated Polls with Zod Validation

## Overview
This document outlines the phased migration from user-created polls to server-generated polls, with improved type safety using Zod validation and better code organization.

## Goals
1. Move poll content generation to the PartyKit server
2. Add Zod validation for runtime type safety
3. Organize code into logical modules with clear separation of concerns
4. Maintain backward compatibility during migration
5. Enable future AI-powered question generation

## Phase 1: Add Zod and Create Party Server Types (No Breaking Changes)

### Tasks
1. **Install Zod dependency**
   ```bash
   npm install zod
   ```

2. **Create `party/types.ts`**
   - Define Zod schemas for all message types
   - Export inferred TypeScript types
   - Schemas to include:
     - `PollSchema`: Complete poll structure
     - `VoteMessageSchema`: Vote WebSocket message
     - `PollUpdateMessageSchema`: Poll update broadcast
     - `CreatePollRequestSchema`: HTTP POST body
     - `MessageSchema`: Union of all WebSocket messages

3. **Update `party/index.ts`**
   - Import types from `party/types.ts`
   - Replace inline type definitions
   - Add Zod validation in message handlers

### Testing
- Run existing frontend and verify all functionality works
- Create polls, vote, and check real-time updates
- No user-visible changes should occur

## Phase 2: Extract Handlers (Refactor Only)

### Tasks
1. **Create `party/handlers.ts`**
   ```typescript
   // Functions to implement:
   export async function handleVote(
     room: Party.Room,
     poll: Poll,
     message: VoteMessage
   ): Promise<Poll | null>

   export async function handleCreatePoll(
     room: Party.Room,
     request: CreatePollRequest
   ): Promise<Poll>

   export async function handleGetPoll(
     poll: Poll | null
   ): Promise<Response>
   ```

2. **Update `party/index.ts`**
   - Import handlers
   - Replace method implementations with handler calls
   - Maintain all existing behavior

### Testing
- Full regression test of all features
- Verify no functional changes

## Phase 3: Add Question Bank and Server Generation (New Feature)

### Tasks
1. **Create `party/questions.ts`**
   ```typescript
   export interface Question {
     title: string;
     options: string[];
   }

   export const QUESTION_BANK: Question[] = [
     {
       title: "What's your favorite programming language?",
       options: ["JavaScript", "Python", "Rust", "Go", "TypeScript"]
     },
     {
       title: "Best pizza topping?",
       options: ["Pepperoni", "Mushrooms", "Pineapple", "Olives", "Extra Cheese"]
     },
     // ... more questions
   ];

   export function getRandomQuestion(): Question
   ```

2. **Create `party/utils.ts`**
   ```typescript
   export function generatePollId(): string
   export function initializePollVotes(options: string[]): Record<string, number>
   ```

3. **Update `party/handlers.ts`**
   - Add new handler: `handleCreatePollServerGenerated`
   - This handler uses question bank instead of user input
   - Generates poll ID server-side

4. **Update `party/index.ts`**
   - Add conditional logic in `onRequest` to handle both endpoints:
     - Existing: POST with title/options in body
     - New: POST with empty body (or flag) for server generation

### Testing
- Test new endpoint with curl/Postman
- Verify old endpoint still works
- Check that generated polls have proper IDs and questions

## Phase 4: Update Frontend for Server Generation

### Tasks
1. **Update `src/routes/+page.svelte`**
   - Replace poll creation form with "Create New Poll" button
   - Add UI to display generated room ID
   - Add copy-to-clipboard functionality for room ID
   - Show "Share this room ID" instruction

2. **Update `src/routes/+page.server.ts`**
   - Modify `createPoll` action to call new endpoint
   - Handle response with generated poll ID
   - Return poll ID to frontend for display

3. **Add room joining flow**
   - Allow users to enter a room ID
   - Navigate to poll page with entered ID
   - Handle invalid room IDs gracefully

### UI Flow
1. User clicks "Create New Poll"
2. Server generates poll with random question
3. Frontend displays: "Room created! ID: ABC123 [Copy]"
4. Other users can join by entering room ID

### Testing
- Create multiple polls and verify unique IDs
- Test room joining with valid/invalid IDs
- Verify copy-to-clipboard functionality

## Phase 5: Cleanup and Remove Old Code

### Tasks
1. **Remove deprecated code**
   - Old poll creation form in `+page.svelte`
   - Old POST endpoint handler variant
   - Unused imports and types

2. **Update documentation**
   - Update CLAUDE.md with new architecture
   - Add inline comments for new patterns

3. **Final refactoring**
   - Ensure consistent naming
   - Remove any TODO comments
   - Optimize imports

### Testing
- Complete end-to-end testing
- Load testing with multiple concurrent rooms
- Error handling verification

## Future Enhancements (Post-Migration)

1. **AI Integration**
   - Replace question bank with AI generation
   - Add categories or themes for questions
   - Dynamic difficulty adjustment

2. **Enhanced Features**
   - Question history to avoid repeats
   - Custom question submission
   - Voting patterns analytics

## Migration Checklist

- [ ] Phase 1: Zod integration complete
- [ ] Phase 2: Handler extraction complete
- [ ] Phase 3: Server generation working
- [ ] Phase 4: Frontend updated
- [ ] Phase 5: Cleanup complete
- [ ] All tests passing
- [ ] Documentation updated

## Rollback Plan

Each phase is designed to be independently revertible:
- Phase 1-2: Revert to original `party/index.ts`
- Phase 3: Remove new endpoint, keep old one
- Phase 4: Revert frontend changes
- Phase 5: Restore removed code from git history