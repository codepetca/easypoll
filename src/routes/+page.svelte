<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';
  
  export let form: ActionData;
  
  let options = ['', ''];
  
  function addOption() {
    options = [...options, ''];
  }
  
  function removeOption(index: number) {
    if (options.length > 2) {
      options = options.filter((_, i) => i !== index);
    }
  }
  
  let loading = false;
</script>

<svelte:head>
  <title>Create a Poll</title>
</svelte:head>

<main class="container">
  <h1>Create a New Poll</h1>
  
  <form 
    method="POST" 
    action="?/createPoll"
    use:enhance={() => {
      loading = true;
      return async ({ update }) => {
        loading = false;
        await update();
      };
    }}
  >
    <div class="form-group">
      <label for="title">Poll Title</label>
      <input 
        type="text" 
        id="title" 
        name="title" 
        placeholder="What's your question?"
        required
      />
    </div>
    
    <div class="form-group">
      <label>Options</label>
      {#each options as option, index}
        <div class="option-input">
          <input 
            type="text" 
            name="option-{index}" 
            placeholder="Option {index + 1}"
            bind:value={options[index]}
            required
          />
          {#if options.length > 2}
            <button 
              type="button" 
              class="remove-btn"
              on:click={() => removeOption(index)}
            >
              ×
            </button>
          {/if}
        </div>
      {/each}
      
      <button type="button" class="add-option-btn" on:click={addOption}>
        + Add Option
      </button>
    </div>
    
    {#if form?.error}
      <div class="error">
        {form.error}
      </div>
    {/if}
    
    <button type="submit" class="submit-btn" disabled={loading}>
      {loading ? 'Creating Poll...' : 'Create Poll'}
    </button>
  </form>
</main>

<style>
  .container {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  
  h1 {
    color: #333;
    margin-bottom: 2rem;
    text-align: center;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #333;
  }
  
  input[type="text"] {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s;
  }
  
  input[type="text"]:focus {
    outline: none;
    border-color: #4f46e5;
  }
  
  .option-input {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }
  
  .option-input input {
    flex: 1;
  }
  
  .remove-btn {
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 1.2rem;
    transition: background-color 0.2s;
  }
  
  .remove-btn:hover {
    background: #dc2626;
  }
  
  .add-option-btn {
    background: #f3f4f6;
    color: #374151;
    border: 2px dashed #d1d5db;
    border-radius: 8px;
    padding: 0.75rem;
    width: 100%;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s;
  }
  
  .add-option-btn:hover {
    background: #e5e7eb;
    border-color: #9ca3af;
  }
  
  .submit-btn {
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    width: 100%;
    transition: background-color 0.2s;
  }
  
  .submit-btn:hover:not(:disabled) {
    background: #4338ca;
  }
  
  .submit-btn:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
  
  .error {
    background: #fef2f2;
    color: #dc2626;
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid #fecaca;
    margin-bottom: 1rem;
  }
</style>