const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");

let userMessage = null;
const inputInitHeight = chatInput.scrollHeight;

const createTypingAnimation = () => {
    const div = document.createElement("div");
    div.className = "typing-animation";
    div.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    return div;
}

const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    let chatContent = className === "outgoing" ? 
        `<p></p>` : 
        `<span class="material-symbols-rounded">smart_toy</span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi;
}

const formatResponse = (text) => {
    // Format bullet points and numbered lists
    text = text.replace(/•/g, '•'); // Normalize bullet points
    text = text.replace(/^\s*[-*]\s/gm, '<li>'); // Convert - and * to list items
    text = text.replace(/^\s*(\d+\.)\s/gm, '<li>'); // Convert numbered lists to list items
    
    // Wrap consecutive list items in ul/ol tags
    text = text.replace(/(<li>.*\n?)+/g, match => {
        const isNumbered = /\d+\./.test(match);
        return `<${isNumbered ? 'ol' : 'ul'}>${match}</${isNumbered ? 'ol' : 'ul'}>`;
    });

    // Format headers (using div instead of span)
    text = text.replace(/^(#+)\s*(.*?)$/gm, (_, hashes, content) => {
        const level = Math.min(hashes.length, 6);
        return `<div class="markdown-h${level}">${content}</div>`;
    });

    // Format code blocks with language support
    text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
        return `<pre><code class="language-${lang || 'plaintext'}">${code.trim()}</code></pre>`;
    });

    // Format inline code
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Format bold text
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Format italics
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Convert URLs to links with better formatting
    text = text.replace(
        /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Add line breaks
    text = text.replace(/\n/g, '<br>');

    return text;
};

const generateResponse = async (chatElement) => {
    const messageElement = chatElement.querySelector("p");
    const typingAnimation = createTypingAnimation();
    messageElement.parentElement.replaceChild(typingAnimation, messageElement);

    try {
        const response = await fetch('/api/chat', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userMessage })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error?.message || 'An error occurred');
        }

        // Format and display the response
        const newMessageElement = document.createElement("p");
        const formattedText = formatResponse(data.candidates[0].content.parts[0].text);
        newMessageElement.innerHTML = formattedText; // Use innerHTML to render HTML formatting
        typingAnimation.parentElement.replaceChild(newMessageElement, typingAnimation);

    } catch (error) {
        const errorElement = document.createElement("p");
        errorElement.textContent = error.message;
        errorElement.classList.add("error");
        typingAnimation.parentElement.replaceChild(errorElement, typingAnimation);
    } finally {
        chatbox.scrollTo(0, chatbox.scrollHeight);
    }
}

const handleChat = async () => {
    userMessage = chatInput.value.trim();
    if (!userMessage) return;

    // Clear input and reset height
    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    // Add user message to chat
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);

    // Add AI response
    const incomingChatLi = createChatLi("", "incoming");
    chatbox.appendChild(incomingChatLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);
    await generateResponse(incomingChatLi);
}

// Auto-resize textarea as user types
chatInput.addEventListener("input", () => {
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

// Handle Enter key (with Shift+Enter for new line)
chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});

// Handle send button click
sendChatBtn.addEventListener("click", handleChat);

// Focus input on page load
window.addEventListener('load', () => chatInput.focus());