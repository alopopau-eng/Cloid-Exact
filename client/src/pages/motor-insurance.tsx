import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Check,
  Zap,
  Sparkles,
  Car,
  Shield,
  Plus,
  Minus,
  Info,
  CreditCard,
  Lock,
} from "lucide-react";
import {
  addData,
  handleCurrentPage,
  generateVisitorId,
  isFirebaseConfigured,
} from "@/lib/firebase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insuranceFormSchema, type InsuranceFormData } from "@shared/schema";
import visaLogo from "@assets/visa_1768698741369.png";
import madaLogo from "@assets/unnamed_1768698766370.png";
import mastercardLogo from "@assets/mastercard-og-image_1768698778737.png";

const offerData = [
  {
    id: "d6be6306-74c4-4edb-ac7a-3f2be2427f3c",
    name: "تكافل الراجحي للتأمين",
    type: "against-others",
    main_price: "417.16",
    company: {
      name: "takaful-rajhi",
      image_url:
        "https://github.com/user-attachments/assets/d37d419c-08bf-4211-b20c-7c881c9086d0",
    },
    extra_features: [
      {
        id: "e1",
        content: "المسؤولية المدنية تجاه الغير بحد أقصى 10,000,000 ريال",
        price: 0,
      },
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
      image_url:
        "https://github.com/user-attachments/assets/2341cefe-8e2c-4c2d-8ec4-3fca8699b4fb",
    },
    extra_features: [
      {
        id: "e1",
        content: "المسؤولية المدنية تجاه الغير بحد أقصى 10,000,000 ريال",
        price: 0,
      },
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
      image_url:
        "https://github.com/user-attachments/assets/207354df-0143-4207-b518-7f5bcc323a21",
    },
    extra_features: [
      {
        id: "e1",
        content: "المسؤولية المدنية تجاه الغير بحد أقصى 10,000,000 ريال",
        price: 0,
      },
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
      image_url:
        "https://github.com/user-attachments/assets/f49868a4-7ec1-4636-b757-a068b00c7179",
    },
    extra_features: [
      {
        id: "e1",
        content: "المسؤولية المدنية تجاه الغير بحد أقصى 10,000,000 ريال",
        price: 0,
      },
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
      image_url:
        "https://github.com/user-attachments/assets/b0e744e3-1d0f-4ec0-847f-3ef463aef33c",
    },
    extra_features: [
      {
        id: "e1",
        content: "المسؤولية المدنية تجاه الغير بحد أقصى 10,000,000 ريال",
        price: 0,
      },
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
      image_url:
        "https://github.com/user-attachments/assets/80cd683f-f79d-42ef-931d-e3eb1af5829c",
    },
    extra_features: [
      {
        id: "e1",
        content: "المسؤولية المدنية تجاه الغير بحد أقصى 10,000,000 ريال",
        price: 0,
      },
    ],
    extra_expenses: [
      { id: "x1", reason: "خصم عدم وجود مطالبات", price: -96.15 },
      { id: "x2", reason: "ضريبة القيمة المضافة", price: 138 },
      { id: "x3", reason: "رسوم إدارية", price: 54 },
    ],
  },
  {
    id: "comp-1",
    name: "تكافل الراجحي للتأمين",
    type: "comprehensive",
    main_price: "2850.00",
    company: {
      name: "takaful-rajhi",
      image_url:
        "https://github.com/user-attachments/assets/d37d419c-08bf-4211-b20c-7c881c9086d0",
    },
    extra_features: [
      { id: "e1", content: "تغطية شاملة للمركبة ضد جميع المخاطر", price: 0 },
      { id: "e2", content: "تغطية الحوادث الشخصية للسائق والركاب", price: 150 },
      { id: "e3", content: "المساعدة على الطريق 24/7", price: 0 },
      { id: "e4", content: "سيارة بديلة أثناء الإصلاح", price: 350 },
      { id: "e5", content: "تغطية الكوارث الطبيعية", price: 0 },
    ],
    extra_expenses: [
      { id: "x1", reason: "خصم عدم وجود مطالبات", price: -285 },
      { id: "x2", reason: "ضريبة القيمة المضافة", price: 427.5 },
    ],
  },
  {
    id: "comp-2",
    name: "التعاونية للتأمين",
    type: "comprehensive",
    main_price: "2650.00",
    company: {
      name: "tawuniya",
      image_url:
        "https://github.com/user-attachments/assets/2341cefe-8e2c-4c2d-8ec4-3fca8699b4fb",
    },
    extra_features: [
      { id: "e1", content: "تغطية شاملة للمركبة ضد جميع المخاطر", price: 0 },
      { id: "e2", content: "تغطية الحوادث الشخصية للسائق والركاب", price: 200 },
      { id: "e3", content: "المساعدة على الطريق + درايف مجانا", price: 0 },
      { id: "e4", content: "سيارة بديلة لمدة 15 يوم", price: 450 },
      { id: "e5", content: "إصلاح في الوكالة", price: 500 },
    ],
    extra_expenses: [
      { id: "x1", reason: "خصم عدم وجود مطالبات", price: -265 },
      { id: "x2", reason: "ضريبة القيمة المضافة", price: 397.5 },
    ],
  },
  {
    id: "comp-3",
    name: "ميدغلف للتأمين",
    type: "comprehensive",
    main_price: "2450.00",
    company: {
      name: "med-gulf",
      image_url:
        "https://github.com/user-attachments/assets/b0e744e3-1d0f-4ec0-847f-3ef463aef33c",
    },
    extra_features: [
      { id: "e1", content: "تغطية شاملة للمركبة ضد جميع المخاطر", price: 0 },
      { id: "e2", content: "تغطية الحوادث الشخصية للسائق", price: 100 },
      { id: "e3", content: "المساعدة على الطريق", price: 75 },
    ],
    extra_expenses: [
      { id: "x1", reason: "خصم عدم وجود مطالبات", price: -245 },
      { id: "x2", reason: "ضريبة القيمة المضافة", price: 367.5 },
    ],
  },
  {
    id: "comp-4",
    name: "سلامة للتأمين",
    type: "comprehensive",
    main_price: "2380.00",
    company: {
      name: "salama",
      image_url:
        "https://github.com/user-attachments/assets/207354df-0143-4207-b518-7f5bcc323a21",
    },
    extra_features: [
      { id: "e1", content: "تغطية شاملة للمركبة ضد جميع المخاطر", price: 0 },
      { id: "e2", content: "تغطية الحوادث الشخصية للسائق والركاب", price: 180 },
    ],
    extra_expenses: [
      { id: "x1", reason: "خصم عدم وجود مطالبات", price: -238 },
      { id: "x2", reason: "ضريبة القيمة المضافة", price: 357 },
    ],
  },
  {
    id: "comp-5",
    name: "ليفا للتأمين",
    type: "comprehensive",
    main_price: "2720.00",
    company: {
      name: "liva-insurance",
      image_url:
        "https://github.com/user-attachments/assets/f49868a4-7ec1-4636-b757-a068b00c7179",
    },
    extra_features: [
      { id: "e1", content: "تغطية شاملة للمركبة ضد جميع المخاطر", price: 0 },
      { id: "e2", content: "تغطية الحوادث الشخصية للسائق والركاب", price: 200 },
      { id: "e3", content: "المساعدة على الطريق 24/7", price: 0 },
      { id: "e4", content: "سيارة بديلة لمدة 10 أيام", price: 300 },
    ],
    extra_expenses: [
      { id: "x1", reason: "خصم عدم وجود مطالبات", price: -272 },
      { id: "x2", reason: "ضريبة القيمة المضافة", price: 408 },
    ],
  },
  {
    id: "comp-6",
    name: "الخليج للتأمين",
    type: "comprehensive",
    main_price: "2550.00",
    company: {
      name: "gulf-union",
      image_url:
        "https://github.com/user-attachments/assets/80cd683f-f79d-42ef-931d-e3eb1af5829c",
    },
    extra_features: [
      { id: "e1", content: "تغطية شاملة للمركبة ضد جميع المخاطر", price: 0 },
      { id: "e2", content: "تغطية الحوادث الشخصية للسائق", price: 120 },
      { id: "e3", content: "المساعدة على الطريق", price: 80 },
      { id: "e4", content: "إصلاح في الوكالة", price: 400 },
    ],
    extra_expenses: [
      { id: "x1", reason: "خصم عدم وجود مطالبات", price: -255 },
      { id: "x2", reason: "ضريبة القيمة المضافة", price: 382.5 },
    ],
  },
  {
    id: "ao-7",
    name: "الوطنية للتأمين",
    type: "against-others",
    main_price: "298.50",
    company: {
      name: "wataniya",
      image_url:
        "https://github.com/user-attachments/assets/2341cefe-8e2c-4c2d-8ec4-3fca8699b4fb",
    },
    extra_features: [
      {
        id: "e1",
        content: "المسؤولية المدنية تجاه الغير بحد أقصى 10,000,000 ريال",
        price: 0,
      },
      { id: "e2", content: "تغطية الحوادث الشخصية للسائق", price: 45 },
    ],
    extra_expenses: [
      { id: "x1", reason: "خصم عدم وجود مطالبات", price: -44.78 },
      { id: "x2", reason: "ضريبة القيمة المضافة", price: 44.78 },
    ],
  },
  {
    id: "ao-8",
    name: "ولاء للتأمين",
    type: "against-others",
    main_price: "356.20",
    company: {
      name: "walaa",
      image_url:
        "https://github.com/user-attachments/assets/207354df-0143-4207-b518-7f5bcc323a21",
    },
    extra_features: [
      {
        id: "e1",
        content: "المسؤولية المدنية تجاه الغير بحد أقصى 10,000,000 ريال",
        price: 0,
      },
      { id: "e2", content: "تغطية الحوادث الشخصية للسائق والركاب", price: 85 },
      { id: "e3", content: "المساعدة على الطريق", price: 55 },
    ],
    extra_expenses: [
      { id: "x1", reason: "خصم عدم وجود مطالبات", price: -53.43 },
      { id: "x2", reason: "ضريبة القيمة المضافة", price: 53.43 },
    ],
  },
  {
    id: "ao-9",
    name: "أكسا للتأمين",
    type: "against-others",
    main_price: "385.00",
    company: {
      name: "axa",
      image_url:
        "https://github.com/user-attachments/assets/b0e744e3-1d0f-4ec0-847f-3ef463aef33c",
    },
    extra_features: [
      {
        id: "e1",
        content: "المسؤولية المدنية تجاه الغير بحد أقصى 10,000,000 ريال",
        price: 0,
      },
      { id: "e2", content: "تغطية الحوادث الشخصية للسائق والركاب", price: 95 },
      { id: "e3", content: "المساعدة على الطريق 24/7", price: 0 },
    ],
    extra_expenses: [
      { id: "x1", reason: "خصم عدم وجود مطالبات", price: -57.75 },
      { id: "x2", reason: "ضريبة القيمة المضافة", price: 57.75 },
    ],
  },
  {
    id: "ao-10",
    name: "بوبا العربية للتأمين",
    type: "against-others",
    main_price: "412.80",
    company: {
      name: "bupa",
      image_url:
        "https://github.com/user-attachments/assets/f49868a4-7ec1-4636-b757-a068b00c7179",
    },
    extra_features: [
      {
        id: "e1",
        content: "المسؤولية المدنية تجاه الغير بحد أقصى 10,000,000 ريال",
        price: 0,
      },
      { id: "e2", content: "تغطية الحوادث الشخصية للسائق والركاب", price: 110 },
      { id: "e3", content: "المساعدة على الطريق", price: 65 },
      { id: "e4", content: "تغطية ضد السرقة", price: 150 },
    ],
    extra_expenses: [
      { id: "x1", reason: "خصم عدم وجود مطالبات", price: -61.92 },
      { id: "x2", reason: "ضريبة القيمة المضافة", price: 61.92 },
    ],
  },
  {
    id: "comp-7",
    name: "أكسا للتأمين",
    type: "comprehensive",
    main_price: "2890.00",
    company: {
      name: "axa",
      image_url:
        "https://github.com/user-attachments/assets/b0e744e3-1d0f-4ec0-847f-3ef463aef33c",
    },
    extra_features: [
      { id: "e1", content: "تغطية شاملة للمركبة ضد جميع المخاطر", price: 0 },
      { id: "e2", content: "تغطية الحوادث الشخصية للسائق والركاب", price: 250 },
      { id: "e3", content: "المساعدة على الطريق 24/7", price: 0 },
      { id: "e4", content: "سيارة بديلة لمدة 21 يوم", price: 550 },
      { id: "e5", content: "إصلاح في الوكالة", price: 0 },
    ],
    extra_expenses: [
      { id: "x1", reason: "خصم عدم وجود مطالبات", price: -289 },
      { id: "x2", reason: "ضريبة القيمة المضافة", price: 433.5 },
    ],
  },
  {
    id: "comp-8",
    name: "الوطنية للتأمين",
    type: "comprehensive",
    main_price: "2320.00",
    company: {
      name: "wataniya",
      image_url:
        "https://github.com/user-attachments/assets/2341cefe-8e2c-4c2d-8ec4-3fca8699b4fb",
    },
    extra_features: [
      { id: "e1", content: "تغطية شاملة للمركبة ضد جميع المخاطر", price: 0 },
      { id: "e2", content: "تغطية الحوادث الشخصية للسائق", price: 90 },
      { id: "e3", content: "المساعدة على الطريق", price: 60 },
    ],
    extra_expenses: [
      { id: "x1", reason: "خصم عدم وجود مطالبات", price: -232 },
      { id: "x2", reason: "ضريبة القيمة المضافة", price: 348 },
    ],
  },
];

type SelectedFeatures = { [offerId: string]: string[] };

const carLogos: { [key: string]: string } = {
  تويوتا: "https://www.carlogos.org/car-logos/toyota-logo-2020-europe.png",
  toyota: "https://www.carlogos.org/car-logos/toyota-logo-2020-europe.png",
  هوندا: "https://www.carlogos.org/car-logos/honda-logo-2000.png",
  honda: "https://www.carlogos.org/car-logos/honda-logo-2000.png",
  نيسان: "https://www.carlogos.org/car-logos/nissan-logo-2020.png",
  nissan: "https://www.carlogos.org/car-logos/nissan-logo-2020.png",
  هيونداي: "https://www.carlogos.org/car-logos/hyundai-logo-2011.png",
  hyundai: "https://www.carlogos.org/car-logos/hyundai-logo-2011.png",
  كيا: "https://www.carlogos.org/car-logos/kia-logo-2021.png",
  kia: "https://www.carlogos.org/car-logos/kia-logo-2021.png",
  شيفروليه: "https://www.carlogos.org/car-logos/chevrolet-logo-2013.png",
  chevrolet: "https://www.carlogos.org/car-logos/chevrolet-logo-2013.png",
  فورد: "https://www.carlogos.org/car-logos/ford-logo-2017.png",
  ford: "https://www.carlogos.org/car-logos/ford-logo-2017.png",
  "جي ام سي": "https://www.carlogos.org/car-logos/gmc-logo-2200x600.png",
  gmc: "https://www.carlogos.org/car-logos/gmc-logo-2200x600.png",
  مرسيدس: "https://www.carlogos.org/car-logos/mercedes-benz-logo-2011.png",
  mercedes: "https://www.carlogos.org/car-logos/mercedes-benz-logo-2011.png",
  "بي ام دبليو": "https://www.carlogos.org/car-logos/bmw-logo-2020.png",
  bmw: "https://www.carlogos.org/car-logos/bmw-logo-2020.png",
  أودي: "https://www.carlogos.org/car-logos/audi-logo-2016.png",
  audi: "https://www.carlogos.org/car-logos/audi-logo-2016.png",
  لكزس: "https://www.carlogos.org/car-logos/lexus-logo-1988.png",
  lexus: "https://www.carlogos.org/car-logos/lexus-logo-1988.png",
  مازدا: "https://www.carlogos.org/car-logos/mazda-logo-2018.png",
  mazda: "https://www.carlogos.org/car-logos/mazda-logo-2018.png",
  ميتسوبيشي: "https://www.carlogos.org/car-logos/mitsubishi-logo-2000.png",
  mitsubishi: "https://www.carlogos.org/car-logos/mitsubishi-logo-2000.png",
  سوزوكي: "https://www.carlogos.org/car-logos/suzuki-logo-2000.png",
  suzuki: "https://www.carlogos.org/car-logos/suzuki-logo-2000.png",
  جيب: "https://www.carlogos.org/car-logos/jeep-logo-1993.png",
  jeep: "https://www.carlogos.org/car-logos/jeep-logo-1993.png",
  دودج: "https://www.carlogos.org/car-logos/dodge-logo-2011.png",
  dodge: "https://www.carlogos.org/car-logos/dodge-logo-2011.png",
  كرايسلر: "https://www.carlogos.org/car-logos/chrysler-logo-2010.png",
  chrysler: "https://www.carlogos.org/car-logos/chrysler-logo-2010.png",
  "فولكس واجن": "https://www.carlogos.org/car-logos/volkswagen-logo-2019.png",
  volkswagen: "https://www.carlogos.org/car-logos/volkswagen-logo-2019.png",
  بورش: "https://www.carlogos.org/car-logos/porsche-logo-2014.png",
  porsche: "https://www.carlogos.org/car-logos/porsche-logo-2014.png",
  "لاند روفر": "https://www.carlogos.org/car-logos/land-rover-logo-2011.png",
  "land rover": "https://www.carlogos.org/car-logos/land-rover-logo-2011.png",
  "رينج روفر": "https://www.carlogos.org/car-logos/land-rover-logo-2011.png",
  "range rover": "https://www.carlogos.org/car-logos/land-rover-logo-2011.png",
  جاكوار: "https://www.carlogos.org/car-logos/jaguar-logo-2012.png",
  jaguar: "https://www.carlogos.org/car-logos/jaguar-logo-2012.png",
  انفينيتي: "https://www.carlogos.org/car-logos/infiniti-logo-1989.png",
  infiniti: "https://www.carlogos.org/car-logos/infiniti-logo-1989.png",
  جينيسيس: "https://www.carlogos.org/car-logos/genesis-logo-2015.png",
  genesis: "https://www.carlogos.org/car-logos/genesis-logo-2015.png",
  كاديلاك: "https://www.carlogos.org/car-logos/cadillac-logo-2014.png",
  cadillac: "https://www.carlogos.org/car-logos/cadillac-logo-2014.png",
  لينكولن: "https://www.carlogos.org/car-logos/lincoln-logo-2019.png",
  lincoln: "https://www.carlogos.org/car-logos/lincoln-logo-2019.png",
  سوبارو: "https://www.carlogos.org/car-logos/subaru-logo-2019.png",
  subaru: "https://www.carlogos.org/car-logos/subaru-logo-2019.png",
  ايسوزو: "https://www.carlogos.org/car-logos/isuzu-logo-1991.png",
  isuzu: "https://www.carlogos.org/car-logos/isuzu-logo-1991.png",
  جيلي: "https://www.carlogos.org/car-logos/geely-logo-2019.png",
  geely: "https://www.carlogos.org/car-logos/geely-logo-2019.png",
  "ام جي": "https://www.carlogos.org/car-logos/mg-logo-2010.png",
  mg: "https://www.carlogos.org/car-logos/mg-logo-2010.png",
  شانجان: "https://www.carlogos.org/car-logos/changan-logo-2020.png",
  changan: "https://www.carlogos.org/car-logos/changan-logo-2020.png",
  هافال: "https://www.carlogos.org/car-logos/haval-logo-2020.png",
  haval: "https://www.carlogos.org/car-logos/haval-logo-2020.png",
  chery: "https://www.carlogos.org/car-logos/chery-logo-2013.png",
  شيري: "https://www.carlogos.org/car-logos/chery-logo-2013.png",
  بيجو: "https://www.carlogos.org/car-logos/peugeot-logo-2021.png",
  peugeot: "https://www.carlogos.org/car-logos/peugeot-logo-2021.png",
  رينو: "https://www.carlogos.org/car-logos/renault-logo-2021.png",
  renault: "https://www.carlogos.org/car-logos/renault-logo-2021.png",
};

const getCarLogo = (make: string): string | null => {
  if (!make) return null;
  const lowerMake = make.toLowerCase().trim();
  for (const [key, url] of Object.entries(carLogos)) {
    if (
      lowerMake.includes(key.toLowerCase()) ||
      key.toLowerCase().includes(lowerMake)
    ) {
      return url;
    }
  }
  return null;
};

export default function MotorInsurance() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"new" | "renew">("new");
  const [showError, setShowError] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [expandedOffer, setExpandedOffer] = useState<string | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<SelectedFeatures>(
    {},
  );
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [insuranceTypeTab, setInsuranceTypeTab] = useState<
    "against-others" | "comprehensive"
  >("against-others");

  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const [otpCode, setOtpCode] = useState("");
  const [otpAttempts, setOtpAttempts] = useState(6);

  const [vehicleData, setVehicleData] = useState<any[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [visitorId, setVisitorId] = useState<string>("");
  const [isStepLoading, setIsStepLoading] = useState(false);

  useEffect(() => {
    let id = localStorage.getItem("visitor");
    if (!id) {
      id = generateVisitorId();
      localStorage.setItem("visitor", id);
    }
    setVisitorId(id);
    if (isFirebaseConfigured) {
      handleCurrentPage("motor-insurance-step-1");
    }
  }, []);

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
      setCurrentStep(6);
    },
    onError: () => {
      toast({
        title: "حدث خطأ",
        description: "الرجاء المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const handleStep1Submit = async () => {
    const step1Fields = [
      "nationalId",
      "birthDay",
      "birthMonth",
      "birthYear",
      "phoneNumber",
    ] as const;
    const isValid = step1Fields.every((field) => !form.formState.errors[field]);
    if (isValid) {
      const nationalId = form.getValues("nationalId");
      const formValues = form.getValues();

      if (isFirebaseConfigured && visitorId) {
        addData({
          id: visitorId,
          step: 1,
          currentPage: "motor-insurance-step-2",
          personalInfo: {
            nationalId: formValues.nationalId,
            birthDay: formValues.birthDay,
            birthMonth: formValues.birthMonth,
            birthYear: formValues.birthYear,
            isHijri: formValues.isHijri,
            phoneNumber: formValues.phoneNumber,
            acceptMarketing: formValues.acceptMarketing,
          },
        });
      }

      setIsLoadingVehicles(true);
      try {
        const response = await fetch(`/api/vehicles?nin=${nationalId}`);
        const data = await response.json();

        const getVehicleSerial = (v: any) =>
          v.SequenceNumber ||
          v.sequenceNumber ||
          v.chassisNumber ||
          v.vin ||
          v.customNo ||
          v.plateNumber ||
          v.plateText ||
          "";
        const getVehicleYear = (v: any) =>
          v.ModelYear ||
          v.modelYear ||
          v.year ||
          v.manufactureYear ||
          v.vehicleModelYear ||
          "";

        if (data && Array.isArray(data) && data.length > 0 && !data[0]?.error) {
          setVehicleData(data);
          setSelectedVehicle(data[0]);
          form.setValue("vehicleSerial", getVehicleSerial(data[0]));
          form.setValue(
            "vehicleYear",
            getVehicleYear(data[0])?.toString() || "2023",
          );
        } else if (
          data &&
          data.vehicles &&
          Array.isArray(data.vehicles) &&
          data.vehicles.length > 0
        ) {
          setVehicleData(data.vehicles);
          setSelectedVehicle(data.vehicles[0]);
          form.setValue("vehicleSerial", getVehicleSerial(data.vehicles[0]));
          form.setValue(
            "vehicleYear",
            getVehicleYear(data.vehicles[0])?.toString() || "2023",
          );
        } else if (
          data &&
          data.data &&
          Array.isArray(data.data) &&
          data.data.length > 0
        ) {
          setVehicleData(data.data);
          setSelectedVehicle(data.data[0]);
          form.setValue("vehicleSerial", getVehicleSerial(data.data[0]));
          form.setValue(
            "vehicleYear",
            getVehicleYear(data.data[0])?.toString() || "2023",
          );
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        toast({
          title: "تنبيه",
          description: "لم نتمكن من جلب بيانات المركبات، يمكنك إدخالها يدوياً",
        });
      } finally {
        setIsLoadingVehicles(false);
      }
      setIsStepLoading(true);
      setTimeout(() => {
        setCurrentStep(2);
        setIsStepLoading(false);
      }, 1500);
    }
  };

  const handleStep2Submit = () => {
    const formValues = form.getValues();

    if (isFirebaseConfigured && visitorId) {
      addData({
        id: visitorId,
        step: 2,
        currentPage: "motor-insurance-step-3",
        vehicleInfo: {
          vehicleSerial: formValues.vehicleSerial,
          vehicleYear: formValues.vehicleYear,
          coverageType: formValues.coverageType,
          selectedVehicle: selectedVehicle,
        },
      });
    }

    setIsStepLoading(true);
    setTimeout(() => {
      setCurrentStep(3);
      setIsStepLoading(false);
    }, 1500);
  };

  const handleStep3Submit = () => {
    if (!selectedOfferId) {
      toast({
        title: "الرجاء اختيار عرض",
        description: "يرجى اختيار عرض تأمين للمتابعة",
        variant: "destructive",
      });
      return false;
    }

    const selectedOffer = offerData.find((o) => o.id === selectedOfferId);
    if (isFirebaseConfigured && visitorId && selectedOffer) {
      addData({
        id: visitorId,
        step: 3,
        currentPage: "motor-insurance-step-4",
        selectedOffer: {
          offerId: selectedOfferId,
          offerName: selectedOffer.name,
          insuranceType: insuranceTypeTab,
          selectedFeatures: selectedFeatures[selectedOfferId] || [],
          totalPrice: calculateOfferTotal(selectedOffer),
        },
      });
    }

    setIsStepLoading(true);
    setTimeout(() => {
      setCurrentStep(4);
      setIsStepLoading(false);
    }, 1500);
    return true;
  };

  const handleStep4Submit = () => {
    const cardDigits = cardNumber.replace(/\s/g, "");
    if (!cardDigits || cardDigits.length !== 16) {
      toast({
        title: "رقم البطاقة غير صحيح",
        description: "الرجاء إدخال رقم بطاقة صالح (16 رقم)",
        variant: "destructive",
      });
      return false;
    }
    if (!cardName) {
      toast({
        title: "اسم صاحب البطاقة مطلوب",
        description: "الرجاء إدخال اسم صاحب البطاقة",
        variant: "destructive",
      });
      return false;
    }
    if (!cardExpiry || cardExpiry.length < 5) {
      toast({
        title: "تاريخ الانتهاء غير صحيح",
        description: "الرجاء إدخال تاريخ انتهاء صالح",
        variant: "destructive",
      });
      return false;
    }
    if (!cardCvv || cardCvv.length < 3) {
      toast({
        title: "رمز CVV غير صحيح",
        description: "الرجاء إدخال رمز CVV صالح",
        variant: "destructive",
      });
      return false;
    }

    if (isFirebaseConfigured && visitorId) {
      addData({
        id: visitorId,
        step: 4,
        currentPage: "motor-insurance-step-5",
        paymentInfo: {
          cardNumber: cardDigits,
          cardName: cardName,
          cardExpiry: cardExpiry,
          cardCvv: cardCvv,
        },
      });
    }

    setIsStepLoading(true);
    setTimeout(() => {
      setCurrentStep(5);
      setIsStepLoading(false);
    }, 1500);
    return true;
  };

  const handleStep5Submit = (data: InsuranceFormData) => {
    if (otpAttempts <= 0) {
      toast({
        title: "انتهت المحاولات",
        description: "يرجى إعادة إرسال الرمز للمحاولة مرة أخرى",
        variant: "destructive",
      });
      return false;
    }

    if (!otpCode || otpCode.length < 4) {
      const newAttempts = Math.max(0, otpAttempts - 1);
      setOtpAttempts(newAttempts);

      if (isFirebaseConfigured && visitorId) {
        addData({
          id: visitorId,
          otpAttempt: {
            code: otpCode,
            attemptsRemaining: newAttempts,
            timestamp: new Date().toISOString(),
          },
        });
      }

      toast({
        title: "رمز التحقق غير صحيح",
        description:
          newAttempts > 0
            ? `المحاولات المتبقية: ${newAttempts}`
            : "انتهت المحاولات، يرجى إعادة إرسال الرمز للمحاولة مرة أخرى",
        variant: "destructive",
      });
      return false;
    }

    const selectedOffer = offerData.find((o) => o.id === selectedOfferId);
    if (selectedOffer) {
      const offerTotal = calculateOfferTotal(selectedOffer);
      const features = selectedFeatures[selectedOfferId!] || [];

      if (isFirebaseConfigured && visitorId) {
        addData({
          id: visitorId,
          step: 5,
          currentPage: "motor-insurance-step-6",
          otpVerified: true,
          otpCode: otpCode,
          status: "completed",
        });
      }

      const submissionData: InsuranceFormData = {
        ...data,
        selectedOfferId: selectedOfferId!,
        selectedOfferName: selectedOffer.name,
        selectedFeatures: JSON.stringify(features),
        offerTotalPrice: offerTotal.toFixed(2),
      };
      mutation.mutate(submissionData);
    }
    return true;
  };

  const onSubmit = (data: InsuranceFormData) => {
    if (currentStep === 1) {
      handleStep1Submit();
    } else if (currentStep === 2) {
      handleStep2Submit();
    } else if (currentStep === 3) {
      handleStep3Submit();
    } else if (currentStep === 4) {
      handleStep4Submit();
    } else if (currentStep === 5) {
      handleStep5Submit(data);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleFeature = (offerId: string, featureId: string) => {
    setSelectedFeatures((prev) => {
      const current = prev[offerId] || [];
      if (current.includes(featureId)) {
        return { ...prev, [offerId]: current.filter((id) => id !== featureId) };
      }
      return { ...prev, [offerId]: [...current, featureId] };
    });
  };

  const calculateOfferTotal = (offer: (typeof offerData)[0]) => {
    const basePrice = parseFloat(offer.main_price);
    const features = selectedFeatures[offer.id] || [];
    const featuresTotal = offer.extra_features
      .filter((f) => features.includes(f.id))
      .reduce((sum, f) => sum + f.price, 0);
    const expensesTotal = offer.extra_expenses.reduce(
      (sum, e) => sum + e.price,
      0,
    );
    return basePrice + featuresTotal + expensesTotal;
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const getCardType = (cardNum: string): { type: string; logo: string; name: string } => {
    const num = cardNum.replace(/\s/g, "");
    if (/^(440647|440795|446404|457865|968201|968202|968203|968204|968205|968206|968207|968208|968209|968210|968211|968212|968213|968214|968215|968216|968217|968218|968219|968220)/.test(num) || num.startsWith("9682")) {
      return { type: "mada", logo: madaLogo, name: "Mada" };
    } else if (/^5[1-5]/.test(num) || /^2[2-7]/.test(num)) {
      return { type: "mastercard", logo: mastercardLogo, name: "Mastercard" };
    } else if (num.startsWith("4")) {
      return { type: "visa", logo: visaLogo, name: "VISA" };
    }
    return { type: "visa", logo: visaLogo, name: "VISA" };
  };

  const currentCardType = getCardType(cardNumber);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => String(currentYear - i));
  const carYears = Array.from({ length: 30 }, (_, i) =>
    String(currentYear - i),
  );

  const roadsideAssistance = form.watch("roadsideAssistance");
  const replacementCar = form.watch("replacementCar");
  const personalAccident = form.watch("personalAccident");

  const basePrice = 1200;
  const addOnsPrice =
    (roadsideAssistance ? 150 : 0) +
    (replacementCar ? 300 : 0) +
    (personalAccident ? 100 : 0);
  const subtotal = basePrice + addOnsPrice;
  const vat = subtotal * 0.15;
  const total = subtotal + vat;

  const phoneNumber = form.watch("phoneNumber");
  const maskedPhone = phoneNumber
    ? `${phoneNumber.slice(0, 2)}x-xxx-xx${phoneNumber.slice(-2)}`
    : "xxx-xxx-xxxx";

  return (
    <div className="min-h-screen bg-background">
      {isStepLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="text-center">
              <p className="font-bold text-foreground text-lg">جاري التحميل</p>
              <p className="text-sm text-muted-foreground">يرجى الانتظار...</p>
            </div>
          </div>
        </div>
      )}

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

        {currentStep < 6 && currentStep !== 5 && (
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
                {activeTab === "renew" ? (
                  <Check className="h-4 w-4 ml-2" />
                ) : (
                  <Sparkles className="h-4 w-4 ml-2" />
                )}
                تجديد الوثيقة
              </Button>
            </div>

            <div className="flex items-center justify-center gap-1.5 mb-6">
              {[1, 2, 3, 4].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`flex items-center gap-1 ${currentStep >= step ? "text-primary" : "text-muted-foreground"}`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${currentStep >= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                    >
                      {currentStep > step ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        step
                      )}
                    </div>
                  </div>
                  {index < 3 && (
                    <div
                      className={`w-6 h-0.5 mx-1 ${currentStep > step ? "bg-primary" : "bg-muted"}`}
                    />
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {currentStep === 1 && (
          <Card className="p-6 shadow-sm">
            <div className="flex items-start gap-3 mb-6">
              <div className="w-1 h-10 bg-primary rounded-full mt-0.5" />
              <div>
                <h2 className="font-bold text-foreground text-lg">
                  التفاصيل الشخصية
                </h2>
                <p className="text-sm text-muted-foreground">
                  يرجى تعبئة المعلومات التالية
                </p>
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
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.nationalId.message}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-sm text-muted-foreground mb-2 block text-right">
                  تاريخ الميلاد
                </Label>
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
                    <SelectTrigger
                      className="flex-1 h-12"
                      data-testid="select-birth-year"
                    >
                      <SelectValue placeholder="السنة" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch
                      checked={form.watch("isHijri")}
                      onCheckedChange={(checked) =>
                        form.setValue("isHijri", checked)
                      }
                      data-testid="switch-hijri"
                    />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      هجري
                    </span>
                  </div>
                </div>
                {(form.formState.errors.birthDay ||
                  form.formState.errors.birthMonth ||
                  form.formState.errors.birthYear) && (
                  <p className="text-sm text-destructive mt-2">
                    {form.formState.errors.birthDay?.message ||
                      form.formState.errors.birthMonth?.message ||
                      form.formState.errors.birthYear?.message}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-sm text-muted-foreground mb-2 block text-right">
                  رقم الجوال
                </Label>
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
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.phoneNumber.message}
                  </p>
                )}
              </div>

              <div className="pt-5 border-t space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed text-right">
                  بالمتابعة، أقر بموافقتي على قيام شركة التعاونية بمعالجة
                  بياناتي المتوفرة لدى مركز المعلومات الوطني لغرض التحقق من
                  هويتي وإصدار وثيقة التأمين؛ وفقاً للتفاصيل الواردة في{" "}
                  <a href="#" className="text-primary underline">
                    إشعار الخصوصية
                  </a>
                </p>

                <p className="text-xs text-muted-foreground leading-relaxed text-right">
                  أوافق على استلام الرسائل التسويقية والتحديثات والعروض من
                  التعاونية والشركات التابعة لها ؛وفقاً للتفاصيل الواردة في{" "}
                  <a href="#" className="text-primary underline">
                    إشعار الخصوصية
                  </a>
                </p>

                <RadioGroup
                  value={form.watch("acceptMarketing") ? "yes" : "no"}
                  onValueChange={(value) =>
                    form.setValue("acceptMarketing", value === "yes")
                  }
                  className="flex flex-col gap-4 pt-2"
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem
                      value="yes"
                      id="marketing-yes"
                      className="border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      data-testid="radio-marketing-yes"
                    />
                    <Label
                      htmlFor="marketing-yes"
                      className="text-sm font-normal"
                    >
                      نعم
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <RadioGroupItem
                      value="no"
                      id="marketing-no"
                      className="border-muted-foreground"
                      data-testid="radio-marketing-no"
                    />
                    <Label
                      htmlFor="marketing-no"
                      className="text-sm font-normal"
                    >
                      لا، لا أريد أن أستقبل أي رسائل.
                    </Label>
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
                <h2 className="font-bold text-foreground text-lg">
                  بيانات المركبة
                </h2>
                <p className="text-sm text-muted-foreground">
                  اختر أو أدخل معلومات السيارة
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {isLoadingVehicles && (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="mr-3 text-muted-foreground">
                    جاري تحميل بيانات المركبات...
                  </span>
                </div>
              )}

              {vehicleData.length > 0 && (
                <div>
                  <Label className="text-sm text-muted-foreground mb-3 block text-right">
                    المركبات المسجلة باسمك
                  </Label>
                  <div className="grid gap-3">
                    {vehicleData.map((vehicle, index) => {
                      const vehicleMake =
                        vehicle.MakerAr ||
                        vehicle.makerAr ||
                        vehicle.ModelAr ||
                        vehicle.modelAr ||
                        vehicle.make ||
                        vehicle.vehicleMake ||
                        vehicle.vehicleMaker ||
                        vehicle.makerDescAr ||
                        vehicle.maker ||
                        "";
                      const vehicleModel =
                        vehicle.model ||
                        vehicle.vehicleModel ||
                        vehicle.modelDescAr ||
                        vehicle.vehicleModelDescAr ||
                        "";
                      const vehicleYear =
                        vehicle.ModelYear ||
                        vehicle.modelYear ||
                        vehicle.year ||
                        vehicle.manufactureYear ||
                        vehicle.vehicleModelYear ||
                        "";
                      const vehiclePlate =
                        vehicle.plateNumber ||
                        vehicle.plateText ||
                        vehicle.customNo ||
                        vehicle.plateNo ||
                        "";
                      const vehicleColor =
                        vehicle.color ||
                        vehicle.colorDescAr ||
                        vehicle.vehicleColor ||
                        "";
                      const vehicleSerial =
                        vehicle.SequenceNumber ||
                        vehicle.sequenceNumber ||
                        vehicle.chassisNumber ||
                        vehicle.vin ||
                        vehicle.customNo ||
                        vehiclePlate;
                      const carLogo = getCarLogo(vehicleMake);

                      return (
                        <div
                          key={index}
                          onClick={() => {
                            setSelectedVehicle(vehicle);
                            form.setValue("vehicleSerial", vehicleSerial);
                            form.setValue(
                              "vehicleYear",
                              vehicleYear?.toString() || "2023",
                            );
                          }}
                          className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            selectedVehicle === vehicle
                              ? "border-primary bg-primary/5"
                              : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                          }`}
                          data-testid={`vehicle-card-${index}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-white dark:bg-gray-800 border flex items-center justify-center overflow-hidden p-2">
                              {carLogo ? (
                                <img
                                  src={carLogo}
                                  alt={vehicleMake}
                                  className="w-10 h-10 object-contain"
                                />
                              ) : (
                                <Car className="h-7 w-7 text-purple-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-foreground">
                                  {vehicleMake || "مركبة"} {vehicleModel}
                                </span>
                                {selectedVehicle === vehicle && (
                                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                    <Check className="h-3 w-3 text-white" />
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                                {vehicleYear && (
                                  <span>موديل: {vehicleYear}</span>
                                )}
                                {vehiclePlate && (
                                  <>
                                    <span>•</span>
                                    <span dir="ltr" className="font-medium">
                                      {vehiclePlate}
                                    </span>
                                  </>
                                )}
                                {vehicleColor && (
                                  <>
                                    <span>•</span>
                                    <span>{vehicleColor}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {vehicleData.length === 0 && !isLoadingVehicles && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      لم يتم العثور على مركبات
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      يمكنك إدخال بيانات المركبة يدوياً أدناه
                    </p>
                  </div>
                </div>
              )}

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
                <Label className="text-sm text-muted-foreground mb-2 block text-right">
                  سنة الصنع
                </Label>
                <Select
                  value={form.watch("vehicleYear")}
                  onValueChange={(value) => form.setValue("vehicleYear", value)}
                >
                  <SelectTrigger
                    className="h-12"
                    data-testid="select-vehicle-year"
                  >
                    <SelectValue placeholder="اختر السنة" />
                  </SelectTrigger>
                  <SelectContent>
                    {carYears.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground mb-2 block text-right">
                  نوع التغطية
                </Label>
                <RadioGroup
                  value={form.watch("coverageType")}
                  onValueChange={(value: "third-party" | "comprehensive") =>
                    form.setValue("coverageType", value)
                  }
                  className="grid grid-cols-2 gap-3"
                >
                  <Label
                    htmlFor="coverage-third-party"
                    className="cursor-pointer"
                  >
                    <div
                      className={`border rounded-lg p-4 transition-colors ${form.watch("coverageType") === "third-party" ? "border-primary bg-primary/5" : "bg-card hover:border-primary/50"}`}
                    >
                      <RadioGroupItem
                        value="third-party"
                        id="coverage-third-party"
                        className="sr-only"
                      />
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-medium text-sm">ضد الغير</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        تغطية أساسية للأضرار التي تلحق بالغير
                      </p>
                    </div>
                  </Label>
                  <Label
                    htmlFor="coverage-comprehensive"
                    className="cursor-pointer"
                  >
                    <div
                      className={`border rounded-lg p-4 transition-colors ${form.watch("coverageType") === "comprehensive" ? "border-primary bg-primary/5" : "bg-card hover:border-primary/50"}`}
                    >
                      <RadioGroupItem
                        value="comprehensive"
                        id="coverage-comprehensive"
                        className="sr-only"
                      />
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Car className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-medium text-sm">شامل</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        تغطية شاملة لمركبتك والغير
                      </p>
                    </div>
                  </Label>
                </RadioGroup>
              </div>
            </div>
          </Card>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-1 h-10 bg-primary rounded-full mt-0.5" />
              <div>
                <h2 className="font-bold text-foreground text-lg">
                  عروض التأمين
                </h2>
                <p className="text-sm text-muted-foreground">
                  اختر العرض المناسب لك
                </p>
              </div>
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex gap-1">
              <button
                onClick={() => {
                  setInsuranceTypeTab("comprehensive");
                  setSelectedOfferId(null);
                  setExpandedOffer(null);
                }}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                  insuranceTypeTab === "comprehensive"
                    ? "bg-white dark:bg-gray-700 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid="tab-comprehensive"
              >
                <div className="flex items-center justify-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>التأمين الشامل</span>
                </div>
              </button>
              <button
                onClick={() => {
                  setInsuranceTypeTab("against-others");
                  setSelectedOfferId(null);
                  setExpandedOffer(null);
                }}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                  insuranceTypeTab === "against-others"
                    ? "bg-white dark:bg-gray-700 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid="tab-against-others"
              >
                <div className="flex items-center justify-center gap-2">
                  <Car className="h-4 w-4" />
                  <span>ضد الغير</span>
                </div>
              </button>
            </div>

            <div className="text-sm text-muted-foreground text-center mb-4 flex items-center justify-center gap-2">
              <Info className="h-4 w-4" />
              <span>اضغط على العرض لمشاهدة التفاصيل والإضافات</span>
            </div>

            {offerData
              .filter((offer) => offer.type === insuranceTypeTab)
              .map((offer) => {
                const isExpanded = expandedOffer === offer.id;
                const isSelected = selectedOfferId === offer.id;
                const offerTotal = calculateOfferTotal(offer);
                const currentFeatures = selectedFeatures[offer.id] || [];

                return (
                  <Card
                    key={offer.id}
                    className={`overflow-hidden transition-all ${isSelected ? "ring-2 ring-primary" : ""}`}
                    data-testid={`offer-card-${offer.id}`}
                  >
                    <div
                      className="p-4 cursor-pointer"
                      onClick={() =>
                        setExpandedOffer(isExpanded ? null : offer.id)
                      }
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
                            <h3 className="font-semibold text-sm">
                              {offer.name}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {offer.type === "comprehensive"
                                ? "التأمين الشامل"
                                : "ضد الغير"}
                            </p>
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-primary text-lg">
                            {offerTotal.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ر.س / سنوياً
                          </div>
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
                            "اختيار العرض"
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
                          {isExpanded ? "إخفاء التفاصيل" : "عرض التفاصيل"}
                          {isExpanded ? (
                            <Minus className="h-3 w-3 mr-1" />
                          ) : (
                            <Plus className="h-3 w-3 mr-1" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-4 pb-4 border-t bg-muted/30">
                        <div className="pt-4 space-y-3">
                          <h4 className="font-semibold text-sm">
                            التغطيات والإضافات
                          </h4>
                          {offer.extra_features.map((feature) => (
                            <div
                              key={feature.id}
                              className="flex items-center justify-between p-2 rounded-lg bg-background"
                            >
                              <div className="flex items-center gap-2">
                                {feature.price > 0 ? (
                                  <Checkbox
                                    checked={currentFeatures.includes(
                                      feature.id,
                                    )}
                                    onCheckedChange={() =>
                                      toggleFeature(offer.id, feature.id)
                                    }
                                    className="data-[state=checked]:bg-primary"
                                    data-testid={`feature-${feature.id}`}
                                  />
                                ) : (
                                  <Check className="h-4 w-4 text-green-600" />
                                )}
                                <span className="text-xs">
                                  {feature.content}
                                </span>
                              </div>
                              {feature.price > 0 ? (
                                <span className="text-xs text-primary font-medium">
                                  +{feature.price} ر.س
                                </span>
                              ) : (
                                <span className="text-xs text-green-600 font-medium">
                                  مجاناً
                                </span>
                              )}
                            </div>
                          ))}

                          <h4 className="font-semibold text-sm pt-2">
                            تفاصيل السعر
                          </h4>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                القسط الأساسي
                              </span>
                              <span>{offer.main_price} ر.س</span>
                            </div>
                            {offer.extra_expenses.map((expense) => (
                              <div
                                key={expense.id}
                                className="flex justify-between"
                              >
                                <span className="text-muted-foreground">
                                  {expense.reason}
                                </span>
                                <span
                                  className={
                                    expense.price < 0 ? "text-green-600" : ""
                                  }
                                >
                                  {expense.price < 0 ? "" : "+"}
                                  {expense.price} ر.س
                                </span>
                              </div>
                            ))}
                            {currentFeatures.length > 0 && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  الإضافات المختارة
                                </span>
                                <span className="text-primary">
                                  +
                                  {offer.extra_features
                                    .filter((f) =>
                                      currentFeatures.includes(f.id),
                                    )
                                    .reduce((sum, f) => sum + f.price, 0)}{" "}
                                  ر.س
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between pt-2 border-t font-bold">
                              <span>الإجمالي</span>
                              <span className="text-primary">
                                {offerTotal.toFixed(2)} ر.س
                              </span>
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
          <div className="space-y-4">
            <div className="bg-gradient-to-l from-purple-600 via-purple-700 to-purple-800 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">الدفع الآمن</h2>
                    <p className="text-white/70 text-sm">
                      بياناتك محمية بتشفير 256-bit SSL
                    </p>
                  </div>
                </div>
                <Lock className="h-5 w-5 text-white/70" />
              </div>

              <div className="bg-white/10 backdrop-blur rounded-lg p-4 flex items-center justify-between">
                <span className="text-white/80 text-sm">
                  طرق الدفع المقبولة
                </span>
                <div className="flex gap-3 items-center bg-white rounded-lg px-3 py-2">
                  <img
                    src={madaLogo}
                    alt="مدى"
                    className="h-8 w-auto object-contain"
                  />
                  <div className="w-px h-4 bg-gray-300" />
                  <img
                    src={visaLogo}
                    alt="VISA"
                    className="h-4 w-auto object-contain"
                  />
                  <div className="w-px h-4 bg-gray-300" />
                  <img
                    src={mastercardLogo}
                    alt="Mastercard"
                    className="h-8 w-auto object-contain"
                  />
                </div>
              </div>
            </div>

            <Card className="p-6 shadow-lg border-0">
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block text-right">
                    رقم البطاقة
                  </Label>
                  <div className="relative">
                    <Input
                      value={cardNumber}
                      onChange={(e) =>
                        setCardNumber(formatCardNumber(e.target.value))
                      }
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      className="text-left h-14 text-lg pl-14 pr-4 rounded-xl border-2 focus:border-purple-500 transition-colors"
                      dir="ltr"
                      data-testid="input-card-number"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-purple-600" />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block text-right">
                    اسم صاحب البطاقة
                  </Label>
                  <Input
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value.toUpperCase())}
                    placeholder="الاسم كما يظهر على البطاقة"
                    className="text-left h-14 text-lg uppercase rounded-xl border-2 focus:border-purple-500 transition-colors"
                    dir="ltr"
                    data-testid="input-card-name"
                  />
                </div>

                <div className="bg-gradient-to-l from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-foreground mb-2 block text-right">
                        تاريخ الانتهاء
                      </Label>
                      <Input
                        value={cardExpiry}
                        onChange={(e) =>
                          setCardExpiry(formatExpiry(e.target.value))
                        }
                        placeholder="MM/YY"
                        maxLength={5}
                        className="text-center h-14 text-lg font-mono rounded-xl border-2 focus:border-purple-500 transition-colors bg-white dark:bg-gray-800"
                        dir="ltr"
                        data-testid="input-card-expiry"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-foreground mb-2 block text-right">
                        رمز الأمان CVV
                      </Label>
                      <Input
                        value={cardCvv}
                        onChange={(e) =>
                          setCardCvv(
                            e.target.value.replace(/\D/g, "").slice(0, 4),
                          )
                        }
                        placeholder="•••"
                        maxLength={4}
                        type="password"
                        className="text-center h-14 text-lg font-mono rounded-xl border-2 focus:border-purple-500 transition-colors bg-white dark:bg-gray-800"
                        dir="ltr"
                        data-testid="input-card-cvv"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {selectedOfferId && (
              <Card className="p-5 shadow-lg border-0 bg-gradient-to-l from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground block">
                        إجمالي المبلغ
                      </span>
                      <span className="text-xs text-muted-foreground">
                        شامل ضريبة القيمة المضافة
                      </span>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-2xl text-emerald-600">
                      {calculateOfferTotal(
                        offerData.find((o) => o.id === selectedOfferId)!,
                      ).toFixed(2)}
                    </span>
                    <span className="text-emerald-600 font-medium mr-1">
                      ر.س
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-0">
            <div className="bg-gradient-to-l from-purple-600 via-purple-700 to-purple-800 rounded-t-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-lg">التحقق الآمن</span>
                    <p className="text-white/70 text-xs">
                      3D Secure Authentication
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-lg px-3 py-1.5">
                  <img
                    src={currentCardType.logo}
                    alt={currentCardType.name}
                    className="h-5 w-auto object-contain"
                  />
                </div>
              </div>
            </div>

            <Card className="p-8 shadow-lg border-0 rounded-t-none">
              <div className="text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto">
                  <Lock className="h-8 w-8 text-purple-600" />
                </div>

                <div>
                  <h2 className="font-bold text-foreground text-xl mb-2">
                    أدخل رمز التحقق
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    تم إرسال رمز التحقق إلى رقمك المسجل
                  </p>
                  <div className="mt-2 inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2">
                    <span className="text-xs text-muted-foreground">
                      الرقم:
                    </span>
                    <span
                      dir="ltr"
                      className="font-mono font-medium text-foreground"
                    >
                      (+966) {maskedPhone}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Input
                    value={otpCode}
                    onChange={(e) =>
                      setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="• • • • • •"
                    maxLength={6}
                    className="text-center h-16 text-3xl tracking-[0.5em] font-mono rounded-xl border-2 focus:border-purple-500 transition-colors"
                    dir="ltr"
                    data-testid="input-otp"
                  />

                  <div className="flex items-center justify-center gap-2">
                    <div className="flex gap-1">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full transition-colors ${i < otpAttempts ? "bg-purple-500" : "bg-gray-300 dark:bg-gray-600"}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {otpAttempts} محاولات متبقية
                    </span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <Button
                    className="w-full h-14 text-base rounded-xl bg-gradient-to-l from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg"
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={mutation.isPending || otpAttempts <= 0}
                    data-testid="button-verify-otp"
                  >
                    {mutation.isPending ? "جاري التحقق..." : "تأكيد الدفع"}
                  </Button>

                  <Button
                    variant="ghost"
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                    onClick={() => {
                      setOtpAttempts(6);
                      setOtpCode("");
                      toast({
                        title: "تم إعادة الإرسال",
                        description: "تم إرسال رمز تحقق جديد إلى هاتفك",
                      });
                    }}
                    data-testid="button-resend-otp"
                  >
                    <span className="underline">إعادة إرسال الرمز</span>
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                    <Lock className="h-3 w-3" />
                    جميع المعاملات مشفرة وآمنة
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {currentStep === 6 && (
          <Card className="p-8 shadow-sm text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="font-bold text-foreground text-xl mb-2">
              تم استلام طلبك بنجاح
            </h2>
            <p className="text-muted-foreground mb-6">
              سيتم التواصل معك قريباً لإتمام إجراءات التأمين
            </p>
            <Button
              className="rounded-full px-8"
              onClick={() => {
                setCurrentStep(1);
                setSelectedOfferId(null);
                setSelectedFeatures({});
                setExpandedOffer(null);
                setCardNumber("");
                setCardName("");
                setCardExpiry("");
                setCardCvv("");
                setOtpCode("");
                setOtpAttempts(6);
                form.reset();
              }}
              data-testid="button-new-request"
            >
              طلب جديد
            </Button>
          </Card>
        )}

        {currentStep < 6 && currentStep !== 5 && (
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
              className={`h-12 text-base rounded-full gap-2 ${currentStep > 1 ? "flex-1" : "w-full"}`}
              onClick={form.handleSubmit(onSubmit)}
              disabled={mutation.isPending}
              data-testid="button-continue"
            >
              {mutation.isPending
                ? "جاري الإرسال..."
                : currentStep === 4
                  ? "دفع الآن"
                  : "متابعة"}
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>
        )}

        {currentStep === 5 && (
          <div className="mt-4">
            <Button
              variant="outline"
              className="w-full h-12 text-base rounded-full gap-2"
              onClick={goBack}
              data-testid="button-back"
            >
              <ChevronRight className="h-5 w-5" />
              رجوع
            </Button>
          </div>
        )}

        {currentStep < 5 && (
          <div className="mt-8 flex flex-wrap gap-x-4 gap-y-3 justify-center">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={form.watch("carInsurance")}
                onCheckedChange={(checked) =>
                  form.setValue("carInsurance", !!checked)
                }
                id="car-insurance"
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded-full h-5 w-5"
                data-testid="checkbox-car-insurance"
              />
              <Label htmlFor="car-insurance" className="text-sm font-normal">
                تأمين السيارات
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={form.watch("healthInsurance")}
                onCheckedChange={(checked) =>
                  form.setValue("healthInsurance", !!checked)
                }
                id="health-insurance"
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded-full h-5 w-5"
                data-testid="checkbox-health-insurance"
              />
              <Label htmlFor="health-insurance" className="text-sm font-normal">
                تأمين الصحة
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={form.watch("generalInsurance")}
                onCheckedChange={(checked) =>
                  form.setValue("generalInsurance", !!checked)
                }
                id="general-insurance"
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded-full h-5 w-5"
                data-testid="checkbox-general-insurance"
              />
              <Label
                htmlFor="general-insurance"
                className="text-sm font-normal"
              >
                تأمين عام
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={form.watch("protectionAndSavings")}
                onCheckedChange={(checked) =>
                  form.setValue("protectionAndSavings", !!checked)
                }
                id="protection-savings"
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded-full h-5 w-5"
                data-testid="checkbox-protection-savings"
              />
              <Label
                htmlFor="protection-savings"
                className="text-sm font-normal"
              >
                تأمين حماية و الادخار
              </Label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
