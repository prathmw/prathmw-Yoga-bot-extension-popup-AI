// Gemini API configuration
const API_KEY = 'AIzaSyBo4iVs9UCxs0t62ZUTF7IpMS_BYJhKy7s';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

let popup = null;
let isPopupVisible = false;

// Create toggle button
function createToggleButton() {
  const button = document.createElement('button');
  button.className = 'ai-toggle-button';
  button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 16v-4"/>
      <path d="M12 8h.01"/>
    </svg>
  `;
  
  button.addEventListener('click', () => {
    isPopupVisible = !isPopupVisible;
    if (isPopupVisible) {
      if (!popup) {
        createPopup();
      }
      popup.style.display = 'block';
      button.classList.add('active');
    } else {
      popup.style.display = 'none';
      button.classList.remove('active');
    }
  });

  document.body.appendChild(button);
  return button;
}

async function generateResponse(prompt, wordLength, wordMode) {
  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${prompt}\n\nPlease provide a response with ${wordLength} words in ${wordMode} length.`
          }]
        }]
      })
    });

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error generating response:', error);
    return 'Sorry, I encountered an error. Please try again.';
  }
}

function createPopup() {
  popup = document.createElement('div');
  popup.className = 'ai-assistant-popup';
  popup.style.display = 'none';
  popup.innerHTML = `
    <div class="ai-assistant-header">
      <h2>Yoga Bot</h2>
    </div>
    <div class="ai-assistant-controls">
      <div class="select-container">
        <select id="wordLength">
          <option value="10-20">10-20 Words</option>
          <option value="20-30">20-30 Words</option>
          <option value="30-40">30-40 Words</option>
          <option value="40-50">40-50 Words</option>
        </select>
        <select id="wordMode">
          <option value="maximum">Maximum</option>
          <option value="minimum">Minimum</option>
        </select>
      </div>
      <div class="buttons-container">
        <button class="disclaimer">Disclaimer</button>
        <button class="reset">Reset</button>
        <div class="toggle-container">
          <input type="checkbox" id="toggle" class="toggle-switch">
          <span id="modelName">GPT 3.5</span>
        </div>
      </div>
    </div>
    <div class="ai-assistant-content"></div>
    <div class="ai-assistant-input">
      <input type="text" placeholder="Enter your message..." id="user-message-input">
      <button id="paste">Paste</button>
      <button id="send">Send</button>
    </div>
  `;
  document.body.appendChild(popup);

  // Add event listeners
  const input = popup.querySelector('#user-message-input');
  const sendBtn = popup.querySelector('#send');
  const pasteBtn = popup.querySelector('#paste');
  const content = popup.querySelector('.ai-assistant-content');
  const toggle = popup.querySelector('#toggle');
  const modelName = popup.querySelector('#modelName');
  const disclaimerBtn = popup.querySelector('.disclaimer');
  const resetBtn = popup.querySelector('.reset');
  const wordLengthSelect = popup.querySelector('#wordLength');
  const wordModeSelect = popup.querySelector('#wordMode');

  let autoCopyEnabled = true; // Enable auto copy by default

  // Toggle model
  toggle.addEventListener('change', () => {
    modelName.textContent = toggle.checked ? 'GPT 4' : 'GPT 3.5';
  });

  // Send message
  sendBtn.addEventListener('click', async () => {
    const message = input.value.trim();
    if (!message) return;

    // Add user message
    content.innerHTML += `<div class="message user-message"><p>${message}</p></div>`;
    input.value = '';
    
    // Show loading indicator
    const loadingElement = document.createElement('div');
    loadingElement.className = 'message ai-message';
    loadingElement.innerHTML = '<p>Thinking...</p>';
    content.appendChild(loadingElement);
    content.scrollTop = content.scrollHeight;

    try {
      // Generate response
      const response = await generateResponse(
        message, 
        wordLengthSelect.value, 
        wordModeSelect.value
      );

      // Replace loading indicator with response
      loadingElement.innerHTML = `<div class="message ai-message"><p>${response}</p></div>`;
      content.scrollTop = content.scrollHeight;

      console.log('Auto copy enabled:', autoCopyEnabled);
      if (autoCopyEnabled) {
        navigator.clipboard.writeText(response)
          .then(() => {
            console.log('Response copied to clipboard!');
          })
          .catch(err => {
            console.error('Failed to copy: ', err);
          });
      }
    } catch (error) {
      console.error('Error during send button click:', error);
      loadingElement.innerHTML = '<p>Sorry, I encountered an error. Please try again.</p>';
    }
  });

  // Handle paste
  pasteBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      input.value = text;
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  });

  // Reset chat
  resetBtn.addEventListener('click', () => {
    content.innerHTML = '';
  });

  // Disclaimer
  disclaimerBtn.addEventListener('click', () => {
    content.innerHTML += `<p class="disclaimer-text" style="color: #ef4444; font-size: 0.9em;">
      This AI assistant is for general guidance only. For medical concerns, please consult healthcare professionals.
    </p>`;
    content.scrollTop = content.scrollHeight;
  });

  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendBtn.click();
    }
  });
}

// Add styles for toggle button
const style = document.createElement('style');
style.textContent = `
  .ai-toggle-button {
    position: fixed;
    bottom: 50px;
    right: 20px;
    width: 50px;
    height: 50px;
    border-radius: 25px;
    background: linear-gradient(45deg, #6dd5ed, #2193b0);
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10001;
    transition: all 0.3s ease;
  }

  .ai-toggle-button svg {
    color: white;
    transition: transform 0.3s ease;
  }

  .ai-toggle-button:hover {
    transform: scale(1.1);
  }

  .ai-toggle-button.active {
    background: linear-gradient(45deg, #2193b0, #6dd5ed);
  }

  .ai-toggle-button.active svg {
    transform: rotate(180deg);
  }
`;
document.head.appendChild(style);

// Initialize the toggle button
createToggleButton();
