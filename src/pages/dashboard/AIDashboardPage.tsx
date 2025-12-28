import { useState, useRef, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface SSEEvent {
  type: "text" | "llm_start" | "llm_end" | "tool_start" | "tool_end";
  data: string | { name?: string };
}

const AIDashboardPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toolInProgress, setToolInProgress] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hasMessages = messages.length > 0;

  useEffect(() => {
    if (hasMessages) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, hasMessages, toolInProgress]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const response = await fetch("/api/v1/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      let buffer = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const event: SSEEvent = JSON.parse(line.slice(6));
              console.log("SSE event:", event);

              if (event.type === "text") {
                assistantContent += event.data;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessage.id
                      ? { ...msg, content: assistantContent }
                      : msg
                  )
                );
              } else if (event.type === "tool_start") {
                const toolName = typeof event.data === "object" ? event.data.name : "tool";
                setToolInProgress(toolName || "Fetching data...");
              } else if (event.type === "tool_end") {
                setToolInProgress(null);
              }
            } catch (e) {
              console.log("Parse error:", e, line);
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? { ...msg, content: "Sorry, something went wrong. Please try again." }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      setToolInProgress(null);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] relative">
      {/* Messages Area */}
      <div
        className={cn(
          "flex-1 overflow-y-auto transition-all duration-500 ease-out",
          hasMessages ? "pb-32" : "flex items-center justify-center"
        )}
      >
        {!hasMessages ? (
          <div className="text-center max-w-2xl mx-auto px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-3">
              SaaS Risk Assistant
            </h1>
            <p className="text-text-secondary text-lg mb-8">
              Ask me anything about your organization's SaaS security posture.
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
              {[
                "What's the overall security status?",
                "Which apps have high risk?",
                "Show me user access patterns",
                "Analyze Microsoft 365 permissions",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="text-sm text-left px-4 py-3 rounded-lg border border-border-light bg-background-primary hover:bg-interactive-hover transition-colors text-text-secondary hover:text-text-primary"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "px-4 py-3",
                    message.role === "user"
                      ? "max-w-[70%] bg-blue-600 text-white rounded-2xl"
                      : "w-full text-text-primary"
                  )}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}
            
            {/* Tool in progress indicator */}
            {toolInProgress && (
              <div className="flex justify-start">
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
                  <span className="text-amber-700 text-sm">
                    Running: {toolInProgress}
                  </span>
                </div>
              </div>
            )}
            
            {/* Loading dots when waiting for LLM */}
            {isLoading && !toolInProgress && messages[messages.length - 1]?.content === "" && (
              <div className="flex justify-start">
                <div className="flex gap-1 py-2">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div
        className={cn(
          "transition-all duration-500 ease-out",
          hasMessages
            ? "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background-secondary via-background-secondary to-transparent pt-8 pb-4"
            : "w-full max-w-2xl mx-auto px-4"
        )}
      >
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your SaaS security..."
              className="w-full px-5 py-4 pr-14 rounded-xl border border-border-medium bg-background-primary text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent shadow-lg"
              disabled={isLoading}
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="absolute right-2 rounded-lg"
              disabled={!input.trim() || isLoading}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIDashboardPage;
