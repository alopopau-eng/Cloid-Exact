import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Shield,
  Car,
  Heart,
  Building2,
  Wallet,
  ChevronLeft,
  Star,
  CheckCircle,
  Phone,
  Clock,
} from "lucide-react";
import tawuniyaLogo from "@/assets/tawuniya-logo.svg";
import heroBg from "@assets/c4b245f0-bfd9-456e-b483-0ae1717932f0_1768897824912.png";

export default function Home() {
  const [, setLocation] = useLocation();

  const insuranceTypes = [
    {
      id: "motor",
      title: "تأمين المركبات",
      description: "تأمين شامل لسيارتك ضد جميع المخاطر",
      icon: Car,
      color: "from-purple-500 to-purple-600",
      featured: true,
    },
    {
      id: "health",
      title: "التأمين الصحي",
      description: "تغطية صحية شاملة لك ولعائلتك",
      icon: Heart,
      color: "from-red-500 to-red-600",
      featured: false,
    },
    {
      id: "property",
      title: "تأمين الممتلكات",
      description: "حماية منزلك وممتلكاتك",
      icon: Building2,
      color: "from-blue-500 to-blue-600",
      featured: false,
    },
    {
      id: "savings",
      title: "الحماية والادخار",
      description: "خطط ادخارية واستثمارية",
      icon: Wallet,
      color: "from-green-500 to-green-600",
      featured: false,
    },
  ];

  const features = [
    { icon: CheckCircle, text: "تغطية شاملة" },
    { icon: Clock, text: "خدمة 24/7" },
    { icon: Phone, text: "دعم فوري" },
    { icon: Star, text: "أفضل الأسعار" },
  ];

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800"
      dir="rtl"
    >
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={tawuniyaLogo} alt="التعاونية" className="h-10" />
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-purple-700 dark:text-purple-400">
                التعاونية للتأمين
              </h1>
              <p className="text-xs text-slate-500">شركتك الأولى في التأمين</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-600 dark:text-slate-300"
              onClick={() => setLocation("/motor")}
              data-testid="button-login"
            >
              تسجيل الدخول
            </Button>
            <Button
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => setLocation("/motor")}
              data-testid="button-account"
            >
              حسابي
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[100vh] sm:min-h-[600px] md:min-h-[700px]">
        {/* Background Image */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-transform duration-700"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-transparent to-teal-900/20" />
        
        {/* Radial spotlight */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,transparent_40%,rgba(88,28,135,0.25)_100%)]" />

        {/* Floating decorative elements */}
        <div className="absolute top-20 left-10 w-24 h-24 bg-teal-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-20 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s', animationDuration: '3s' }} />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s', animationDuration: '4s' }} />

        {/* Content */}
        <div className="relative container mx-auto px-4 py-16 sm:py-20 md:py-28 h-full flex items-center justify-end">
          {/* Glassmorphic Card */}
          <div className="w-full sm:max-w-md md:max-w-lg backdrop-blur-xl bg-white/85 dark:bg-slate-900/85 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl border border-white/60 dark:border-slate-700/50 transform transition-all duration-500 hover:shadow-purple-500/10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-teal-100 dark:from-purple-900/50 dark:to-teal-900/50 px-4 py-2 rounded-full text-purple-700 dark:text-purple-300 text-sm mb-6">
              <Shield className="w-4 h-4" />
              <span>الأكثر ثقة في المملكة</span>
            </div>
            
            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-800 to-purple-600 dark:from-purple-300 dark:to-purple-500 bg-clip-text text-transparent mb-3 leading-tight">
              تأمين مركبات
            </h1>
            <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 font-medium mb-6">
              شامل لراحتك وأمانك
            </p>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap gap-2 mb-8">
              <div className="flex items-center gap-2 bg-teal-50 dark:bg-teal-900/30 px-3 py-2 rounded-xl text-teal-700 dark:text-teal-300 text-sm border border-teal-200/50 dark:border-teal-700/30">
                <Clock className="w-4 h-4" />
                <span>استجابة فورية</span>
              </div>
              <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/30 px-3 py-2 rounded-xl text-green-700 dark:text-green-300 text-sm border border-green-200/50 dark:border-green-700/30">
                <Star className="w-4 h-4" />
                <span>خصم 15%</span>
              </div>
              <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/30 px-3 py-2 rounded-xl text-purple-700 dark:text-purple-300 text-sm border border-purple-200/50 dark:border-purple-700/30">
                <CheckCircle className="w-4 h-4" />
                <span>تغطية شاملة</span>
              </div>
            </div>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                size="lg" 
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-6 text-lg rounded-xl shadow-lg shadow-purple-500/30 transition-all duration-300"
                onClick={() => setLocation("/motor")}
                data-testid="button-start-insurance"
              >
                أؤمّن الآن
                <ChevronLeft className="w-5 h-5 mr-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="flex-1 border-2 border-teal-500 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 px-6 py-6 text-lg rounded-xl transition-all duration-300"
                onClick={() => setLocation("/motor")}
                data-testid="button-get-quote"
              >
                احصل على عرض
              </Button>
            </div>
            
            {/* Trust indicator */}
            <div className="mt-6 pt-6 border-t border-slate-200/70 dark:border-slate-700 flex items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <span>+5 مليون عميل</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <span>منذ 1986</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-auto">
            <path
              fill="currentColor"
              className="text-slate-50 dark:text-slate-900"
              d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
            />
          </svg>
        </div>
      </section>

      {/* Insurance Types */}
      <section className="container mx-auto px-4 py-16 -mt-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">
            خدمات التأمين
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            اختر نوع التأمين المناسب لك
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {insuranceTypes.map((type) => (
            <Card
              key={type.id}
              className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                type.featured ? "ring-2 ring-purple-500 ring-offset-2" : ""
              }`}
              onClick={() => type.id === "motor" && setLocation("/motor")}
              data-testid={`card-insurance-${type.id}`}
            >
              {type.featured && (
                <div className="absolute top-0 left-0 right-0 bg-purple-600 text-white text-xs py-1 text-center font-medium">
                  الأكثر طلباً
                </div>
              )}
              <div className={`p-6 ${type.featured ? "pt-10" : ""}`}>
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-4 shadow-lg`}
                >
                  <type.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                  {type.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                  {type.description}
                </p>
                <Button
                  variant="ghost"
                  className="w-full justify-between text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20"
                >
                  اكتشف المزيد
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-slate-100 dark:bg-slate-800/50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                +5M
              </div>
              <p className="text-slate-600 dark:text-slate-400">عميل راضٍ</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                +50
              </div>
              <p className="text-slate-600 dark:text-slate-400">سنة خبرة</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                24/7
              </div>
              <p className="text-slate-600 dark:text-slate-400">خدمة العملاء</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                +100
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                فرع حول المملكة
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-0 overflow-hidden">
          <div className="p-8 md:p-12 text-center relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
            <div className="relative">
              <Shield className="w-16 h-16 text-white/80 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                جاهز لحماية مستقبلك؟
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                احصل على عرض سعر فوري وابدأ رحلة التأمين معنا اليوم
              </p>
              <Button
                size="lg"
                className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-6 text-lg rounded-xl shadow-lg"
                onClick={() => setLocation("/motor")}
                data-testid="button-cta-start"
              >
                احصل على عرض سعر
                <ChevronLeft className="w-5 h-5 mr-2" />
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img
                src={tawuniyaLogo}
                alt="التعاونية"
                className="h-10 brightness-0 invert"
              />
              <div>
                <h3 className="font-bold">التعاونية للتأمين</h3>
                <p className="text-sm text-slate-400">
                  شركة رائدة في التأمين منذ 1986
                </p>
              </div>
            </div>
            <div className="flex gap-6 text-sm text-slate-400">
              <a href="#" className="hover:text-white transition-colors">
                سياسة الخصوصية
              </a>
              <a href="#" className="hover:text-white transition-colors">
                الشروط والأحكام
              </a>
              <a href="#" className="hover:text-white transition-colors">
                اتصل بنا
              </a>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-500">
            © 2024 التعاونية للتأمين. جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>
    </div>
  );
}
