'use client';

import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Menu,
  Check,
  ChevronLeft,
  Shield,
  Clock,
  Award,
  Phone,
  Car,
  FileText,
  Headphones,
} from "lucide-react";
import alRajhiLogo from "@assets/W-123-removebg-preview_1769602081293.png";
import heroImage from "@assets/motor-img_1769601137526.webp";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-slate-900"
      dir="rtl"
    >
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 dark:text-gray-300 h-8 w-8 sm:h-10 sm:w-10"
              data-testid="button-menu"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
            <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
              EN
            </span>
          </div>
          <div className="flex items-center">
            <img src={alRajhiLogo || "/placeholder.svg"} alt="تكافل الراجحي - Al Rajhi Takaful" className="h-8 sm:h-10" />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[650px] md:min-h-[750px] flex items-center">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-l from-black/70 via-black/50 to-black/30" />
        
        {/* Hero Content */}
        <div className="relative container mx-auto px-4 py-16">
          <div className="flex flex-col justify-center text-white max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm border border-primary/30 px-4 py-2 rounded-full text-sm w-fit mb-6">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-primary font-medium">تكافل الراجحي - الأول في المملكة</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              تأمين المركبات
            </h1>
            <p className="text-2xl md:text-3xl text-white/90 mb-4 font-light">
              حماية شاملة لسيارتك بأفضل الأسعار
            </p>
            <p className="text-lg text-white/70 mb-10 max-w-xl leading-relaxed">
              احصل على تغطية تأمينية متكاملة مع خدمة عملاء متميزة على مدار الساعة. نوفر لك راحة البال مع أفضل حلول التأمين المتوافقة مع الشريعة الإسلامية.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-10">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white px-10 py-7 text-lg rounded-xl shadow-xl shadow-primary/30"
                onClick={() => setLocation("/motor")}
                data-testid="button-hero-cta"
              >
                احصل على عرض سعر
                <ChevronLeft className="w-5 h-5 mr-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 px-8 py-7 text-lg rounded-xl backdrop-blur-sm bg-transparent"
                data-testid="button-learn-more"
              >
                تعرف على المزيد
              </Button>
            </div>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-5 py-3 rounded-full">
                <Check className="w-5 h-5 text-green-400" />
                <span className="font-medium">تغطية شاملة</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-5 py-3 rounded-full">
                <Check className="w-5 h-5 text-green-400" />
                <span className="font-medium">خدمة 24/7</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-5 py-3 rounded-full">
                <Check className="w-5 h-5 text-green-400" />
                <span className="font-medium">أسعار منافسة</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-5 py-3 rounded-full">
                <Check className="w-5 h-5 text-green-400" />
                <span className="font-medium">متوافق مع الشريعة</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              لماذا تختار تكافل الراجحي؟
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              نقدم لك أفضل حلول التأمين المتوافقة مع الشريعة الإسلامية مع خدمة عملاء متميزة
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center hover-elevate border-0 shadow-lg">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">تغطية شاملة</h3>
              <p className="text-gray-600 dark:text-gray-400">حماية كاملة لسيارتك ضد جميع المخاطر والحوادث</p>
            </Card>
            
            <Card className="p-6 text-center hover-elevate border-0 shadow-lg">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">إصدار فوري</h3>
              <p className="text-gray-600 dark:text-gray-400">احصل على وثيقتك في دقائق معدودة</p>
            </Card>
            
            <Card className="p-6 text-center hover-elevate border-0 shadow-lg">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">أفضل الأسعار</h3>
              <p className="text-gray-600 dark:text-gray-400">أسعار تنافسية مع خصومات حصرية</p>
            </Card>
            
            <Card className="p-6 text-center hover-elevate border-0 shadow-lg">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Headphones className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">دعم متواصل</h3>
              <p className="text-gray-600 dark:text-gray-400">خدمة عملاء على مدار الساعة</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Insurance Types Section */}
      <section className="py-16 bg-gray-50 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              أنواع التغطيات المتاحة
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              اختر التغطية المناسبة لاحتياجاتك
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 hover-elevate border-2 border-transparent hover:border-primary/20 transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Car className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">تأمين ضد الغير</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                تغطية أساسية تحميك من المسؤولية تجاه الآخرين في حالة الحوادث
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>تغطية الأضرار الجسدية</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>تغطية الأضرار المادية</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>خدمة المساعدة على الطريق</span>
                </li>
              </ul>
              <Button 
                className="w-full bg-transparent" 
                variant="outline"
                onClick={() => setLocation("/motor")}
                data-testid="button-third-party"
              >
                احصل على عرض سعر
              </Button>
            </Card>
            
            <Card className="p-8 hover-elevate border-2 border-primary/30 bg-gradient-to-b from-primary/5 to-transparent relative overflow-visible">
              <div className="absolute -top-4 right-6 bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                الأكثر طلباً
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center">
                  <Shield className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">التأمين الشامل</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                تغطية كاملة لسيارتك ضد جميع المخاطر بما فيها السرقة والحريق
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>جميع مميزات التأمين ضد الغير</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>تغطية أضرار سيارتك</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>الحماية من السرقة والحريق</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>سيارة بديلة</span>
                </li>
              </ul>
              <Button 
                className="w-full"
                onClick={() => setLocation("/motor")}
                data-testid="button-comprehensive"
              >
                احصل على عرض سعر
              </Button>
            </Card>
            
            <Card className="p-8 hover-elevate border-2 border-transparent hover:border-primary/20 transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <FileText className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">تأمين مخصص</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                صمم تغطيتك التأمينية حسب احتياجاتك الخاصة
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>اختر التغطيات التي تناسبك</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>تحكم في قيمة التحمل</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>إضافات اختيارية متنوعة</span>
                </li>
              </ul>
              <Button 
                className="w-full bg-transparent" 
                variant="outline"
                onClick={() => setLocation("/motor")}
                data-testid="button-custom"
              >
                احصل على عرض سعر
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            جاهز لحماية سيارتك؟
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            احصل على عرض سعر مجاني في أقل من دقيقتين
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 px-10 py-7 text-lg rounded-xl shadow-xl"
              onClick={() => setLocation("/motor")}
              data-testid="button-cta-quote"
            >
              احصل على عرض سعر الآن
              <ChevronLeft className="w-5 h-5 mr-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 px-8 py-7 text-lg rounded-xl bg-transparent"
              data-testid="button-cta-call"
            >
              <Phone className="w-5 h-5 ml-2" />
              اتصل بنا
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <img src={alRajhiLogo || "/placeholder.svg"} alt="تكافل الراجحي" className="h-10" />
            <p className="text-gray-400 text-sm">
              © 2025 تكافل الراجحي. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
