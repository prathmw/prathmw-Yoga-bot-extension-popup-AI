const API_KEY = 'AIzaSyBo4iVs9UCxs0t62ZUTF7IpMS_BYJhKy7s';
    const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

    let chatHistory = [];

    document.addEventListener('DOMContentLoaded', () => {
        const chatContainer = document.getElementById('chat-container');
        const userInput = document.getElementById('user-input');
        const sendBtn = document.getElementById('send-btn');
        const clearBtn = document.getElementById('clear-btn');
        const copyBtn = document.getElementById('copy-btn');
        const toggleBtn = document.getElementById('toggle-btn');
        let isOn = false;

        // Load chat history
        chrome.storage.local.get(['chatHistory'], (result) => {
            if (result.chatHistory) {
                chatHistory = result.chatHistory;
                displayChatHistory();
            }
        });

        sendBtn.addEventListener('click', handleSendMessage);
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSendMessage();
        });

        clearBtn.addEventListener('click', () => {
            chatHistory = [];
            chatContainer.innerHTML = '';
            chrome.storage.local.set({ chatHistory: [] });
        });

        copyBtn.addEventListener('click', () => {
            if (chatHistory.length > 0) {
                const lastResponse = chatHistory[chatHistory.length - 1].content;
                navigator.clipboard.writeText(lastResponse);
            }
        });

        toggleBtn.addEventListener('click', function () {
            isOn = !isOn;
            toggleBtn.textContent = isOn ? 'On' : 'Off';
            toggleBtn.classList.toggle('bg-green-500', isOn);
            toggleBtn.classList.toggle('bg-red-500', !isOn);
            toggleBtn.classList.toggle('hover:bg-green-600', isOn);
            toggleBtn.classList.toggle('hover:bg-red-600', !isOn);

            // Add your on/off logic here
            console.log('Extension is ' + (isOn ? 'On' : 'Off'));
        });
    });

    async function handleSendMessage() {
        const userInput = document.getElementById('user-input');
        const message = userInput.value.trim();
        
        if (!message) return;

        // Add user message to chat
        addMessageToChat('user', message);
        userInput.value = '';

        try {
            const response = await generateResponse(message);
            addMessageToChat('ai', response);
        } catch (error) {
            addMessageToChat('ai', 'Sorry, I encountered an error. Please try again.');
            console.error('Error:', error);
        }
    }

    async function generateResponse(prompt) {
        const wordLength = document.getElementById('wordLength').value;
        const responseType = document.getElementById('responseType').value;

        try {
            const response = await fetch(`${API_URL}?key=${API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `${prompt}\n\nPlease provide a ${responseType} response using ${wordLength} words.`
                        }]
                    }]
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();
            if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content || !data.candidates[0].content.parts || data.candidates[0].content.parts.length === 0) {
                throw new Error('Invalid API response: No content found');
            }
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Error generating response:', error);
            throw error;
        }
    }

    function addMessageToChat(type, content) {
        const chatContainer = document.getElementById('chat-container');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        messageDiv.textContent = content;
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;

        // Save to history
        chatHistory.push({ type, content });
        chrome.storage.local.set({ chatHistory });
    }

    function displayChatHistory() {
        const chatContainer = document.getElementById('chat-container');
        chatHistory.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${message.type}-message`;
            messageDiv.textContent = message.content;
            chatContainer.appendChild(messageDiv);
        });
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
