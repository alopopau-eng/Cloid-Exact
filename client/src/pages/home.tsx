import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Menu,
  Check,
  ChevronLeft,
} from "lucide-react";
import alRajhiLogo from "@assets/W-123-removebg-preview_1769602081293.png";
import heroImage from "@assets/motor-img_1769601137526.webp";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div
      className="min-h-screen bg-gray-100 dark:bg-slate-900"
      dir="rtl"
    >
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 dark:text-gray-300"
              data-testid="button-menu"
            >
              <Menu className="w-6 h-6" />
            </Button>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              EN
            </span>
          </div>
          <div className="flex items-center">
            <img src={alRajhiLogo} alt="تكافل الراجحي - Al Rajhi Takaful" className="h-10" />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[600px] md:min-h-[700px] flex items-center">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-black/40 to-transparent" />
        
        {/* Hero Content */}
        <div className="relative container mx-auto px-4 py-12">
          <div className="flex flex-col justify-center text-white max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              تأمين المركبات
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-6">
              حماية شاملة لسيارتك بأفضل الأسعار
            </p>
            <p className="text-lg text-white/80 mb-8 max-w-md">
              احصل على تغطية تأمينية متكاملة مع خدمة عملاء متميزة على مدار الساعة
            </p>
            
            {/* Hero CTA Button */}
            <Button
              size="lg"
              className="w-fit bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg rounded-xl shadow-lg"
              onClick={() => setLocation("/motor")}
              data-testid="button-hero-cta"
            >
              احصل على عرض سعر
              <ChevronLeft className="w-5 h-5 mr-2" />
            </Button>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 mt-8">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
                <Check className="w-4 h-4 text-green-400" />
                <span>تغطية شاملة</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
                <Check className="w-4 h-4 text-green-400" />
                <span>خدمة 24/7</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
                <Check className="w-4 h-4 text-green-400" />
                <span>أسعار منافسة</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
