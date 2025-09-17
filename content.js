(function() {
  'use strict';

  // Wait for the page to fully load and find the chat input
  function init() {
    const input = document.querySelector('textarea'); // Adjust selector if needed, e.g., 'textarea.prompt-textarea' or '[data-testid="message-input"]'
    if (!input) {
      // Retry after a short delay if input not found yet (dynamic load)
      setTimeout(init, 1000);
      return;
    }

    // Remove any existing listeners to avoid duplicates
    input.removeEventListener('keydown', handleKeydown);

    // Add the keydown listener
    input.addEventListener('keydown', handleKeydown);
  }

  function handleKeydown(event) {
    if (event.key === 'Enter') {
      if (event.ctrlKey) {
        // Ctrl+Enter: Submit the form/message
        event.preventDefault(); // Prevent default line break
        const form = input.closest('form') || input.parentElement;
        if (form && form.submit) {
          form.submit(); // Trigger native submit
        } else {
          // Fallback: Dispatch a submit event if no form
          const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
          form.dispatchEvent(submitEvent);
        }
      } else {
        // Enter alone: Allow line break (default), but prevent if it's a form submit
        if (input.form) {
          event.preventDefault(); // Block form submit, let default insert newline
          input.value += '\n';
          input.dispatchEvent(new Event('input', { bubbles: true })); // Trigger input event for React/etc.
        }
        // If no form, default Enter already does line break—no action needed
      }
    }
  }

  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-init on dynamic content changes (e.g., if Grok reloads chat)
  const observer = new MutationObserver(() => {
    init();
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
