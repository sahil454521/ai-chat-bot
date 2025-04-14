// src/app/chat/page.tsx
import ChatWrapper from "@/components/ChatWrapper";

export default function ChatPage() {
  return (
    <ChatWrapper 
      sessionId={crypto.randomUUID()}
      skipAutoPrompt={true}
    />
  );
}