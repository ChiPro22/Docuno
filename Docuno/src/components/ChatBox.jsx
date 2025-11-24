import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import Markdown from "react-markdown";

const ChatBox = () => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const chatEndRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleOnClick = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    const qu = query;
    setQuery("");
    
    // Add user message immediately
    setMessages((prev) => [
      ...prev,
      { role: "user", content: qu },
    ]);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: qu }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const ai_response =
        data.assistant_response?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "⚠️ No response received from AI.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: ai_response },
      ]);
    } catch (err) {
      let errorMessage = "An unexpected error occurred";
      
      if (err.name === 'AbortError') {
        errorMessage = "Request timed out. Please try again.";
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage = "Network error. Please check your connection.";
      } else {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "❌ Sorry, I encountered an error while processing your request. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleOnClick();
    }
  };

  const retryLastMessage = () => {
    if (messages.length > 0) {
      const lastUserMessage = [...messages].reverse().find(msg => msg.role === "user");
      if (lastUserMessage) {
        setQuery(lastUserMessage.content || "");
        setError(null);
      }
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full h-full flex flex-col rounded-xl overflow-hidden shadow-2xl chat-container bg-white">
      {/* Chat Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mr-4 shadow-lg ai-avatar bg-gradient-to-br from-blue-500 to-purple-600">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">AI Assistant</h3>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              <p className="text-sm text-gray-500">Ready to chat</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 chat-messages bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
              </div>
              <p className="text-gray-500 text-lg font-medium">Start chatting with your PDF...</p>
              <p className="text-gray-400 text-sm mt-2">Ask me anything about your document! ✨</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start ${message.role === "user" ? "justify-end" : ""} animate-fadeIn message-slide`}
              >
                {message.role === "assistant" && (
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center mr-4 shadow-md bg-white shrink-0">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                )}

                <div
                  className={`max-w-[80%] px-6 py-4 rounded-3xl shadow-md transition-all duration-200 ${
                    message.role === "assistant"
                      ? "bg-white rounded-tl-lg text-gray-800"
                      : "bg-black text-white rounded-tr-lg"
                  }`}
                >
                  <div className={`font-medium markdown-content ${message.role === "assistant" ? "text-gray-800" : "text-white"}`}>
                   <Markdown>{message.content}</Markdown> 
                  </div>
                  <span className={`text-xs mt-2 block ${message.role === "assistant" ? "text-gray-400" : "text-gray-300"}`}>
                    {getCurrentTime()}
                  </span>
                </div>

                {message.role === "user" && (
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center ml-4 shadow-md bg-blue-600 shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex items-start animate-fadeIn">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center mr-4 shadow-md bg-white">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div className="px-6 py-4 rounded-3xl shadow-lg bg-white rounded-tl-lg">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-gray-500 text-sm font-medium">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Error Display */}
        {error && (
          <div className="mx-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
                <div>
                  <p className="text-red-800 font-medium">Connection Error</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={retryLastMessage} className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors">
                  Retry
                </button>
                <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Message Input Area */}
      <div className="p-6 border-t border-gray-100 bg-white">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Type your message..."
              className="w-full px-6 py-4 bg-gray-50 rounded-2xl focus:outline-none border border-gray-100 shadow-inner font-medium transition-all duration-200 focus:bg-white focus:shadow-md focus:border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
          </div>
          <button
            onClick={handleOnClick}
            disabled={!query.trim() || loading}
            className={`px-6 py-4 rounded-2xl font-semibold shadow-lg transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center cursor-pointer bg-black text-white`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;