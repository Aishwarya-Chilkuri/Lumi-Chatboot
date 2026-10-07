
import { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  Apple,
  Copy,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Plus,
  Sparkles,
  Sun,
  Trash2,
  X
} from "lucide-react";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("lumi-theme") !== "light"
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const activeChat = chats.find((chat) => chat.id === activeChatId);
  const messages = activeChat?.messages || [];

  useEffect(() => {
    fetch("http://localhost:8080/api/user", {
      credentials: "include"
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Not logged in");
        }

        return response.json();
      })
      .then((data) => {
        localStorage.setItem("lumi-user", "true");
        setUser(data);
        setIsLoggedIn(true);
      })
      .catch(() => {
        localStorage.removeItem("lumi-user");
        setUser(null);
        setIsLoggedIn(false);
      })
      .finally(() => {
        setCheckingAuth(false);
      });
  }, []);

  useEffect(() => {
    const savedChats = localStorage.getItem("lumi-chats");

    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats);
        setChats(parsedChats);

        if (parsedChats.length > 0) {
          setActiveChatId(parsedChats[0].id);
        }
      } catch {
        localStorage.removeItem("lumi-chats");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("lumi-chats", JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem(
      "lumi-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end"
    });
  }, [messages, loading]);

  const loginWithGoogle = () => {
    window.location.href =
      "http://localhost:8080/oauth2/authorization/google";
  };

  const loginWithApple = () => {
    alert(
      "Apple Sign-In needs Apple Developer configuration before it can be used."
    );
  };

  const loginAsGuest = () => {
    localStorage.setItem("lumi-user", "true");
    setIsLoggedIn(true);
    setUser({
      name: "Lumi Guest",
      email: "guest@lumi.local"
    });
  };

  const logout = async () => {
    try {
      await fetch("http://localhost:8080/logout", {
        method: "POST",
        credentials: "include"
      });
    } catch {
      return;
    }

    localStorage.removeItem("lumi-user");
    setUser(null);
    setIsLoggedIn(false);
    setChats([]);
    setActiveChatId(null);
  };

  const createChat = () => {
    const newChat = {
      id: Date.now(),
      title: "New conversation",
      messages: []
    };

    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setMessage("");
    setSidebarOpen(false);
  };

  const selectChat = (id) => {
    setActiveChatId(id);
    setMessage("");
    setSidebarOpen(false);
  };

  const deleteChat = (id) => {
    setChats((prev) => {
      const updatedChats = prev.filter((chat) => chat.id !== id);

      if (id === activeChatId) {
        setActiveChatId(
          updatedChats.length > 0 ? updatedChats[0].id : null
        );
      }

      return updatedChats;
    });
  };

  const sendMessage = async (text = message) => {
    const userMessage = text.trim();

    if (!userMessage || loading) {
      return;
    }

    let chatId = activeChatId;

    if (!chatId) {
      chatId = Date.now();

      const newChat = {
        id: chatId,
        title:
          userMessage.length > 35
            ? `${userMessage.slice(0, 35)}...`
            : userMessage,
        messages: [
          {
            role: "user",
            content: userMessage
          }
        ]
      };

      setChats((prev) => [newChat, ...prev]);
      setActiveChatId(chatId);
    } else {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                title:
                  chat.messages.length === 0
                    ? userMessage.length > 35
                      ? `${userMessage.slice(0, 35)}...`
                      : userMessage
                    : chat.title,
                messages: [
                  ...chat.messages,
                  {
                    role: "user",
                    content: userMessage
                  }
                ]
              }
            : chat
        )
      );
    }

    setMessage("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          message: userMessage
        })
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const data = await response.text();

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  {
                    role: "assistant",
                    content: data
                  }
                ]
              }
            : chat
        )
      );
    } catch {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  {
                    role: "assistant",
                    content:
                      "Sorry, I couldn't connect to Lumi right now. Please make sure the backend is running and try again."
                  }
                ]
              }
            : chat
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleInput = (event) => {
    setMessage(event.target.value);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        140
      )}px`;
    }
  };

  const copyMessage = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      return;
    }
  };

  const suggestions = [
    "Explain Spring Boot in simple words",
    "Help me write Java code",
    "What is machine learning?",
    "Give me interview questions"
  ];

  if (checkingAuth) {
    return (
      <div className={`loading-page ${darkMode ? "dark" : "light"}`}>
        <div className="loading-logo">
          <Sparkles size={25} />
        </div>
        <div className="loading-title">Lumi</div>
        <div className="loading-text">Loading your workspace...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className={`auth-page ${darkMode ? "dark" : "light"}`}>
        <div className="auth-decoration auth-decoration-one" />
        <div className="auth-decoration auth-decoration-two" />

        <div className="auth-card">
          <div className="auth-logo">
            <Sparkles size={25} />
          </div>

          <div className="auth-brand">Lumi</div>

          <h1>Welcome to Lumi</h1>

          <p>
            Your personal AI assistant for ideas, learning,
            coding and everyday questions.
          </p>

          <button className="google-login" onClick={loginWithGoogle}>
            <span className="google-icon">G</span>
            Continue with Google
          </button>

          <button className="apple-login" onClick={loginWithApple}>
            <Apple size={19} />
            Continue with Apple
          </button>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <button className="guest-login" onClick={loginAsGuest}>
            Continue as Guest
            <ArrowUp size={17} />
          </button>

          <small>
            By continuing, you agree to use Lumi responsibly.
          </small>
        </div>
      </div>
    );
  }

  return (
    <div className={`app ${darkMode ? "dark" : "light"}`}>
      {sidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-logo">
              <Sparkles size={18} />
            </div>

            <div>
              <h1>Lumi</h1>
              <span>AI Assistant</span>
            </div>
          </div>

          <button
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={19} />
          </button>
        </div>

        <button className="new-chat" onClick={createChat}>
          <Plus size={18} />
          New Chat
        </button>

        <div className="history-section">
          <div className="section-title">RECENT CHATS</div>

          {chats.length === 0 ? (
            <div className="empty-history">
              <MessageSquare size={18} />
              <span>No conversations yet</span>
            </div>
          ) : (
            <div className="history-list">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`history-item ${
                    chat.id === activeChatId ? "active" : ""
                  }`}
                  onClick={() => selectChat(chat.id)}
                >
                  <MessageSquare size={15} />

                  <span>{chat.title}</span>

                  <button
                    className="delete-chat"
                    onClick={(event) => {
                      event.stopPropagation();
                      deleteChat(chat.id);
                    }}
                    title="Delete chat"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sidebar-bottom">
          <button
            className="theme-button"
            onClick={() => setDarkMode((prev) => !prev)}
          >
            {darkMode ? <Sun size={17} /> : <Moon size={17} />}
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>

          <button className="logout-button" onClick={logout}>
            <LogOut size={17} />
            Sign Out
          </button>

          <div className="sidebar-user">
            <div className="user-circle">
              {user?.name?.charAt(0)?.toUpperCase() || "L"}
            </div>

            <div>
              <strong>{user?.name || "Lumi User"}</strong>
              <span>{user?.email || "Personal workspace"}</span>
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
              <Menu size={21} />
            </button>

            <div className="mobile-brand">
              <div className="mobile-brand-logo">
                <Sparkles size={15} />
              </div>

              <div>
                <strong>Lumi</strong>
                <span>AI Assistant</span>
              </div>
            </div>
          </div>

          <div className="topbar-actions">
            <button
              className="topbar-button"
              onClick={createChat}
              title="New Chat"
            >
              <Plus size={19} />
            </button>

            <button
              className="topbar-button"
              onClick={() => setDarkMode((prev) => !prev)}
              title="Theme"
            >
              {darkMode ? <Sun size={19} /> : <Moon size={19} />}
            </button>
          </div>
        </header>

        <main className="chat-area">
          {messages.length === 0 ? (
            <div className="welcome">
              <div className="welcome-icon">
                <Sparkles size={29} />
              </div>

              <div className="welcome-label">
                <span />
                LUMI AI ASSISTANT
                <span />
              </div>

              <h2>
                What can I
                <br />
                help you with?
              </h2>

              <p>
                Ask questions, explore ideas, learn something new,
                write code or simply start a conversation.
              </p>

              <div className="suggestions">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    className="suggestion-card"
                    onClick={() => sendMessage(suggestion)}
                  >
                    <span>{suggestion}</span>
                    <ArrowUp size={16} />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="messages-container">
              {messages.map((item, index) => (
                <div
                  key={`${item.role}-${index}`}
                  className={`message-row ${
                    item.role === "user"
                      ? "user-row"
                      : "assistant-row"
                  }`}
                >
                  {item.role === "assistant" && (
                    <div className="assistant-avatar">
                      <Sparkles size={16} />
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
                        <Copy size={13} />
                        Copy
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="message-row assistant-row">
                  <div className="assistant-avatar">
                    <Sparkles size={16} />
                  </div>

                  <div className="message-content">
                    <div className="message-name">Lumi</div>

                    <div className="typing">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        <div className="composer-area">
          <div className="composer">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Message Lumi..."
              rows="1"
            />

            <button
              className="send-button"
              onClick={() => sendMessage()}
              disabled={loading || !message.trim()}
            >
              <ArrowUp size={19} />
            </button>
          </div>

          <div className="composer-footer">
            <span>Enter to send</span>
            <span>Shift + Enter for new line</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;

