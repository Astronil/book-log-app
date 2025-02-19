// Load environment variables
async function getGeminiApiKey() {
  try {
    const response = await fetch("/.env");
    const text = await response.text();
    const match = text.match(/GEMINI_API_KEY=(.+)/);
    return match ? match[1].trim() : null;
  } catch (error) {
    console.error("Error loading Gemini API key:", error);
    return null;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const GEMINI_API_KEY = await getGeminiApiKey();
  if (!GEMINI_API_KEY) {
    console.error("Gemini API key not found");
    return;
  }

  const chatToggle = document.getElementById("chat-toggle");
  const chatbot = document.getElementById("chatbot");
  const closeChat = document.querySelector(".close-chat");
  const sendMessage = document.getElementById("send-message");
  const chatInput = document.getElementById("chat-input");
  const messages = document.getElementById("messages");

  // Toggle chat window
  chatToggle.addEventListener("click", () => {
    chatbot.classList.toggle("hidden");
  });

  // Close chat window
  closeChat.addEventListener("click", () => {
    chatbot.classList.add("hidden");
  });

  async function generateGeminiResponse(prompt) {
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

    try {
      const response = await fetch(`${url}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a helpful AI assistant for a book tracking application. 
                    You help users find book recommendations, answer questions about books, 
                    and provide literary insights. 
                    User question: ${prompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Error:", error);
      return "I apologize, but I encountered an error. Please try again.";
    }
  }

  // Add message to chat
  function addMessage(text, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", `${sender}-message`);

    // Add typing animation for bot messages
    if (sender === "bot") {
      messageDiv.innerHTML =
        '<div class="typing-indicator"><span></span><span></span><span></span></div>';
      messages.appendChild(messageDiv);
      messages.scrollTop = messages.scrollHeight;

      // Replace typing indicator with actual message after a short delay
      setTimeout(() => {
        messageDiv.textContent = text;
      }, 1000);
    } else {
      messageDiv.textContent = text;
      messages.appendChild(messageDiv);
    }

    messages.scrollTop = messages.scrollHeight;
  }

  // Send message function
  async function sendChatMessage() {
    const message = chatInput.value.trim();
    if (message) {
      // Disable input and button while processing
      chatInput.disabled = true;
      sendMessage.disabled = true;

      // Add user message
      addMessage(message, "user");
      chatInput.value = "";

      // Get and add AI response
      const response = await generateGeminiResponse(message);
      addMessage(response, "bot");

      // Re-enable input and button
      chatInput.disabled = false;
      sendMessage.disabled = false;
      chatInput.focus();
    }
  }

  // Send message on button click
  sendMessage.addEventListener("click", sendChatMessage);

  // Send message on Enter key
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  });

  // Add initial greeting
  setTimeout(() => {
    addMessage(
      "Hello! I'm your BookBuddy AI assistant. I can help you find book recommendations, answer questions about books, and provide literary insights. How can I help you today?",
      "bot"
    );
  }, 1000);
});
