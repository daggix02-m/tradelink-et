import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Smartphone, CheckCircle2, Building2 } from "lucide-react";

interface ChapaPaymentSimulatorProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ChapaPaymentSimulator({ amount, onSuccess, onCancel }: ChapaPaymentSimulatorProps) {
  const [method, setMethod] = useState<"telebirr" | "cbe" | "card" | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"select" | "pay" | "success">("select");

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("success");
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }, 1500);
  };

  if (step === "success") {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px] animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
        <p className="text-muted-foreground">ETB {amount.toLocaleString()} has been securely processed via Chapa.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-border">
        <div>
          <h2 className="text-xl font-bold">Checkout with Chapa</h2>
          <p className="text-sm text-muted-foreground">Secure local payments simulation</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Amount</p>
          <p className="text-xl font-bold text-primary">ETB {amount.toLocaleString()}</p>
        </div>
      </div>

      {step === "select" && (
        <div className="space-y-6">
          <h3 className="font-medium">Select Payment Method</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setMethod("telebirr")}
              className={`p-4 border-2 rounded-xl flex flex-col items-center justify-center gap-3 transition-all ${
                method === "telebirr" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            >
              <Smartphone size={32} className={method === "telebirr" ? "text-primary" : "text-muted-foreground"} />
              <span className="font-semibold">Telebirr</span>
            </button>
            <button
              onClick={() => setMethod("cbe")}
              className={`p-4 border-2 rounded-xl flex flex-col items-center justify-center gap-3 transition-all ${
                method === "cbe" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            >
              <Building2 size={32} className={method === "cbe" ? "text-primary" : "text-muted-foreground"} />
              <span className="font-semibold">CBE Birr</span>
            </button>
            <button
              onClick={() => setMethod("card")}
              className={`p-4 border-2 rounded-xl flex flex-col items-center justify-center gap-3 transition-all ${
                method === "card" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            >
              <CreditCard size={32} className={method === "card" ? "text-primary" : "text-muted-foreground"} />
              <span className="font-semibold">Bank Card</span>
            </button>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
            <Button className="flex-1" disabled={!method} onClick={() => setStep("pay")}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === "pay" && (
        <div className="space-y-6 animate-in slide-in-from-right-4">
          <div className="bg-secondary p-4 rounded-xl text-center mb-6">
            <p className="text-sm text-muted-foreground mb-1">Paying via {method?.toUpperCase()}</p>
            <p className="font-mono text-lg font-bold">ETB {amount.toLocaleString()}</p>
          </div>

          <p className="text-center text-sm text-muted-foreground mb-6">
            This is a simulation. Click "Simulate Payment" to proceed with a mock successful transaction.
          </p>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setStep("select")} disabled={loading}>
              Back
            </Button>
            <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={handlePay} disabled={loading}>
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Simulate Payment"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
