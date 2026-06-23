import { useEffect, useRef, useState } from "react";
import { api } from "../api/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGERENCIAS = [
  "¿Cómo pago?",
  "¿Hacen envíos?",
  "¿Qué descuentos hay?",
  "¿Cuáles son los planes?",
];

const MENSAJE_BIENVENIDA: Message = {
  role: "assistant",
  content: "¡Hola! Soy el asistente de Changuito 🛒 ¿En qué te puedo ayudar?",
};

function renderContent(text: string) {
  // Negrita simple **texto**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**")
      ? <strong key={i}>{p.slice(2, -2)}</strong>
      : <span key={i}>{p}</span>
  );
}

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([MENSAJE_BIENVENIDA]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || loading) return;
    setMessages((m) => [...m, { role: "user", content: message }]);
    setInput("");
    setLoading(true);
    try {
      const r = await api<{ reply: string }>("/chat", {
        method: "POST",
        body: { message, history: messages.slice(-8) },
      });
      setMessages((m) => [...m, { role: "assistant", content: r.reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Uy, tuve un problema. Probá de nuevo en un momento." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        className="chatbot-fab"
        onClick={() => setOpen((o) => !o)}
        aria-label="Abrir asistente"
        title="Asistente"
      >
        {open ? "×" : "💬"}
      </button>

      {open && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <span style={{ fontSize: 22 }}>🛒</span>
            <div>
              <div>Asistente Changuito</div>
              <div style={{ fontSize: 11, opacity: 0.9, fontWeight: 400 }}>En línea • te respondo al toque</div>
            </div>
            <button className="close" onClick={() => setOpen(false)}>×</button>
          </div>

          <div className="chatbot-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role === "user" ? "user" : "bot"}`}>
                {renderContent(m.content)}
              </div>
            ))}
            {loading && (
              <div className="chat-typing">
                <span /><span /><span />
              </div>
            )}
            <div ref={endRef} />
          </div>

          {messages.length === 1 && (
            <div className="chat-quick">
              {SUGERENCIAS.map((s) => (
                <button key={s} onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          )}

          <form
            className="chatbot-input"
            onSubmit={(e) => { e.preventDefault(); send(input); }}
          >
            <input
              type="text"
              placeholder="Escribí tu pregunta…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={!input.trim() || loading}>
              Enviar
            </button>
          </form>
        </div>
      )}
    </>
  );
}
