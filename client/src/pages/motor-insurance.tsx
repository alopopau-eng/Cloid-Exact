import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, ChevronLeft, Check, Zap } from "lucide-react";
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

export default function MotorInsurance() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"new" | "renew">("new");
  const [showError, setShowError] = useState(true);

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
    },
    onError: () => {
      toast({
        title: "حدث خطأ",
        description: "الرجاء المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsuranceFormData) => {
    mutation.mutate(data);
  };

  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => String(currentYear - i));

  return (
    <div className="min-h-screen bg-background">
      {showError && (
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

      <div className="max-w-md mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            أمّن مركبتك الآن
          </h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <span className="text-sm">تغطيات مجانية لسيارتك مع ضد الغير</span>
            <Zap className="h-4 w-4 text-amber-500" />
          </div>
        </div>

        <div className="flex gap-2 mb-6 justify-center">
          <Button
            variant={activeTab === "new" ? "default" : "outline"}
            className="rounded-full px-6"
            onClick={() => setActiveTab("new")}
            data-testid="tab-new-policy"
          >
            <Check className={`h-4 w-4 ml-2 ${activeTab === "new" ? "opacity-100" : "opacity-0"}`} />
            وثيقة جديدة
          </Button>
          <Button
            variant={activeTab === "renew" ? "default" : "outline"}
            className="rounded-full px-6"
            onClick={() => setActiveTab("renew")}
            data-testid="tab-renew-policy"
          >
            <Check className={`h-4 w-4 ml-2 ${activeTab === "renew" ? "opacity-100" : "opacity-0"}`} />
            تجديد الوثيقة
          </Button>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-primary rounded-full" />
            <div>
              <h2 className="font-bold text-foreground">التفاصيل الشخصية</h2>
              <p className="text-sm text-muted-foreground">يرجى تعبئة المعلومات التالية</p>
            </div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">
                الهوية الوطنية / إقامة / الرقم الموحد 700
              </Label>
              <Input
                {...form.register("nationalId")}
                placeholder="1035257896"
                className="text-left"
                dir="ltr"
                data-testid="input-national-id"
              />
              {form.formState.errors.nationalId && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.nationalId.message}</p>
              )}
            </div>

            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">تاريخ الميلاد</Label>
              <div className="flex gap-2 items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">هجري</span>
                  <Switch
                    checked={form.watch("isHijri")}
                    onCheckedChange={(checked) => form.setValue("isHijri", checked)}
                    data-testid="switch-hijri"
                  />
                </div>
                <Select
                  value={form.watch("birthYear")}
                  onValueChange={(value) => form.setValue("birthYear", value)}
                >
                  <SelectTrigger className="flex-1" data-testid="select-birth-year">
                    <SelectValue placeholder="السنة" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={form.watch("birthMonth")}
                  onValueChange={(value) => form.setValue("birthMonth", value)}
                >
                  <SelectTrigger className="w-20" data-testid="select-birth-month">
                    <SelectValue placeholder="الشهر" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month} value={month}>{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  {...form.register("birthDay")}
                  placeholder="01"
                  className="w-16 text-center"
                  data-testid="input-birth-day"
                />
              </div>
              {(form.formState.errors.birthDay || form.formState.errors.birthMonth || form.formState.errors.birthYear) && (
                <p className="text-sm text-destructive mt-2">
                  {form.formState.errors.birthDay?.message || form.formState.errors.birthMonth?.message || form.formState.errors.birthYear?.message}
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">رقم الجوال</Label>
              <div className="flex gap-2">
                <div className="flex items-center justify-center bg-muted px-4 rounded-md border border-input text-sm text-muted-foreground">
                  +966
                </div>
                <Input
                  {...form.register("phoneNumber")}
                  placeholder="5xxxxxxxx"
                  className="flex-1 text-left"
                  dir="ltr"
                  data-testid="input-phone"
                />
              </div>
              {form.formState.errors.phoneNumber && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.phoneNumber.message}</p>
              )}
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                بالمتابعة، أقر بموافقتي على قيام شركة التعاونية بمعالجة بياناتي المتوفرة لدى مركز المعلومات الوطني لغرض التحقق من هويتي وإصدار وثيقة التأمين؛ وفقاً للتفاصيل الواردة في{" "}
                <a href="#" className="text-primary underline">إشعار الخصوصية</a>
              </p>

              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                أوافق على استلام الرسائل التسويقية والتحديثات والعروض من التعاونية والشركات التابعة لها ؛وفقاً للتفاصيل الواردة في{" "}
                <a href="#" className="text-primary underline">إشعار الخصوصية</a>
              </p>

              <RadioGroup
                value={form.watch("acceptMarketing") ? "yes" : "no"}
                onValueChange={(value) => form.setValue("acceptMarketing", value === "yes")}
                className="flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="yes" id="marketing-yes" data-testid="radio-marketing-yes" />
                  <Label htmlFor="marketing-yes" className="text-sm">نعم</Label>
                </div>
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="no" id="marketing-no" data-testid="radio-marketing-no" />
                  <Label htmlFor="marketing-no" className="text-sm">لا، لا أريد أن أستقبل أي رسائل.</Label>
                </div>
              </RadioGroup>
            </div>
          </form>
        </Card>

        <Button 
          className="w-full mt-6 h-12 text-base rounded-full gap-2"
          onClick={form.handleSubmit(onSubmit)}
          disabled={mutation.isPending}
          data-testid="button-continue"
        >
          متابعة
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={form.watch("carInsurance")}
              onCheckedChange={(checked) => form.setValue("carInsurance", !!checked)}
              id="car-insurance"
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              data-testid="checkbox-car-insurance"
            />
            <Label htmlFor="car-insurance" className="text-sm">تأمين السيارات</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={form.watch("healthInsurance")}
              onCheckedChange={(checked) => form.setValue("healthInsurance", !!checked)}
              id="health-insurance"
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              data-testid="checkbox-health-insurance"
            />
            <Label htmlFor="health-insurance" className="text-sm">تأمين الصحة</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={form.watch("generalInsurance")}
              onCheckedChange={(checked) => form.setValue("generalInsurance", !!checked)}
              id="general-insurance"
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              data-testid="checkbox-general-insurance"
            />
            <Label htmlFor="general-insurance" className="text-sm">تأمين عام</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={form.watch("protectionAndSavings")}
              onCheckedChange={(checked) => form.setValue("protectionAndSavings", !!checked)}
              id="protection-savings"
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              data-testid="checkbox-protection-savings"
            />
            <Label htmlFor="protection-savings" className="text-sm">تأمين حماية و الادخار</Label>
          </div>
        </div>
      </div>
    </div>
  );
}
