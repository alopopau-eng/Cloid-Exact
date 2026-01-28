import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Menu,
  Check,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  ChevronLeft,
} from "lucide-react";
import alRajhiLogo from "@assets/W-123-removebg-preview_1769602081293.png";
import heroImage from "@assets/motor-img_1769601137526.webp";

export default function Home() {
  const [, setLocation] = useLocation();
  const [nationalId, setNationalId] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    setLocation("/motor");
  };

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

      {/* Hero Section with Form Overlay */}
      <section className="relative min-h-[600px] md:min-h-[700px]">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-black/40 to-transparent" />
        
        {/* Hero Content */}
        <div className="relative container mx-auto px-4 py-12 h-full">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8 h-full">
            
            {/* Left Side - Hero Text & Button */}
            <div className="flex-1 flex flex-col justify-center text-white pt-8 lg:pt-16">
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

            {/* Right Side - Form Card */}
            <div className="w-full lg:w-[420px] flex-shrink-0">
              <Card className="rounded-3xl shadow-2xl overflow-hidden">
                {/* Info Section */}
                <div className="p-6 text-center bg-white dark:bg-slate-800">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    تأمين المركبات
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    تعرف على تأمين المركبات واحصل على وثيقتك
                  </p>
                  
                  {/* Action Buttons */}
                  <div className="flex justify-center gap-3 mb-4 flex-wrap">
                    <Button
                      variant="outline"
                      className="rounded-full px-4 py-2 text-sm border-primary text-primary hover:bg-primary/5"
                      data-testid="button-discover-benefits"
                    >
                      اكتشف فوائد المنتج
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-full px-4 py-2 text-sm border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400"
                      data-testid="button-compare-coverage"
                    >
                      مقارنة التغطيات
                    </Button>
                  </div>

                  {/* Coverage Badge */}
                  <div className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>3 تغطيات متاحة</span>
                  </div>
                </div>

                {/* Form Section */}
                <div className="p-6 bg-gray-50 dark:bg-slate-700/50 space-y-4">
                  {/* National ID Field */}
                  <div className="relative">
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                    </div>
                    <Input
                      type="text"
                      placeholder="الهوية الوطنية / الإقامة"
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      className="pr-12 py-6 bg-white dark:bg-slate-600 rounded-xl border-gray-200 dark:border-slate-500 text-right"
                      data-testid="input-national-id"
                    />
                  </div>

                  {/* Birth Date Field */}
                  <div className="relative">
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Calendar className="w-5 h-5 text-gray-400" />
                    </div>
                    <Input
                      type="text"
                      placeholder="MM-YYYY"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="pr-12 py-6 bg-white dark:bg-slate-600 rounded-xl border-gray-200 dark:border-slate-500 text-right"
                      data-testid="input-birth-date"
                    />
                  </div>

                  {/* Phone Field */}
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Phone className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 border-l border-gray-200 dark:border-slate-500 pl-3">
                      +966 |
                    </div>
                    <Input
                      type="tel"
                      placeholder="5XXXXXXXX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="pr-20 pl-12 py-6 bg-white dark:bg-slate-600 rounded-xl border-gray-200 dark:border-slate-500 text-right"
                      data-testid="input-phone"
                    />
                  </div>

                  {/* Email Field */}
                  <div className="relative">
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Mail className="w-5 h-5 text-gray-400" />
                    </div>
                    <Input
                      type="email"
                      placeholder="Example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pr-12 py-6 bg-white dark:bg-slate-600 rounded-xl border-gray-200 dark:border-slate-500 text-right"
                      data-testid="input-email"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={handleSubmit}
                    className="w-full py-6 text-lg rounded-xl bg-primary hover:bg-primary/90"
                    data-testid="button-submit"
                  >
                    أمن الآن
                  </Button>

                  {/* Cancel Button */}
                  <Button
                    variant="outline"
                    className="w-full py-6 text-lg rounded-xl border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400"
                    data-testid="button-cancel"
                  >
                    إنهاء
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
