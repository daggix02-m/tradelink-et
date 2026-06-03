import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useGsapReveal } from "@/hooks/useGsapReveal";
import { Send, Package, DollarSign, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  // unused user var removed
  const myDeals = useQuery(api.deals.myDeals, {});

  const sendMessage = useMutation(api.messages.sendMessage);
  const markRead = useMutation(api.messages.markRead);
  const acceptDeal = useMutation(api.deals.acceptDeal);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

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
      <div className="gsap-reveal w-72 bg-card border border-border rounded-xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-foreground">My Deals</h2>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {myDeals?.map((d: any) => (
            <a
              key={d._id}
              href={`/chat/${d._id}`}
              className={cn(
                "flex items-start gap-3 p-3 border-b border-border hover:bg-muted transition-colors",
                d._id === dealId && "bg-primary/10"
              )}
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Package size={15} className="text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                  {d.productTitle ?? "Product"}
                </p>
                <p className="text-xs text-muted-foreground">{(d as any).counterpartAlias || (d as any).supplierAlias || "Partner"}</p>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] mt-0.5",
                    d.status === "negotiating"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  )}
                >
                  {d.status}
                </Badge>
              </div>
            </a>
          ))}
          {!myDeals?.length && (
            <p className="p-6 text-xs text-muted-foreground text-center">No active deals yet</p>
          )}
        </div>
      </div>

      {/* ── Chat panel ── */}
      {dealId && deal ? (
        <div className="gsap-reveal flex-1 bg-card border border-border rounded-xl flex flex-col overflow-hidden">
          {/* Deal header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground text-sm">
                {deal.productTitle}
              </h3>
              <p className="text-xs text-muted-foreground">
                with {(deal as any).counterpartAlias || (deal as any).supplierAlias || "Partner"} · {deal.quantity} units
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  deal.status === "negotiating"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : deal.status === "agreed"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-muted text-muted-foreground border-border"
                )}
              >
                {deal.status}
              </Badge>
              {deal.status === "negotiating" && (
                <Button size="xs" onClick={handleAcceptDeal}>
                  <CheckCircle2 size={13} /> Accept deal
                </Button>
              )}
            </div>
          </div>

          {/* Price info (masked by role) */}
          {((deal as any).agreedPrice || (deal as any).agreedDisplayPrice) && (
            <div className="px-4 py-2 bg-muted border-b border-border flex items-center gap-2">
              <DollarSign size={14} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Current agreed price:{" "}
                <strong className="text-foreground">
                  ETB {((deal as any).agreedPrice || (deal as any).agreedDisplayPrice)?.toLocaleString("en-ET")} / unit
                </strong>
              </span>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
            {messages?.map((msg: any) => (
              <div
                key={msg._id}
                className={cn(
                  "flex",
                  msg.isOwn ? "justify-end" : "justify-start"
                )}
              >
                {msg.type === "system" ? (
                  <div className="mx-auto text-[11px] text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    {msg.content}
                  </div>
                ) : msg.type === "offer" || msg.type === "counter_offer" ? (
                  <div
                    className={cn(
                      "max-w-xs rounded-2xl border p-3 text-xs",
                      msg.isOwn
                        ? "bg-primary/10 border-primary/20 rounded-br-sm"
                        : "bg-card border-border rounded-bl-sm"
                    )}
                  >
                    <p className="font-semibold text-muted-foreground mb-1 uppercase tracking-wide text-[10px]">
                      {msg.type === "offer" ? "Price Offer" : "Counter Offer"}
                    </p>
                    <p className="text-foreground font-medium">
                      ETB {msg.offerData?.pricePerUnit?.toLocaleString("en-ET")} / unit
                    </p>
                    <p className="text-muted-foreground">Qty: {msg.offerData?.quantity}</p>
                    {msg.offerData?.note && (
                      <p className="text-muted-foreground mt-1 italic">{msg.offerData.note}</p>
                    )}
                    <p className="text-muted-foreground text-[10px] mt-2">
                      {msg.senderAlias} · {formatDistanceToNow(msg.createdAt)} ago
                    </p>
                  </div>
                ) : (
                  <div
                    className={cn(
                      "max-w-xs px-3.5 py-2.5 rounded-2xl text-sm",
                      msg.isOwn
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-card border border-border text-foreground rounded-bl-sm"
                    )}
                  >
                    {!msg.isOwn && (
                      <p className="text-[10px] font-medium text-muted-foreground mb-1">
                        {msg.senderAlias}
                      </p>
                    )}
                    <p>{msg.content}</p>
                    <p
                      className={cn(
                        "text-[10px] mt-1",
                        msg.isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
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
          <div className="p-4 border-t border-border flex gap-2">
            <Input
              className="flex-1"
              placeholder="Type a message…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            />
            <Button
              onClick={handleSend}
              disabled={!text.trim() || sending}
              size="icon"
            >
              <Send size={15} />
            </Button>
          </div>
        </div>
      ) : (
        <div className="gsap-reveal flex-1 bg-card border border-border rounded-xl flex items-center justify-center text-muted-foreground">
          <p className="text-sm">Select a deal to start messaging</p>
        </div>
      )}
    </div>
  );
}