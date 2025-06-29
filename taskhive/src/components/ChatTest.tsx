import { useEffect, useState, useRef } from "react";
import * as signalR from "@microsoft/signalr";

interface Message {
  messageId: number;
  senderId: number;
  content: string;
  createdAt: string;
}

export function ChatTest() {
  const [convId, setConvId] = useState<number>(1);
  const [conn, setConn] = useState<signalR.HubConnection>();
  const [messages, setMessages] = useState<Message[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Khởi kết nối mỗi khi convId thay đổi
  useEffect(() => {
    if (conn) {
      conn.stop();
      setMessages([]);
    }
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      console.error("No JWT token found – phải login trước!");
      return;
    }

    const newConn = new signalR.HubConnectionBuilder()
      .withUrl(`/hubs/chat?conversationId=${convId}`, {
        accessTokenFactory: () => token, // <-- thêm cái này
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .build();

    newConn.on("ReceiveMessage", (m: Message) => {
      setMessages((msgs) => [...msgs, m]);
    });

    newConn
      .start()
      .then(() => {
        console.log("SignalR Connected");
        setConn(newConn);
      })
      .catch((err) => console.error("SignalR Start Error:", err));

    return () => {
      newConn.stop();
    };
  }, [convId]);

  const send = async () => {
    if (
      conn?.state === signalR.HubConnectionState.Connected &&
      inputRef.current
    ) {
      const txt = inputRef.current.value;
      await conn.invoke("SendMessage", convId, txt, null);
      inputRef.current.value = "";
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h3>Chat Test</h3>
      <div>
        <label>
          Conversation ID:{" "}
          <input
            type="number"
            value={convId}
            onChange={(e) => setConvId(+e.target.value)}
            style={{ width: 60 }}
          />
        </label>
      </div>

      <div
        style={{
          border: "1px solid #ccc",
          height: 300,
          overflowY: "auto",
          margin: "1rem 0",
          padding: "0.5rem",
        }}
      >
        {messages.map((m) => (
          <div key={m.messageId}>
            <span style={{ color: "#555" }}>
              [{new Date(m.createdAt).toLocaleTimeString()}]
            </span>{" "}
            <strong>User {m.senderId}:</strong> {m.content}
          </div>
        ))}
      </div>

      <div>
        <input
          ref={inputRef}
          type="text"
          style={{ width: "70%" }}
          placeholder="Type…"
        />
        <button onClick={send}>Send</button>
      </div>
    </div>
  );
}
export default ChatTest;
