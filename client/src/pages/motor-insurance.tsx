import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, ChevronLeft, ChevronRight, Check, Zap, Sparkles, Car, Shield, Plus, Minus, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insuranceFormSchema, type InsuranceFormData } from "@shared/schema";

const offerData = [
  {
    id: "d6be6306-74c4-4edb-ac7a-3f2be2427f3c",
    name: "تكافل الراجحي للتأمين",
    type: "against-others",
    main_price: "417.16",
    company: {
      name: "takaful-rajhi",
      image_url: "https://github.com/user-attachments/assets/d37d419c-08bf-4211-b20c-7c881c9086d0",
    },
    extra_features: [
      { id: "e1", content: "المسؤولية المدنية تجاه الغير بحد أقصى 10,000,000 ريال", price: 0 },
      { id: "e2", content: "تغطية الحوادث الشخصية للسائق والركاب", price: 24 },
      { id: "e3", content: "المساعدة على الطريق", price: 12 },
      { id: "e4", content: "تغطية ضد كسر الزجاج والحرائق والسرقة", price: 100 },
      { id: "e5", content: "تغطية الكوارث الطبيعية", price: 100 },
    ],
    extra_expenses: [
      { id: "x1", reason: "خصم عدم وجود مطالبات", price: -52.15 },
      { id: "x2", reason: "ضريبة القيمة المضافة", price: 70.4 },
    ],
  },
  {
    id: "89b5e898-a407-4006-b764-9320ec0e9ad7",
    name: "التعاونية للتأمين",
    type: "against-others",
    main_price: "344",
    company: {
      name: "tawuniya",
      image_url: "https://github.com/user-attachments/assets/2341cefe-8e2c-4c2d-8ec4-3fca8699b4fb",
    },
    extra_features: [
      { id: "e1", content: "المسؤولية المدنية تجاه الغير بحد أقصى 10,000,000 ريال", price: 0 },
      { id: "e2", content: "تغطية الحوادث الشخصية للسائق فقط", price: 60 },
      { id: "e3", content: "تغطية الحوادث الشخصية للسائق والركاب", price: 140 },
      { id: "e4", content: "المساعدة على الطريق + درايف مجانا", price: 99 },
    ],
    extra_expenses: [
      { id: "x1", reason: "خصم عدم وجود مطالبات", price: -70 },
      { id: "x2", reason: "ضريبة القيمة المضافة", price: 108.75 },
      { id: "x3", reason: "تحميل اضافي (بسبب الحوادث)", price: 100 },
    ],
  },
  {
    id: "ef1894fa-55e6-4a3e-b97d-4ebb4a1d9f84",
    name: "سلامة للتأمين",
    type: "against-others",
    main_price: "233.74",
    company: {
      name: "salama",
      image_url: "https://github.com/user-attachments/assets/207354df-0143-4207-b518-7f5bcc323a21",
    },
    extra_features: [
      { id: "e1", content: "المسؤولية المدنية تجاه الغير بحد أقصى 10,000,000 ريال", price: 0 },
    ],
    extra_expenses: [
      { id: "x1", reason: "خصم عدم وجود مطالبات", price: -73.34 },
      { id: "x2", reason: "ضريبة القيمة المضافة", price: 31.99 },
      { id: "x3", reason: "عمولة نهاية الوسيط", price: 13.2 },
    ],
  },
  {
    id: "b196ddaf-b67f-480a-b7d2-614456dbd00a",
    name: "ليفا للتأمين",
    type: "against-others",
    main_price: "442.6",
    company: {
      name: "liva-insurance",
      image_url: "https://github.com/user-attachments/assets/f49868a4-7ec1-4636-b757-a068b00c7179",
    },
    extra_features: [
      { id: "e1", content: "المسؤولية المدنية تجاه الغير بحد أقصى 10,000,000 ريال", price: 0 },
    ],
    extra_expenses: [
      { id: "x1", reason: "خصم عدم وجود مطالبات", price: -90 },
      { id: "x2", reason: "ضريبة القيمة المضافة", price: 111.8 },
    ],
  },
  {
    id: "61feff99-d37b-4c68-8ca0-12c7b637fe69",
    name: "ميدغلف للتأمين",
    type: "against-others",
    main_price: "332.37",
    company: {
      name: "med-gulf",
      image_url: "https://github.com/user-attachments/assets/b0e744e3-1d0f-4ec0-847f-3ef463aef33c",
    },
    extra_features: [
      { id: "e1", content: "المسؤولية المدنية تجاه الغير بحد أقصى 10,000,000 ريال", price: 0 },
    ],
    extra_expenses: [
      { id: "x1", reason: "خصم عدم وجود مطالبات", price: -91.8 },
      { id: "x2", reason: "ضريبة القيمة المضافة", price: 103.92 },
    ],
  },
  {
    id: "c859fc35-8ea2-4889-84e2-57beef26b438",
    name: "الخليج للتأمين",
    type: "against-others",
    main_price: "342.72",
    company: {
      name: "gulf-union",
      image_url: "https://github.com/user-attachments/assets/80cd683f-f79d-42ef-931d-e3eb1af5829c",
    },
    extra_features: [
      { id: "e1", content: "المسؤولية المدنية تجاه الغير بحد أقصى 10,000,000 ريال", price: 0 },
    ],
    extra_expenses: [
      { id: "x1", reason: "خصم عدم وجود مطالبات", price: -96.15 },
      { id: "x2", reason: "ضريبة القيمة المضافة", price: 138 },
      { id: "x3", reason: "رسوم إدارية", price: 54 },
    ],
  },
];

type SelectedFeatures = { [offerId: string]: string[] };

export default function MotorInsurance() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"new" | "renew">("new");
  const [showError, setShowError] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [expandedOffer, setExpandedOffer] = useState<string | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<SelectedFeatures>({});
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);

  const form = useForm<InsuranceFormData>({
    resolver: zodResolver(insuranceFormSchema),
    defaultValues: {
      nationalId: "1035257896",
      birthDay: "01",
      birthMonth: "01",
      birthYear: "2010",
      isHijri: false,
      phoneNumber: "546555666",
      acceptMarketing: true,
      carInsurance: true,
      healthInsurance: true,
      generalInsurance: true,
      protectionAndSavings: true,
      vehicleSerial: "",
      vehicleYear: "2023",
      coverageType: "comprehensive",
      roadsideAssistance: false,
      replacementCar: false,
      personalAccident: false,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsuranceFormData) => {
      return apiRequest("POST", "/api/insurance/apply", data);
    },
    onSuccess: () => {
      toast({
        title: "تم الإرسال بنجاح",
        description: "سيتم التواصل معك قريباً",
      });
      setCurrentStep(4);
    },
    onError: () => {
      toast({
        title: "حدث خطأ",
        description: "الرجاء المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const handleStep1Submit = () => {
    const step1Fields = ["nationalId", "birthDay", "birthMonth", "birthYear", "phoneNumber"] as const;
    const isValid = step1Fields.every(field => !form.formState.errors[field]);
    if (isValid) {
      setCurrentStep(2);
    }
  };

  const handleStep2Submit = () => {
    setCurrentStep(3);
  };

  const onSubmit = (data: InsuranceFormData) => {
    if (currentStep === 1) {
      handleStep1Submit();
    } else if (currentStep === 2) {
      handleStep2Submit();
    } else if (currentStep === 3) {
      if (!selectedOfferId) {
        toast({
          title: "الرجاء اختيار عرض",
          description: "يرجى اختيار عرض تأمين للمتابعة",
          variant: "destructive",
        });
        return;
      }
      const selectedOffer = offerData.find(o => o.id === selectedOfferId);
      if (selectedOffer) {
        const offerTotal = calculateOfferTotal(selectedOffer);
        const features = selectedFeatures[selectedOfferId] || [];
        const submissionData: InsuranceFormData = {
          ...data,
          selectedOfferId: selectedOfferId,
          selectedOfferName: selectedOffer.name,
          selectedFeatures: JSON.stringify(features),
          offerTotalPrice: offerTotal.toFixed(2),
        };
        mutation.mutate(submissionData);
      }
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleFeature = (offerId: string, featureId: string) => {
    setSelectedFeatures(prev => {
      const current = prev[offerId] || [];
      if (current.includes(featureId)) {
        return { ...prev, [offerId]: current.filter(id => id !== featureId) };
      }
      return { ...prev, [offerId]: [...current, featureId] };
    });
  };

  const calculateOfferTotal = (offer: typeof offerData[0]) => {
    const basePrice = parseFloat(offer.main_price);
    const features = selectedFeatures[offer.id] || [];
    const featuresTotal = offer.extra_features
      .filter(f => features.includes(f.id))
      .reduce((sum, f) => sum + f.price, 0);
    const expensesTotal = offer.extra_expenses.reduce((sum, e) => sum + e.price, 0);
    return basePrice + featuresTotal + expensesTotal;
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => String(currentYear - i));
  const carYears = Array.from({ length: 30 }, (_, i) => String(currentYear - i));

  const roadsideAssistance = form.watch("roadsideAssistance");
  const replacementCar = form.watch("replacementCar");
  const personalAccident = form.watch("personalAccident");

  const basePrice = 1200;
  const addOnsPrice = (roadsideAssistance ? 150 : 0) + (replacementCar ? 300 : 0) + (personalAccident ? 100 : 0);
  const subtotal = basePrice + addOnsPrice;
  const vat = subtotal * 0.15;
  const total = subtotal + vat;

  return (
    <div className="min-h-screen bg-background">
      {showError && currentStep === 1 && (
        <div 
          className="bg-red-50 border-b border-red-100 px-4 py-3 flex items-center justify-center gap-2 cursor-pointer"
          onClick={() => setShowError(false)}
          data-testid="error-banner"
        >
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-sm text-red-700">
            رقم الجوال غير مرتبط برقم الهوية ، الرجاء ادخال البيانات الصحيحة
          </span>
        </div>
      )}

      <div className="max-w-md mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            أمّن مركبتك الآن
          </h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
            <span className="text-sm">تغطيات مجانية لسيارتك مع ضد الغير</span>
          </div>
        </div>

        {currentStep < 4 && (
          <>
            <div className="flex gap-3 mb-6 justify-center">
              <Button
                variant={activeTab === "new" ? "default" : "outline"}
                className="rounded-full px-5 h-10"
                onClick={() => setActiveTab("new")}
                data-testid="tab-new-policy"
              >
                {activeTab === "new" && <Check className="h-4 w-4 ml-2" />}
                وثيقة جديدة
              </Button>
              <Button
                variant={activeTab === "renew" ? "default" : "outline"}
                className="rounded-full px-5 h-10"
                onClick={() => setActiveTab("renew")}
                data-testid="tab-renew-policy"
              >
                {activeTab === "renew" ? <Check className="h-4 w-4 ml-2" /> : <Sparkles className="h-4 w-4 ml-2" />}
                تجديد الوثيقة
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 mb-6">
              <div className={`flex items-center gap-1 ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {currentStep > 1 ? <Check className="h-3 w-3" /> : '1'}
                </div>
              </div>
              <div className={`w-8 h-0.5 ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`flex items-center gap-1 ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {currentStep > 2 ? <Check className="h-3 w-3" /> : '2'}
                </div>
              </div>
              <div className={`w-8 h-0.5 ${currentStep >= 3 ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`flex items-center gap-1 ${currentStep >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${currentStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {currentStep > 3 ? <Check className="h-3 w-3" /> : '3'}
                </div>
              </div>
            </div>
          </>
        )}

        {currentStep === 1 && (
          <Card className="p-6 shadow-sm">
            <div className="flex items-start gap-3 mb-6">
              <div className="w-1 h-10 bg-primary rounded-full mt-0.5" />
              <div>
                <h2 className="font-bold text-foreground text-lg">التفاصيل الشخصية</h2>
                <p className="text-sm text-muted-foreground">يرجى تعبئة المعلومات التالية</p>
              </div>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block text-right">
                  الهوية الوطنية / إقامة / الرقم الموحد 700
                </Label>
                <Input
                  {...form.register("nationalId")}
                  placeholder="1035257896"
                  className="text-left h-12 text-base"
                  dir="ltr"
                  data-testid="input-national-id"
                />
                {form.formState.errors.nationalId && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.nationalId.message}</p>
                )}
              </div>

              <div>
                <Label className="text-sm text-muted-foreground mb-2 block text-right">تاريخ الميلاد</Label>
                <div className="flex gap-3 items-center flex-row-reverse">
                  <Input
                    {...form.register("birthDay")}
                    placeholder="01"
                    className="w-16 text-center h-12 text-base"
                    data-testid="input-birth-day"
                  />
                  <Select
                    value={form.watch("birthYear")}
                    onValueChange={(value) => form.setValue("birthYear", value)}
                  >
                    <SelectTrigger className="flex-1 h-12" data-testid="select-birth-year">
                      <SelectValue placeholder="السنة" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch
                      checked={form.watch("isHijri")}
                      onCheckedChange={(checked) => form.setValue("isHijri", checked)}
                      data-testid="switch-hijri"
                    />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">هجري</span>
                  </div>
                </div>
                {(form.formState.errors.birthDay || form.formState.errors.birthMonth || form.formState.errors.birthYear) && (
                  <p className="text-sm text-destructive mt-2">
                    {form.formState.errors.birthDay?.message || form.formState.errors.birthMonth?.message || form.formState.errors.birthYear?.message}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-sm text-muted-foreground mb-2 block text-right">رقم الجوال</Label>
                <div className="flex gap-2 flex-row-reverse">
                  <Input
                    {...form.register("phoneNumber")}
                    placeholder="5xxxxxxxx"
                    className="flex-1 text-left h-12 text-base"
                    dir="ltr"
                    data-testid="input-phone"
                  />
                  <div className="flex items-center justify-center bg-muted px-4 rounded-md border border-input text-sm text-muted-foreground h-12 shrink-0">
                    +966
                  </div>
                </div>
                {form.formState.errors.phoneNumber && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.phoneNumber.message}</p>
                )}
              </div>

              <div className="pt-5 border-t space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed text-right">
                  بالمتابعة، أقر بموافقتي على قيام شركة التعاونية بمعالجة بياناتي المتوفرة لدى مركز المعلومات الوطني لغرض التحقق من هويتي وإصدار وثيقة التأمين؛ وفقاً للتفاصيل الواردة في{" "}
                  <a href="#" className="text-primary underline">إشعار الخصوصية</a>
                </p>

                <p className="text-xs text-muted-foreground leading-relaxed text-right">
                  أوافق على استلام الرسائل التسويقية والتحديثات والعروض من التعاونية والشركات التابعة لها ؛وفقاً للتفاصيل الواردة في{" "}
                  <a href="#" className="text-primary underline">إشعار الخصوصية</a>
                </p>

                <RadioGroup
                  value={form.watch("acceptMarketing") ? "yes" : "no"}
                  onValueChange={(value) => form.setValue("acceptMarketing", value === "yes")}
                  className="flex flex-col gap-4 pt-2"
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="yes" id="marketing-yes" className="border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary" data-testid="radio-marketing-yes" />
                    <Label htmlFor="marketing-yes" className="text-sm font-normal">نعم</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="no" id="marketing-no" className="border-muted-foreground" data-testid="radio-marketing-no" />
                    <Label htmlFor="marketing-no" className="text-sm font-normal">لا، لا أريد أن أستقبل أي رسائل.</Label>
                  </div>
                </RadioGroup>
              </div>
            </form>
          </Card>
        )}

        {currentStep === 2 && (
          <Card className="p-6 shadow-sm">
            <div className="flex items-start gap-3 mb-6">
              <div className="w-1 h-10 bg-primary rounded-full mt-0.5" />
              <div>
                <h2 className="font-bold text-foreground text-lg">بيانات المركبة</h2>
                <p className="text-sm text-muted-foreground">أدخل معلومات السيارة</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block text-right">
                  الرقم التسلسلي للمركبة
                </Label>
                <Input
                  {...form.register("vehicleSerial")}
                  placeholder="أدخل الرقم التسلسلي"
                  className="text-left h-12 text-base"
                  dir="ltr"
                  data-testid="input-vehicle-serial"
                />
              </div>

              <div>
                <Label className="text-sm text-muted-foreground mb-2 block text-right">سنة الصنع</Label>
                <Select 
                  value={form.watch("vehicleYear")} 
                  onValueChange={(value) => form.setValue("vehicleYear", value)}
                >
                  <SelectTrigger className="h-12" data-testid="select-vehicle-year">
                    <SelectValue placeholder="اختر السنة" />
                  </SelectTrigger>
                  <SelectContent>
                    {carYears.map((year) => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground mb-2 block text-right">نوع التغطية</Label>
                <RadioGroup
                  value={form.watch("coverageType")}
                  onValueChange={(value: "third-party" | "comprehensive") => form.setValue("coverageType", value)}
                  className="grid grid-cols-2 gap-3"
                >
                  <Label htmlFor="coverage-third-party" className="cursor-pointer">
                    <div className={`border rounded-lg p-4 transition-colors ${form.watch("coverageType") === "third-party" ? "border-primary bg-primary/5" : "bg-card hover:border-primary/50"}`}>
                      <RadioGroupItem value="third-party" id="coverage-third-party" className="sr-only" />
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-medium text-sm">ضد الغير</span>
                      </div>
                      <p className="text-xs text-muted-foreground">تغطية أساسية للأضرار التي تلحق بالغير</p>
                    </div>
                  </Label>
                  <Label htmlFor="coverage-comprehensive" className="cursor-pointer">
                    <div className={`border rounded-lg p-4 transition-colors ${form.watch("coverageType") === "comprehensive" ? "border-primary bg-primary/5" : "bg-card hover:border-primary/50"}`}>
                      <RadioGroupItem value="comprehensive" id="coverage-comprehensive" className="sr-only" />
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Car className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-medium text-sm">شامل</span>
                      </div>
                      <p className="text-xs text-muted-foreground">تغطية شاملة لمركبتك والغير</p>
                    </div>
                  </Label>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground mb-2 block text-right">إضافات اختيارية</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        id="roadside" 
                        checked={form.watch("roadsideAssistance")}
                        onCheckedChange={(checked) => form.setValue("roadsideAssistance", !!checked)}
                        className="data-[state=checked]:bg-primary" 
                        data-testid="checkbox-roadside" 
                      />
                      <Label htmlFor="roadside" className="text-sm font-normal">المساعدة على الطريق</Label>
                    </div>
                    <span className="text-sm text-primary font-medium">+ 150 ر.س</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        id="replacement" 
                        checked={form.watch("replacementCar")}
                        onCheckedChange={(checked) => form.setValue("replacementCar", !!checked)}
                        className="data-[state=checked]:bg-primary" 
                        data-testid="checkbox-replacement" 
                      />
                      <Label htmlFor="replacement" className="text-sm font-normal">سيارة بديلة</Label>
                    </div>
                    <span className="text-sm text-primary font-medium">+ 300 ر.س</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        id="personal-accident" 
                        checked={form.watch("personalAccident")}
                        onCheckedChange={(checked) => form.setValue("personalAccident", !!checked)}
                        className="data-[state=checked]:bg-primary" 
                        data-testid="checkbox-personal-accident" 
                      />
                      <Label htmlFor="personal-accident" className="text-sm font-normal">حوادث شخصية للسائق</Label>
                    </div>
                    <span className="text-sm text-primary font-medium">+ 100 ر.س</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground text-sm">القسط الأساسي</span>
                  <span className="font-medium">{basePrice.toLocaleString()} ر.س</span>
                </div>
                {addOnsPrice > 0 && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground text-sm">الإضافات</span>
                    <span className="font-medium">{addOnsPrice.toLocaleString()} ر.س</span>
                  </div>
                )}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground text-sm">ضريبة القيمة المضافة (15%)</span>
                  <span className="font-medium">{vat.toLocaleString()} ر.س</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="font-bold">الإجمالي</span>
                  <span className="font-bold text-primary text-lg">{total.toLocaleString()} ر.س</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-1 h-10 bg-primary rounded-full mt-0.5" />
              <div>
                <h2 className="font-bold text-foreground text-lg">عروض التأمين</h2>
                <p className="text-sm text-muted-foreground">اختر العرض المناسب لك</p>
              </div>
            </div>

            <div className="text-sm text-muted-foreground text-center mb-4 flex items-center justify-center gap-2">
              <Info className="h-4 w-4" />
              <span>اضغط على العرض لمشاهدة التفاصيل والإضافات</span>
            </div>

            {offerData.map((offer) => {
              const isExpanded = expandedOffer === offer.id;
              const isSelected = selectedOfferId === offer.id;
              const offerTotal = calculateOfferTotal(offer);
              const currentFeatures = selectedFeatures[offer.id] || [];

              return (
                <Card 
                  key={offer.id} 
                  className={`overflow-hidden transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}
                  data-testid={`offer-card-${offer.id}`}
                >
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => setExpandedOffer(isExpanded ? null : offer.id)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-white border flex items-center justify-center overflow-hidden">
                          <img 
                            src={offer.company.image_url} 
                            alt={offer.name}
                            className="w-10 h-10 object-contain"
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">{offer.name}</h3>
                          <p className="text-xs text-muted-foreground">ضد الغير</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-primary text-lg">{offerTotal.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">ر.س / سنوياً</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <Button
                        size="sm"
                        variant={isSelected ? "default" : "outline"}
                        className="rounded-full text-xs h-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOfferId(isSelected ? null : offer.id);
                        }}
                        data-testid={`select-offer-${offer.id}`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="h-3 w-3 ml-1" />
                            تم الاختيار
                          </>
                        ) : (
                          'اختيار العرض'
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs h-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedOffer(isExpanded ? null : offer.id);
                        }}
                      >
                        {isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                        {isExpanded ? <Minus className="h-3 w-3 mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t bg-muted/30">
                      <div className="pt-4 space-y-3">
                        <h4 className="font-semibold text-sm">التغطيات والإضافات</h4>
                        {offer.extra_features.map((feature) => (
                          <div 
                            key={feature.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-background"
                          >
                            <div className="flex items-center gap-2">
                              {feature.price > 0 ? (
                                <Checkbox
                                  checked={currentFeatures.includes(feature.id)}
                                  onCheckedChange={() => toggleFeature(offer.id, feature.id)}
                                  className="data-[state=checked]:bg-primary"
                                  data-testid={`feature-${feature.id}`}
                                />
                              ) : (
                                <Check className="h-4 w-4 text-green-600" />
                              )}
                              <span className="text-xs">{feature.content}</span>
                            </div>
                            {feature.price > 0 ? (
                              <span className="text-xs text-primary font-medium">+{feature.price} ر.س</span>
                            ) : (
                              <span className="text-xs text-green-600 font-medium">مجاناً</span>
                            )}
                          </div>
                        ))}

                        <h4 className="font-semibold text-sm pt-2">تفاصيل السعر</h4>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">القسط الأساسي</span>
                            <span>{offer.main_price} ر.س</span>
                          </div>
                          {offer.extra_expenses.map((expense) => (
                            <div key={expense.id} className="flex justify-between">
                              <span className="text-muted-foreground">{expense.reason}</span>
                              <span className={expense.price < 0 ? 'text-green-600' : ''}>
                                {expense.price < 0 ? '' : '+'}{expense.price} ر.س
                              </span>
                            </div>
                          ))}
                          {currentFeatures.length > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">الإضافات المختارة</span>
                              <span className="text-primary">
                                +{offer.extra_features
                                  .filter(f => currentFeatures.includes(f.id))
                                  .reduce((sum, f) => sum + f.price, 0)} ر.س
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between pt-2 border-t font-bold">
                            <span>الإجمالي</span>
                            <span className="text-primary">{offerTotal.toFixed(2)} ر.س</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {currentStep === 4 && (
          <Card className="p-8 shadow-sm text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="font-bold text-foreground text-xl mb-2">تم استلام طلبك بنجاح</h2>
            <p className="text-muted-foreground mb-6">سيتم التواصل معك قريباً لإتمام إجراءات التأمين</p>
            <Button 
              className="rounded-full px-8"
              onClick={() => {
                setCurrentStep(1);
                setSelectedOfferId(null);
                setSelectedFeatures({});
                setExpandedOffer(null);
                form.reset();
              }}
              data-testid="button-new-request"
            >
              طلب جديد
            </Button>
          </Card>
        )}

        {currentStep < 4 && (
          <div className="flex gap-3 mt-6">
            {currentStep > 1 && (
              <Button 
                variant="outline"
                className="flex-1 h-12 text-base rounded-full gap-2"
                onClick={goBack}
                data-testid="button-back"
              >
                <ChevronRight className="h-5 w-5" />
                رجوع
              </Button>
            )}
            <Button 
              className={`h-12 text-base rounded-full gap-2 ${currentStep > 1 ? 'flex-1' : 'w-full'}`}
              onClick={form.handleSubmit(onSubmit)}
              disabled={mutation.isPending}
              data-testid="button-continue"
            >
              {mutation.isPending ? "جاري الإرسال..." : currentStep === 3 ? 'تأكيد الطلب' : 'متابعة'}
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-x-4 gap-y-3 justify-center">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={form.watch("carInsurance")}
              onCheckedChange={(checked) => form.setValue("carInsurance", !!checked)}
              id="car-insurance"
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded-full h-5 w-5"
              data-testid="checkbox-car-insurance"
            />
            <Label htmlFor="car-insurance" className="text-sm font-normal">تأمين السيارات</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={form.watch("healthInsurance")}
              onCheckedChange={(checked) => form.setValue("healthInsurance", !!checked)}
              id="health-insurance"
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded-full h-5 w-5"
              data-testid="checkbox-health-insurance"
            />
            <Label htmlFor="health-insurance" className="text-sm font-normal">تأمين الصحة</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={form.watch("generalInsurance")}
              onCheckedChange={(checked) => form.setValue("generalInsurance", !!checked)}
              id="general-insurance"
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded-full h-5 w-5"
              data-testid="checkbox-general-insurance"
            />
            <Label htmlFor="general-insurance" className="text-sm font-normal">تأمين عام</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={form.watch("protectionAndSavings")}
              onCheckedChange={(checked) => form.setValue("protectionAndSavings", !!checked)}
              id="protection-savings"
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded-full h-5 w-5"
              data-testid="checkbox-protection-savings"
            />
            <Label htmlFor="protection-savings" className="text-sm font-normal">تأمين حماية و الادخار</Label>
          </div>
        </div>
      </div>
    </div>
  );
}
