(function() {
  'use strict';

  let input = null;
  let sendButton = null;
  let isInitialized = false;

  function init() {
    if (isInitialized) return;

    // Target Grok's contenteditable input and submit button
    input = document.querySelector('div.tiptap.ProseMirror[contenteditable="true"]');
    sendButton = document.querySelector('button[type="submit"]');

    if (!input) {
      console.log('Grok Ctrl+Enter: Input not found, retrying...');
      setTimeout(init, 1000);
      return;
    }

    console.log('Grok Ctrl+Enter: Input found:', input);
    if (sendButton) {
      console.log('Grok Ctrl+Enter: Send button found:', sendButton);
    } else {
      console.log('Grok Ctrl+Enter: Send button not found');
    }

    // Remove existing listeners
    input.removeEventListener('keydown', handleKeydown);
    input.addEventListener('keydown', handleKeydown);

    // Block form submission on Enter
    const form = input.closest('form');
    if (form) {
      form.removeEventListener('submit', blockFormSubmit);
      form.addEventListener('submit', blockFormSubmit);
      form.removeEventListener('keydown', blockFormKeydown);
      form.addEventListener('keydown', blockFormKeydown);
      console.log('Grok Ctrl+Enter: Form found, blocking Enter submit');
    }

    isInitialized = true;
  }

  function blockFormSubmit(event) {
    if (!event.isTrusted || !event.detail?.isCtrlEnter) {
      event.preventDefault();
      event.stopPropagation();
      console.log('Grok Ctrl+Enter: Blocked form submission');
    }
  }

  function blockFormKeydown(event) {
    if (event.key === 'Enter' && !event.ctrlKey) {
      event.preventDefault();
      event.stopPropagation();
      console.log('Grok Ctrl+Enter: Blocked form Enter keydown');
    }
  }

  function handleKeydown(event) {
    if (event.key !== 'Enter') return;

    event.preventDefault();
    event.stopPropagation();
    console.log('Grok Ctrl+Enter: Enter key detected, ctrlKey:', event.ctrlKey, 'shiftKey:', event.shiftKey);

    if (!input) {
      console.log('Grok Ctrl+Enter: Input not defined, skipping');
      return;
    }

    if (event.ctrlKey) {
      console.log('Grok Ctrl+Enter: Ctrl+Enter pressed, attempting submit');
      sendButton = document.querySelector('button[type="submit"]');
      if (sendButton) {
        console.log('Grok Ctrl+Enter: Clicking send button');
        sendButton.click();
      } else {
        console.log('Grok Ctrl+Enter: No button, trying form submit');
        const form = input.closest('form');
        if (form) {
          const submitEvent = new CustomEvent('submit', { bubbles: true, cancelable: true, detail: { isCtrlEnter: true } });
          form.dispatchEvent(submitEvent);
        } else {
          console.log('Grok Ctrl+Enter: No form/button, dispatching fallback');
          const keyEvent = new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, bubbles: true });
          input.dispatchEvent(keyEvent);
        }
      }
    } else {
      console.log('Grok Ctrl+Enter: Enter or Shift+Enter, adding newline');
      try {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          const br = document.createElement('br');
          range.insertNode(br);
          range.setStartAfter(br);
          range.setEndAfter(br);
          selection.removeAllRanges();
          selection.addRange(range);
          input.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
          console.log('Grok Ctrl+Enter: No selection, falling back to native Enter');
          const nativeEnter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
          input.dispatchEvent(nativeEnter);
        }
      } catch (e) {
        console.log('Grok Ctrl+Enter: Error adding newline:', e.message);
      }
    }
  }

  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-init on DOM changes, debounced
  let debounceTimeout = null;
  const observer = new MutationObserver(() => {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      if (!isInitialized) {
        console.log('Grok Ctrl+Enter: DOM changed, reinitializing');
        init();
      }
    }, 500);
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
