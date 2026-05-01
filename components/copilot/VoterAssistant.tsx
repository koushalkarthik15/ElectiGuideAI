"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  getGreeting,
  generateResponse,
  streamResponse,
  type ChatMessage,
} from "@/lib/copilot-engine";

export default function VoterAssistant() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ target: string; label: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isStreaming]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: "greeting",
        role: "assistant",
        content: getGreeting(pathname),
        timestamp: Date.now(),
      }]);
    }
  }, [isOpen, pathname, messages.length]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", content: trimmed, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);
    setPendingAction(null);

    const { content, action } = generateResponse(trimmed);
    const assistantId = `a-${Date.now()}`;

    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "", timestamp: Date.now() }]);

    cancelRef.current = streamResponse(
      content,
      (partial) => {
        setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, content: partial } : m));
      },
      () => {
        setIsStreaming(false);
        if (action) setPendingAction({ target: action.target, label: action.label });
      }
    );
  }, [input, isStreaming]);

  const handleClear = () => {
    if (cancelRef.current) cancelRef.current();
    setMessages([]);
    setPendingAction(null);
    setIsStreaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <>
      {/* ═══ Chat Panel — Fig Mint Style ═══ */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[90] w-[360px] max-w-[calc(100vw-48px)] animate-fade-in-up" style={{ animationDuration: "0.3s" }}>
          <div className="fig-panel-strong overflow-hidden flex flex-col shadow-2xl shadow-black/10" style={{ height: "min(520px, 70vh)" }}>
            {/* Header */}
            <div className="bg-fig-black border-b border-fig-black/80 px-5 py-4 flex items-center justify-between flex-shrink-0 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-fig-red/20 border border-fig-red/40 flex items-center justify-center">
                  <span className="text-sm">🤖</span>
                </div>
                <div>
                  <h3 className="font-instrument-serif text-lg text-fig-cream leading-none">Co-Pilot</h3>
                  <p className="font-courier-prime text-[8px] text-green-400/60 tracking-widest mt-0.5">● ONLINE</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleClear} className="font-courier-prime text-[9px] text-fig-cream/30 hover:text-fig-cream/60 tracking-wider transition-colors px-2 py-1 rounded hover:bg-fig-cream/5" aria-label="Clear chat history" title="Clear chat">
                  CLEAR
                </button>
                <button onClick={() => setIsOpen(false)} className="w-7 h-7 rounded-lg hover:bg-fig-cream/10 flex items-center justify-center text-fig-cream/40 hover:text-fig-cream transition-colors" aria-label="Close co-pilot">
                  ✕
                </button>
              </div>
            </div>

            {/* Privacy Disclaimer */}
            <div className="bg-saffron/5 border-b border-saffron/10 px-4 py-2 flex-shrink-0">
              <p className="font-courier-prime text-[8px] text-saffron tracking-wider text-center">
                ⚠ DO NOT SHARE PII (Aadhaar, EPIC No.) · Chat is not stored
              </p>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-grow overflow-y-auto px-4 py-4 space-y-3 bg-fig-cream" role="log" aria-label="Chat messages">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-xl px-4 py-3 ${msg.role === "user"
                    ? "bg-fig-black text-fig-cream"
                    : "bg-white border border-fig-border text-fig-black/80"
                  }`}>
                    <p className="font-inter text-[13px] leading-relaxed whitespace-pre-line">{msg.content}</p>
                  </div>
                </div>
              ))}

              {isStreaming && messages[messages.length - 1]?.content === "" && (
                <div className="flex justify-start">
                  <div className="bg-white border border-fig-border rounded-xl px-4 py-3 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-fig-red/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-fig-red/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-fig-red/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}

              {pendingAction && !isStreaming && (
                <div className="flex justify-start">
                  <button
                    onClick={() => { router.push(pendingAction.target); setIsOpen(false); }}
                    className="bg-fig-red/10 border border-fig-red/20 rounded-xl px-4 py-2.5 text-fig-red font-inter text-xs font-semibold hover:bg-fig-red/20 transition-colors flex items-center gap-2"
                  >
                    {pendingAction.label}
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </button>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-fig-border px-4 py-3 flex-shrink-0 bg-white">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about voter rights..."
                  className="flex-grow bg-fig-cream border border-fig-border rounded-xl px-4 py-2.5 font-inter text-sm text-fig-black placeholder:text-fig-black/25 focus:outline-none focus:ring-2 focus:ring-fig-red/20 focus:border-fig-red/30 transition-all"
                  disabled={isStreaming}
                  aria-label="Chat message input"
                />
                <button
                  onClick={handleSend}
                  disabled={isStreaming || !input.trim()}
                  className="w-10 h-10 rounded-xl bg-fig-black flex items-center justify-center text-fig-cream hover:bg-fig-black/80 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                  aria-label="Send message"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Floating Orb ═══ */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-[95] w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen
          ? "bg-fig-black/10 border border-fig-black/20 rotate-45 scale-90"
          : "bg-fig-black text-fig-cream shadow-lg shadow-fig-black/20 hover:shadow-xl hover:scale-110"
        }`}
        aria-label={isOpen ? "Close co-pilot" : "Open co-pilot assistant"}
        data-testid="copilot-orb"
      >
        {isOpen ? (
          <svg className="w-5 h-5 text-fig-black/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <>
            <span className="text-2xl">🤖</span>
            <span className="absolute inset-0 rounded-full border-2 border-fig-red/30 animate-ping" style={{ animationDuration: "2s" }} />
          </>
        )}
      </button>
    </>
  );
}
