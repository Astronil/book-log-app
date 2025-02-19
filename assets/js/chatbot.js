document.addEventListener("DOMContentLoaded", () => {
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

  // Send message function
  function sendChatMessage() {
    const message = chatInput.value.trim();
    if (message) {
      // Add user message
      addMessage(message, "user");

      // Simulate AI response (replace with actual AI integration)
      setTimeout(() => {
        const responses = [
          "Based on your reading history, I think you might enjoy 'The Midnight Library' by Matt Haig.",
          "Have you considered exploring the science fiction genre?",
          "I noticed you like historical fiction. You might enjoy 'The Seven Husbands of Evelyn Hugo'.",
        ];
        const randomResponse =
          responses[Math.floor(Math.random() * responses.length)];
        addMessage(randomResponse, "bot");
      }, 1000);

      chatInput.value = "";
    }
  }

  // Add message to chat
  function addMessage(text, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", `${sender}-message`);
    messageDiv.textContent = text;
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
  }

  // Send message on button click
  sendMessage.addEventListener("click", sendChatMessage);

  // Send message on Enter key
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendChatMessage();
    }
  });
});
