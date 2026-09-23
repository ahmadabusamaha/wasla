import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/server";
import { getMyThreads } from "@/features/chat/queries";
import { ChatView } from "@/components/chat/chat-view";

export const metadata: Metadata = {
  title: "الرسائل",
  robots: { index: false },
};

export default async function MessagesPage() {
  const t = await getDictionary();
  const { threads, myOrgId } = await getMyThreads();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t.chat.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.chat.subtitle}</p>
      </header>
      <ChatView threads={threads} myOrgId={myOrgId} />
    </div>
  );
}
