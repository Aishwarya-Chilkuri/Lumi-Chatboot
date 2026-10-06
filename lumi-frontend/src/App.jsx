import { useState } from "react";
import {
  Copy,
  Moon,
  Plus,
  Send,
  Sun,
  Sparkles,
  Menu,
  X
} from "lucide-react";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const userMessage = message.trim();

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage }
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: userMessage
        })
      });

      if (!response.ok) {
        throw new Error("Failed");
      }

      const data = await response.text();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const newChat = () => {
    setMessages([]);
    setMessage("");
  };

  const copyMessage = async (content) => {
    await navigator.clipboard.writeText(content);
  };

  const suggestions = [
    "Explain Java in simple words",
    "Help me write Java code",
    "What is Spring Boot?",
    "Give me interview questions"
  ];

  return (
    <div className={darkMode ? "app dark" : "app light"}>
      {sidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-top">
          <div className="brand">
            <div className="brand-icon">
              <Sparkles size={21} />
            </div>

            <div>
              <h1>Lumi</h1>
              <span>AI Assistant</span>
            </div>

            <button
              className="close-sidebar"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <button className="new-chat" onClick={newChat}>
            <Plus size={19} />
            New Chat
          </button>
        </div>

        <div className="sidebar-middle">
          <div className="side-label">YOUR SPACE</div>

          <div className="empty-history">
            <div className="history-icon">
              <Sparkles size={17} />
            </div>

            <span>Your conversations</span>
            <small>New chats will appear here</small>
          </div>
        </div>

        <div className="sidebar-bottom">
          <button
            className="theme-button"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>

          <div className="sidebar-footer">
            <div className="mini-logo">L</div>

            <div>
              <strong>Lumi AI</strong>
              <span>Personal AI Assistant</span>
            </div>
          </div>
        </div>
      </aside>

      <section className="chat-section">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>

            <div className="mobile-brand">
              <div className="mobile-logo">
                <Sparkles size={17} />
              </div>

              <div>
                <strong>Lumi</strong>
                <span>AI Assistant</span>
              </div>
            </div>
          </div>

          <div className="topbar-actions">
            <button
              className="top-icon"
              onClick={newChat}
              title="New Chat"
            >
              <Plus size={19} />
            </button>

            <button
              className="top-icon"
              onClick={() => setDarkMode(!darkMode)}
              title="Theme"
            >
              {darkMode ? <Sun size={19} /> : <Moon size={19} />}
            </button>
          </div>
        </header>

        <main className="chat-area">
          {messages.length === 0 ? (
            <div className="welcome">
              <div className="lumi-orb">
                <div className="orb-inner">
                  <Sparkles size={34} />
                </div>
              </div>

              <div className="welcome-badge">
                <Sparkles size={14} />
                Your AI Assistant
              </div>

              <h2>
                Hello, I'm <span>Lumi</span>
              </h2>

              <p>
                Ask me anything. Let's explore ideas, solve problems,
                learn new things and create something amazing together.
              </p>

              <div className="suggestions">
                {suggestions.map((item, index) => (
                  <button
                    key={index}
                    className="suggestion-card"
                    onClick={() => setMessage(item)}
                  >
                    <span>{item}</span>
                    <Send size={15} />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="messages-container">
              {messages.map((item, index) => (
                <div
                  key={index}
                  className={`message-row ${
                    item.role === "user"
                      ? "user-row"
                      : "assistant-row"
                  }`}
                >
                  {item.role === "assistant" && (
                    <div className="avatar assistant-avatar">
                      <Sparkles size={17} />
                    </div>
                  )}

                  <div className="message-content">
                    <div className="message-name">
                      {item.role === "user" ? "You" : "Lumi"}
                    </div>

                    <div className="message-text">
                      {item.content}
                    </div>

                    {item.role === "assistant" && (
                      <button
                        className="copy-button"
                        onClick={() => copyMessage(item.content)}
                      >
                        <Copy size={14} />
                        Copy
                      </button>
                    )}
                  </div>

                  {item.role === "user" && (
                    <div className="avatar user-avatar">
                      You
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="message-row assistant-row">
                  <div className="avatar assistant-avatar">
                    <Sparkles size={17} />
                  </div>

                  <div className="message-content">
                    <div className="message-name">Lumi</div>

                    <div className="typing-box">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        <div className="input-area">
          <div className="input-wrapper">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Lumi..."
              rows="1"
            />

            <button
              className="send-button"
              onClick={sendMessage}
              disabled={loading || !message.trim()}
            >
              <Send size={19} />
            </button>
          </div>

          <div className="input-footer">
            <span>Press Enter to send</span>
            <span>Shift + Enter for new line</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
