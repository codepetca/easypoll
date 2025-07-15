<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { PUBLIC_PARTYKIT_HOST } from '$env/static/public';
  import type { PageData } from './$types';
  import type { Poll, Message, VoteMessage, PollUpdateMessage } from '$lib/types';
  
  export let data: PageData;
  
  let poll: Poll = data.poll;
  let socket: WebSocket | null = null;
  let connecting = true;
  let hasVoted = false;
  
  // Calculate total votes
  $: totalVotes = Object.values(poll.votes).reduce((sum, count) => sum + count, 0);
  
  // Calculate percentages for each option
  $: optionStats = poll.options.map(option => ({
    option,
    votes: poll.votes[option] || 0,
    percentage: totalVotes > 0 ? ((poll.votes[option] || 0) / totalVotes) * 100 : 0
  }));
  
  function connectToPartyKit() {
    if (!browser) return;
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${PUBLIC_PARTYKIT_HOST}/parties/main/${data.pollId}`;
    
    socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
      connecting = false;
      console.log('Connected to PartyKit');
    };
    
    socket.onmessage = (event) => {
      try {
        const message: Message = JSON.parse(event.data);
        
        if (message.type === 'poll-update') {
          poll = message.poll;
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };
    
    socket.onclose = () => {
      console.log('Disconnected from PartyKit');
      // Attempt to reconnect after a delay
      setTimeout(connectToPartyKit, 3000);
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      connecting = false;
    };
  }
  
  function vote(option: string) {
    if (!socket || socket.readyState !== WebSocket.OPEN || hasVoted) return;
    
    const message: VoteMessage = {
      type: 'vote',
      option
    };
    
    socket.send(JSON.stringify(message));
    hasVoted = true;
    
    // Store vote in localStorage to prevent multiple votes
    if (browser) {
      localStorage.setItem(`voted_${data.pollId}`, 'true');
    }
  }
  
  function copyPollLink() {
    if (browser) {
      navigator.clipboard.writeText(window.location.href);
      alert('Poll link copied to clipboard!');
    }
  }
  
  onMount(() => {
    connectToPartyKit();
    
    // Check if user has already voted
    if (browser) {
      hasVoted = localStorage.getItem(`voted_${data.pollId}`) === 'true';
    }
  });
  
  onDestroy(() => {
    if (socket) {
      socket.close();
    }
  });
</script>

<svelte:head>
  <title>{poll.title} - Poll</title>
</svelte:head>

<main class="container">
  <div class="poll-header">
    <h1>{poll.title}</h1>
    <button class="share-btn" on:click={copyPollLink}>
      📋 Copy Link
    </button>
  </div>
  
  {#if connecting}
    <div class="status">Connecting to live updates...</div>
  {/if}
  
  <div class="poll-stats">
    <span class="vote-count">{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</span>
    {#if hasVoted}
      <span class="voted-indicator">✓ You voted</span>
    {/if}
  </div>
  
  <div class="options">
    {#each optionStats as { option, votes, percentage }}
      <div class="option">
        <button 
          class="option-btn"
          class:voted={hasVoted}
          on:click={() => vote(option)}
          disabled={hasVoted || connecting}
        >
          <div class="option-content">
            <span class="option-text">{option}</span>
            <span class="option-votes">{votes}</span>
          </div>
          
          {#if totalVotes > 0}
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                style="width: {percentage}%"
              ></div>
            </div>
            <span class="percentage">{percentage.toFixed(1)}%</span>
          {/if}
        </button>
      </div>
    {/each}
  </div>
  
  {#if !hasVoted && !connecting}
    <p class="instruction">Click an option to vote!</p>
  {/if}
  
  <div class="poll-footer">
    <a href="/" class="create-new-btn">Create New Poll</a>
  </div>
</main>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  
  .poll-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  h1 {
    color: #333;
    margin: 0;
    flex: 1;
    min-width: 200px;
  }
  
  .share-btn {
    background: #10b981;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .share-btn:hover {
    background: #059669;
  }
  
  .status {
    text-align: center;
    color: #6b7280;
    margin-bottom: 1rem;
    font-style: italic;
  }
  
  .poll-stats {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 8px;
  }
  
  .vote-count {
    font-weight: 600;
    color: #374151;
  }
  
  .voted-indicator {
    color: #10b981;
    font-weight: 600;
  }
  
  .options {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
  }
  
  .option {
    position: relative;
  }
  
  .option-btn {
    width: 100%;
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
  }
  
  .option-btn:hover:not(:disabled) {
    border-color: #4f46e5;
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);
  }
  
  .option-btn:disabled {
    cursor: not-allowed;
  }
  
  .option-btn.voted {
    border-color: #d1d5db;
    background: #f9fafb;
  }
  
  .option-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 2;
  }
  
  .option-text {
    font-size: 1.1rem;
    font-weight: 500;
    color: #374151;
  }
  
  .option-votes {
    font-weight: 600;
    color: #6b7280;
  }
  
  .progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: #e5e7eb;
    border-radius: 0 0 10px 10px;
  }
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #4f46e5, #7c3aed);
    border-radius: 0 0 10px 10px;
    transition: width 0.5s ease;
  }
  
  .percentage {
    position: absolute;
    top: 0.5rem;
    right: 1.5rem;
    font-size: 0.9rem;
    color: #6b7280;
    font-weight: 600;
  }
  
  .instruction {
    text-align: center;
    color: #6b7280;
    font-style: italic;
    margin-bottom: 2rem;
  }
  
  .poll-footer {
    text-align: center;
    padding-top: 2rem;
    border-top: 1px solid #e5e7eb;
  }
  
  .create-new-btn {
    background: #f3f4f6;
    color: #374151;
    text-decoration: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 500;
    transition: background-color 0.2s;
  }
  
  .create-new-btn:hover {
    background: #e5e7eb;
  }
  
  @media (max-width: 640px) {
    .container {
      padding: 1rem;
    }
    
    .poll-header {
      flex-direction: column;
      align-items: stretch;
    }
    
    .poll-stats {
      flex-direction: column;
      gap: 0.5rem;
      text-align: center;
    }
    
    .option-btn {
      padding: 1rem;
    }
    
    .percentage {
      position: static;
      margin-top: 0.5rem;
      display: block;
    }
  }
</style>