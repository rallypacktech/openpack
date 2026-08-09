import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Bot, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MessageBubble from "@/components/agent/MessageBubble";

const AGENT_NAME = "preparedness_assistant";

export default function AgentAssistant() {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeConv?.id) return;
    const unsubscribe = base44.agents.subscribeToConversation(activeConv.id, (data) => {
      setMessages(data.messages || []);
      setSending(false);
    });
    return () => unsubscribe();
  }, [activeConv?.id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const list = await base44.agents.listConversations({ agent_name: AGENT_NAME });
      setConversations(list);
      if (list.length > 0) selectConversation(list[0]);
      else await startNewConversation();
    } catch (e) {
      console.error("Error loading conversations", e);
    } finally {
      setLoading(false);
    }
  };

  const startNewConversation = async () => {
    try {
      const conv = await base44.agents.createConversation({
        agent_name: AGENT_NAME,
        metadata: {
          name: "Preparedness chat",
          description: "Ask RallyPack's assistant about readiness, supplies, and local dangers.",
        },
      });
      setConversations((p) => [conv, ...p]);
      selectConversation(conv);
    } catch (e) {
      console.error("Error starting conversation", e);
    }
  };

  const selectConversation = (conv) => {
    setActiveConv(conv);
    setMessages(conv.messages || []);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !activeConv || sending) return;
    setInput("");
    setSending(true);
    setMessages((p) => [...p, { role: "user", content: text }]);
    try {
      await base44.agents.addMessage(activeConv, { role: "user", content: text });
    } catch (e) {
      console.error("Error sending message", e);
      setSending(false);
    }
  };

  const telegramUrl = base44.agents.getTelegramConnectURL(AGENT_NAME);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
          <Bot className="w-6 h-6 text-primary" aria-hidden="true" /> Preparedness Assistant
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ask about go-bags, local wildfire and shelter info, or what to stock for your family and pets.
        </p>
      </header>

      {/* Connection instructions */}
      <div className="mb-6 rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-semibold flex items-center gap-2 mb-2">
          <MessageSquare className="w-4 h-4" aria-hidden="true" /> Connect your assistant
        </h2>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>
            <strong className="text-foreground">In-app:</strong> Chat right here — your
            conversations are saved to your account and resume where you left off.
          </li>
          <li>
            <strong className="text-foreground">Telegram:</strong> Get answers on the go by
            connecting your Telegram account.
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 inline-flex items-center gap-1 text-primary underline underline-offset-2 font-medium"
            >
              <Send className="w-3.5 h-3.5" aria-hidden="true" /> Connect Telegram
            </a>
            <span className="block text-xs mt-1 text-muted-foreground/80">
              Requires a Telegram bot linked to this assistant in the agent editor first.
            </span>
          </li>
        </ul>
      </div>

      {/* Conversation switcher */}
      {conversations.length > 1 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => selectConversation(c)}
              className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                c.id === activeConv?.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              {c.metadata?.name || "Chat"}
            </button>
          ))}
        </div>
      )}

      {/* Chat */}
      <div
        className="rounded-lg border border-border bg-card overflow-hidden flex flex-col"
        style={{ height: "60vh" }}
      >
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" aria-hidden="true" /> Loading…
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Bot className="w-10 h-10 mb-3 opacity-50" aria-hidden="true" />
              <p className="font-medium">Ask me anything about getting ready.</p>
              <p className="text-xs mt-1">
                e.g. “What should be in a go-bag for a family with a dog?”
              </p>
            </div>
          ) : (
            <>
              {messages.map((m, i) => (
                <MessageBubble key={i} message={m} />
              ))}
              {sending && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> Assistant is
                  thinking…
                </div>
              )}
              <div ref={scrollRef} />
            </>
          )}
        </div>
        <div className="border-t border-border p-3 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask about preparedness, supplies, local dangers…"
            disabled={loading || !activeConv}
            aria-label="Message the preparedness assistant"
          />
          <Button onClick={handleSend} disabled={!input.trim() || sending || !activeConv}>
            <Send className="w-4 h-4" aria-hidden="true" /> Send
          </Button>
        </div>
      </div>
    </div>
  );
}