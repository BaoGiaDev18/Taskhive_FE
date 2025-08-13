/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { useAuth } from "../contexts/AuthContext";
import api, { HUB_BASE } from "../services/api";

/** ===== UI types ===== */
interface UserMeta {
  id: string;
  name: string;
  avatarUrl?: string;
}
interface Message {
  id: string;
  conversationId: string;
  author: UserMeta;
  text: string;
  createdAt: string;
}
interface Conversation {
  id: string;
  title: string;
  subtitle?: string;
  avatarUrl?: string;
  unread?: number;
  lastMessageAt?: string;
}

/** ===== Swagger DTOs ===== */
interface ApiConversationListItemDto {
  conversationId: number;
  partnerId: number;
  partnerName: string;
  partnerAvatarUrl?: string | null;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  unreadCount?: number;
}
interface ApiMessageDto {
  messageId: number;
  conversationId: number;
  senderId: number;
  content: string;
  fileURL?: string | null;
  messageType: "Text" | "Image" | "File";
  createdAt: string;
}

/** ===== Helpers ===== */
const meOf = (name?: string, avatarUrl?: string): UserMeta => ({
  id: "me",
  name: name || "You",
  avatarUrl:
    avatarUrl ||
    "https://api.dicebear.com/8.x/initials/svg?seed=You&backgroundType=gradientLinear",
});
const timeAgo = (iso?: string) => {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};
const parseMaybe = (data: any) =>
  typeof data === "string"
    ? (() => {
        try {
          return JSON.parse(data);
        } catch {
          return [];
        }
      })()
    : data;

// Lấy token cho Hub: ưu tiên context, sau đó localStorage
const getTokenForHub = (auth: any): string => {
  const t1 = auth?.token || auth?.accessToken || auth?.getAccessToken?.();
  const t2 = localStorage.getItem("jwtToken");
  return String(t1 || t2 || "");
};

/** ===== Inline API ===== */
async function apiGetConversations(
  userId: number,
  role: "freelancer" | "client"
) {
  const res = await api.get(`/Conversation/${role}/${userId}`, {
    headers: { Accept: "application/json" },
  });
  return parseMaybe(res.data) as ApiConversationListItemDto[];
}
async function apiGetMessages(conversationId: number) {
  const res = await api.get(`/Message/${conversationId}`, {
    headers: { Accept: "application/json" },
  });
  return parseMaybe(res.data) as ApiMessageDto[];
}
async function apiCreateMessage(
  conversationId: number,
  payload: {
    senderId: number;
    content: string;
    fileURL?: string | null;
    messageType?: "Text" | "Image" | "File";
  }
) {
  const body = {
    senderID: payload.senderId,
    content: payload.content,
    fileURL: payload.fileURL ?? null,
    messageType: payload.messageType ?? "Text",
  };
  const res = await api.post(`/Message/${conversationId}`, body, {
    headers: { "Content-Type": "application/json", Accept: "application/json" },
  });
  return parseMaybe(res.data) as ApiMessageDto;
}

/** ===== Mappers ===== */
const mapConversation = (d: ApiConversationListItemDto): Conversation => ({
  id: String(d.conversationId),
  title: d.partnerName,
  subtitle: d.lastMessage ?? "",
  avatarUrl: d.partnerAvatarUrl ?? undefined,
  unread: d.unreadCount ?? 0,
  lastMessageAt: d.lastMessageAt ?? undefined,
});
const mapMessage = (d: ApiMessageDto, meId: number): Message => ({
  id: String(d.messageId),
  conversationId: String(d.conversationId),
  author: {
    id: d.senderId === meId ? "me" : String(d.senderId),
    name: d.senderId === meId ? "You" : `User ${d.senderId}`,
  },
  text: d.content,
  createdAt: d.createdAt,
});

/** ===== Small UI bits ===== */
function Banner({
  type = "info",
  text,
  onClose,
}: {
  type?: "info" | "error" | "success";
  text: string;
  onClose?: () => void;
}) {
  const style =
    type === "error"
      ? "bg-red-50 text-red-700 border-red-200"
      : type === "success"
      ? "bg-green-50 text-green-700 border-green-200"
      : "bg-blue-50 text-blue-700 border-blue-200";
  return (
    <div
      className={`mx-6 mt-3 mb-0 rounded-lg border px-3 py-2 text-sm flex items-center justify-between ${style}`}
    >
      <span>{text}</span>
      {onClose ? (
        <button className="ml-3 text-xs underline" onClick={onClose}>
          close
        </button>
      ) : null}
    </div>
  );
}

function Sidebar({
  items,
  selectedId,
  onSelect,
}: {
  items: Conversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () =>
      items.filter((c) =>
        (c.title + (c.subtitle ?? "")).toLowerCase().includes(q.toLowerCase())
      ),
    [items, q]
  );
  return (
    <div className="w-full lg:w-[340px] border-r border-gray-200 bg-white">
      <div className="p-6 pb-3">
        <h2 className="text-3xl font-semibold">Messages</h2>
      </div>
      <div className="px-6 pb-4">
        <div className="relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            className="w-full rounded-full border border-gray-200 py-2 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
          <svg
            className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
        </div>
      </div>
      <div className="overflow-y-auto h-[calc(100vh-160px)]">
        {filtered.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`w-full text-left px-6 py-4 flex items-center gap-4 transition-colors border-t border-gray-100 hover:bg-gray-50 ${
              selectedId === c.id ? "bg-gray-50" : "bg-white"
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden">
              {c.avatarUrl ? (
                <img
                  src={c.avatarUrl}
                  alt={c.title}
                  className="w-full h-full"
                />
              ) : (
                <span className="text-xs font-semibold">{c.title[0]}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-medium truncate">{c.title}</p>
                <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                  {timeAgo(c.lastMessageAt)}
                </span>
              </div>
              <p className="text-sm text-gray-500 truncate">{c.subtitle}</p>
            </div>
            {c.unread ? (
              <span className="ml-2 inline-flex items-center justify-center text-xs px-2 h-5 rounded-full bg-black text-white">
                {c.unread}
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}
function ChatHeader({ title }: { title: string }) {
  return (
    <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6">
      <div className="font-medium">{title}</div>
      <div className="flex items-center gap-3 text-gray-400">
        <button className="p-2 rounded-full hover:bg-gray-100" title="Call">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 10l4.553-2.276A2 2 0 0122 9.528V14.5a2 2 0 01-1.105 1.789L15 19M15 10V5.5A2.5 2.5 0 0012.5 3h-1A2.5 2.5 0 009 5.5V10m6 0L9 13m0 0v5.5A2.5 2.5 0 0011.5 21h1a2.5 2.5 0 002.5-2.5V13"
            />
          </svg>
        </button>
        <button
          className="p-2 rounded-full hover:bg-gray-100"
          title="Translate"
        >
          <span className="font-semibold">Ä</span>
        </button>
      </div>
    </div>
  );
}
function Bubble({ message, isMine }: { message: Message; isMine: boolean }) {
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] rounded-2xl px-5 py-4 shadow-sm border ${
          isMine
            ? "bg-black text-white border-black"
            : "bg-white border-gray-200"
        }`}
      >
        <p className="leading-relaxed">{message.text}</p>
      </div>
    </div>
  );
}
function MessageInput({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState("");
  const handle = () => {
    const v = text.trim();
    if (!v) return;
    onSend(v);
    setText("");
  };
  return (
    <div className="border-t border-gray-200 p-4">
      <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-200">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handle();
            }
          }}
          placeholder="Type your messages here"
          className="flex-1 px-4 py-3 rounded-2xl outline-none"
        />
        <button
          onClick={handle}
          className="p-3 rounded-2xl text-gray-600 hover:bg-gray-100"
          title="Send"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
function RightPanel() {
  return (
    <div className="hidden xl:block w-[320px] border-l border-gray-200 bg-white">
      <div className="p-4">
        <div className="space-y-4">
          <div className="border rounded-xl">
            <button className="w-full flex items-center justify-between px-4 py-3">
              <span className="text-sm text-gray-600">Search messages</span>
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
          <div className="border rounded-xl">
            <button className="w-full flex items-center justify-between px-4 py-3">
              <span className="text-sm text-gray-600">Files and links</span>
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** ===== Page ===== */
export default function MessagesPage() {
  const auth = useAuth();
  const userId = auth?.userId as number | undefined;

  const role: "freelancer" | "client" =
    typeof (auth as any)?.role === "string" &&
    (auth as any).role.toLowerCase() === "client"
      ? "client"
      : "freelancer";

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meUser, setMeUser] = useState<UserMeta>(meOf());
  const [hubStatus, setHubStatus] = useState<
    "idle" | "connecting" | "connected" | "reconnecting" | "closed"
  >("idle");
  const endRef = useRef<HTMLDivElement | null>(null);

  // SignalR connection ref
  const hubRef = useRef<signalR.HubConnection | null>(null);

  // load user me
  useEffect(() => {
    if (!userId) return;
    let on = true;
    (async () => {
      try {
        const r = await api.get("/User/me");
        if (!on) return;
        setMeUser(meOf(r.data?.fullName, r.data?.imageUrl));
      } catch {
        /* ignore */
      }
    })();
    return () => {
      on = false;
    };
  }, [userId]);

  // load conversations
  useEffect(() => {
    if (!userId) return;
    let on = true;
    (async () => {
      try {
        setLoadingList(true);
        const list = await apiGetConversations(userId, role);
        if (!on) return;
        const mapped = list.map(mapConversation);
        setConversations(mapped);
        if (mapped.length) setSelectedId(mapped[0].id);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load conversations");
      } finally {
        setLoadingList(false);
      }
    })();
    return () => {
      on = false;
    };
  }, [userId, role]);

  // load messages when selected
  useEffect(() => {
    if (!selectedId) return;
    let on = true;
    (async () => {
      try {
        setLoadingMessages(true);
        const apiMsgs = await apiGetMessages(Number(selectedId));
        if (!on) return;
        setMessages(apiMsgs.map((m) => mapMessage(m, userId ?? -1)));
      } catch (e: any) {
        setError(e?.message ?? "Failed to load messages");
      } finally {
        setLoadingMessages(false);
      }
    })();
    return () => {
      on = false;
    };
  }, [selectedId, userId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /** ====== SignalR connect on conversation change ====== */
  useEffect(() => {
    if (!selectedId) return;

    const tokenForHub = getTokenForHub(auth);
    if (tokenForHub.length < 10) {
      setError("Missing/invalid access token for SignalR.");
      setHubStatus("idle");
      return;
    }

    // Xóa dấu "/" ở cuối nếu có, hoặc fallback "/api" khi không set env

    const hubUrl = `${HUB_BASE}/hubs/chat?conversationId=${selectedId}`;

    let disposed = false;

    const connect = async () => {
      if (hubRef.current) {
        try {
          await hubRef.current.stop();
        } catch (err) {
          console.error("Error stopping connection:", err);
        }
        hubRef.current = null;
      }

      setHubStatus("connecting");

      const conn = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => tokenForHub,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000])
        .configureLogging(signalR.LogLevel.Information)
        .build();

      conn.onreconnecting((err) => {
        console.warn("[Hub] reconnecting", err);
        setHubStatus("reconnecting");
      });
      conn.onreconnected((id) => {
        console.info("[Hub] reconnected", id);
        setHubStatus("connected");
      });
      conn.onclose((err) => {
        console.warn("[Hub] closed", err);
        setHubStatus("closed");
      });

      conn.on("Connected", (p: any) =>
        console.info("[Hub] Connected event:", p)
      );
      conn.on("Error", (msg: string) => {
        setError(msg || "Hub error");
      });

      conn.on("ReceiveMessage", (msg: ApiMessageDto) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === String(msg.messageId))) return prev;
          const mapped = mapMessage(msg, userId ?? -1);
          return [...prev, mapped];
        });
        setConversations((prev) =>
          prev.map((c) =>
            c.id === String(msg.conversationId)
              ? { ...c, subtitle: msg.content, lastMessageAt: msg.createdAt }
              : c
          )
        );
      });

      try {
        await conn.start();
        if (disposed) {
          try {
            await conn.stop();
          } catch (err) {
            console.error("Error stopping connection:", err);
          }
          return;
        }
        hubRef.current = conn;
        setHubStatus("connected");
        console.info("[Hub] connected:", conn.connectionId);
      } catch (e: any) {
        setHubStatus("closed");
        setError(e?.message || "Cannot connect realtime");
        console.error("[Hub] start error:", e);
      }
    };

    connect();

    return () => {
      disposed = true;
      if (hubRef.current) {
        const c = hubRef.current;
        hubRef.current = null;
        c.stop().catch(() => {});
      }
    };
  }, [selectedId, auth]);

  /** Send: prefer Hub; fallback REST */
  const handleSend = async (text: string) => {
    if (!selectedId || !userId) return;

    const temp: Message = {
      id: `temp-${Date.now()}`,
      conversationId: selectedId,
      author: meUser,
      text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, temp]);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? { ...c, subtitle: text, lastMessageAt: temp.createdAt }
          : c
      )
    );

    const hub = hubRef.current;
    if (hub && hub.state === signalR.HubConnectionState.Connected) {
      try {
        await hub.invoke("SendMessage", Number(selectedId), text, null);
        setTimeout(() => {
          setMessages((prev) => prev.filter((m) => m.id !== temp.id));
        }, 120);
        return;
      } catch (err) {
        console.error("Hub invoke SendMessage failed:", err);
      }
    }

    // fallback REST
    try {
      const saved = await apiCreateMessage(Number(selectedId), {
        senderId: userId,
        content: text,
        messageType: "Text",
      });
      const real = mapMessage(saved, userId);
      setMessages((prev) => prev.map((m) => (m.id === temp.id ? real : m)));
    } catch (e: any) {
      setMessages((prev) => prev.filter((m) => m.id !== temp.id));
      setError(e?.message ?? "Failed to send message");
    }
  };

  const selected = useMemo(
    () => conversations.find((c) => c.id === selectedId),
    [conversations, selectedId]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex h-screen">
          <Sidebar
            items={conversations}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />

          <div className="flex-1 flex flex-col bg-gray-50 relative">
            <ChatHeader
              title={
                selected?.title ??
                (loadingList ? "Loading..." : userId ? "" : "Please sign in")
              }
            />

            {/* Banner thông báo */}
            {error ? (
              <Banner
                type="error"
                text={error}
                onClose={() => setError(null)}
              />
            ) : null}
            {hubStatus !== "connected" && (
              <Banner
                type={hubStatus === "reconnecting" ? "info" : "info"}
                text={`Hub: ${hubStatus}`}
              />
            )}

            <div className="flex-1 overflow-y-auto p-6">
              {loadingMessages && !messages.length ? (
                <div className="text-sm text-gray-500">Loading messages…</div>
              ) : null}
              {messages
                .filter((m) => m.conversationId === selectedId)
                .map((m) => (
                  <div key={m.id} className="mb-4">
                    <Bubble message={m} isMine={m.author.id === "me"} />
                  </div>
                ))}
              <div ref={endRef} />
            </div>

            <MessageInput onSend={handleSend} />
          </div>

          <RightPanel />
        </div>
      </div>
    </div>
  );
}
