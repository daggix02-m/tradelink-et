import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useGsapReveal } from "@/hooks/useGsapReveal";
import { Send, Package, DollarSign, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import clsx from "clsx";
import toast from "react-hot-toast";

export default function ChatPage() {
  const { dealId } = useParams<{ dealId: string }>();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const ref = useGsapReveal();

  const deal = useQuery(
    api.deals.getDeal,
    dealId ? { dealId: dealId as Id<"deals"> } : "skip"
  );
  const messages = useQuery(
    api.messages.listMessages,
    dealId ? { dealId: dealId as Id<"deals"> } : "skip"
  );
  const user = useQuery(api.users.me);
  const myDeals = useQuery(api.deals.myDeals, {});

  const sendMessage = useMutation(api.messages.sendMessage);
  const markRead = useMutation(api.messages.markRead);
  const acceptDeal = useMutation(api.deals.acceptDeal);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  // Mark messages as read when viewing
  useEffect(() => {
    if (dealId) {
      markRead({ dealId: dealId as Id<"deals"> }).catch(() => {});
    }
  }, [dealId, messages?.length]);

  const handleSend = async () => {
    if (!text.trim() || !dealId) return;
    setSending(true);
    try {
      await sendMessage({ dealId: dealId as Id<"deals">, content: text.trim() });
      setText("");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSending(false);
    }
  };

  const handleAcceptDeal = async () => {
    if (!dealId) return;
    try {
      await acceptDeal({ dealId: dealId as Id<"deals"> });
      toast.success("Deal accepted! Awaiting payment.");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div ref={ref} className="flex h-[calc(100vh-8rem)] gap-4">
      {/* ── Deal list sidebar ── */}
      <div className="gsap-reveal w-72 card flex flex-col overflow-hidden">
        <div className="p-4 border-b border-neutral-100">
          <h2 className="font-display font-semibold text-neutral-900">My Deals</h2>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {myDeals?.map((d: any) => (
            <a
              key={d._id}
              href={`/chat/${d._id}`}
              className={clsx(
                "flex items-start gap-3 p-3 border-b border-neutral-50 hover:bg-neutral-50 transition-colors",
                d._id === dealId && "bg-brand-50"
              )}
            >
              <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
                <Package size={15} className="text-brand-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-neutral-900 truncate">
                  {d.productTitle ?? "Product"}
                </p>
                <p className="text-xs text-neutral-500">{d.counterpartAlias}</p>
                <span
                  className={clsx(
                    "badge text-[10px] mt-0.5",
                    d.status === "negotiating" ? "badge-gold" : "badge-green"
                  )}
                >
                  {d.status}
                </span>
              </div>
            </a>
          ))}
          {!myDeals?.length && (
            <p className="p-6 text-xs text-neutral-400 text-center">No active deals yet</p>
          )}
        </div>
      </div>

      {/* ── Chat panel ── */}
      {dealId && deal ? (
        <div className="gsap-reveal flex-1 card flex flex-col overflow-hidden">
          {/* Deal header */}
          <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-neutral-900 text-sm">
                {deal.productTitle}
              </h3>
              <p className="text-xs text-neutral-500">
                with {deal.counterpartAlias} · {deal.quantity} units
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={clsx(
                  "badge",
                  deal.status === "negotiating"
                    ? "badge-gold"
                    : deal.status === "agreed"
                    ? "badge-green"
                    : "badge-gray"
                )}
              >
                {deal.status}
              </span>
              {deal.status === "negotiating" && (
                <button
                  onClick={handleAcceptDeal}
                  className="btn-primary text-xs px-3 py-1.5"
                >
                  <CheckCircle2 size={13} /> Accept deal
                </button>
              )}
            </div>
          </div>

          {/* Price info (masked by role) */}
          {deal.agreedPrice && (
            <div className="px-4 py-2 bg-neutral-50 border-b border-neutral-100 flex items-center gap-2">
              <DollarSign size={14} className="text-neutral-400" />
              <span className="text-xs text-neutral-600">
                Current agreed price:{" "}
                <strong className="text-neutral-900">
                  ETB {deal.agreedPrice?.toLocaleString("en-ET")} / unit
                </strong>
              </span>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
            {messages?.map((msg: any) => (
              <div
                key={msg._id}
                className={clsx(
                  "flex",
                  msg.isOwn ? "justify-end" : "justify-start"
                )}
              >
                {msg.type === "system" ? (
                  <div className="mx-auto text-[11px] text-neutral-400 bg-neutral-100 px-3 py-1 rounded-full">
                    {msg.content}
                  </div>
                ) : msg.type === "offer" || msg.type === "counter_offer" ? (
                  <div
                    className={clsx(
                      "max-w-xs rounded-2xl border p-3 text-xs",
                      msg.isOwn
                        ? "bg-brand-50 border-brand-200 rounded-br-sm"
                        : "bg-white border-neutral-200 rounded-bl-sm"
                    )}
                  >
                    <p className="font-semibold text-neutral-700 mb-1 uppercase tracking-wide text-[10px]">
                      {msg.type === "offer" ? "Price Offer" : "Counter Offer"}
                    </p>
                    <p className="text-neutral-900 font-medium">
                      ETB {msg.offerData?.pricePerUnit?.toLocaleString("en-ET")} / unit
                    </p>
                    <p className="text-neutral-500">Qty: {msg.offerData?.quantity}</p>
                    {msg.offerData?.note && (
                      <p className="text-neutral-500 mt-1 italic">{msg.offerData.note}</p>
                    )}
                    <p className="text-neutral-400 text-[10px] mt-2">
                      {msg.senderAlias} · {formatDistanceToNow(msg.createdAt)} ago
                    </p>
                  </div>
                ) : (
                  <div
                    className={clsx(
                      "max-w-xs px-3.5 py-2.5 rounded-2xl text-sm",
                      msg.isOwn
                        ? "bg-brand-600 text-white rounded-br-sm"
                        : "bg-white border border-neutral-200 text-neutral-900 rounded-bl-sm"
                    )}
                  >
                    {!msg.isOwn && (
                      <p className="text-[10px] font-medium text-neutral-400 mb-1">
                        {msg.senderAlias}
                      </p>
                    )}
                    <p>{msg.content}</p>
                    <p
                      className={clsx(
                        "text-[10px] mt-1",
                        msg.isOwn ? "text-brand-200" : "text-neutral-400"
                      )}
                    >
                      {formatDistanceToNow(msg.createdAt)} ago
                    </p>
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-neutral-100 flex gap-2">
            <input
              className="input flex-1"
              placeholder="Type a message…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            />
            <button
              onClick={handleSend}
              disabled={!text.trim() || sending}
              className="btn-primary px-3.5"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      ) : (
        <div className="gsap-reveal flex-1 card flex items-center justify-center text-neutral-400">
          <p className="text-sm">Select a deal to start messaging</p>
        </div>
      )}
    </div>
  );
}
