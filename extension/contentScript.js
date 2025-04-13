// At the beginning of contentScript.js
(function() {
  // Skip if we're on our own app
  if (window.location.hostname.includes('ai-chat-bot-gcar')) {
    return;
  }

  // Create a shadow root container for better style isolation
  const hostElement = document.createElement('div');
  hostElement.id = 'ai-chat-ext-host';
  document.body.appendChild(hostElement);

  // Use Shadow DOM for style isolation
  const shadow = hostElement.attachShadow({ mode: 'closed' });
  
  // Create button in shadow DOM
  const button = document.createElement('button');
  button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  `;
  
  // Add styles to shadow DOM
  const style = document.createElement('style');
  style.textContent = `
    button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      border-radius: 25px;
      background-color: #4F46E5;
      color: white;
      border: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      cursor: pointer;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
      padding: 0;
      margin: 0;
    }
    button:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
    }
    svg {
      width: 24px;
      height: 24px;
    }
  `;
  
  // Add elements to shadow DOM
  shadow.appendChild(style);
  shadow.appendChild(button);
  
  // Add click handler
  button.addEventListener('click', () => {
    chrome.runtime.sendMessage({
      action: "openChatWithUrl",
      url: window.location.href
    });
  });
  
  // Listen for selection events
  document.addEventListener('mouseup', () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      // Show a small tooltip near the selection
      const tooltip = document.createElement('div');
      tooltip.textContent = "Analyze with AI";
      tooltip.style.cssText = `
        position: absolute;
        background: #4F46E5;
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        z-index: 10001;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      `;
      
      // Position near selection
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      tooltip.style.left = `${rect.left + window.scrollX}px`;
      tooltip.style.top = `${rect.bottom + window.scrollY + 10}px`;
      
      // Add click handler
      tooltip.addEventListener('click', () => {
        chrome.runtime.sendMessage({
          action: "selectedText",
          url: window.location.href,
          text: selection.toString()
        });
        document.body.removeChild(tooltip);
      });
      
      // Auto-hide after 3 seconds
      document.body.appendChild(tooltip);
      setTimeout(() => {
        if (tooltip.parentNode) {
          document.body.removeChild(tooltip);
        }
      }, 3000);
    }
  });
})();