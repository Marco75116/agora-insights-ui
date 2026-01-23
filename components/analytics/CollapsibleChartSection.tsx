"use client";

import { useRef, useState, useCallback } from "react";
import { ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface CollapsibleChartSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function CollapsibleChartSection({
  title,
  description,
  children,
  defaultOpen = false,
}: CollapsibleChartSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isAnimating, setIsAnimating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const scrollToCenter = useCallback(() => {
    if (!contentRef.current) return;

    const element = contentRef.current;
    const elementRect = element.getBoundingClientRect();
    const elementHeight = elementRect.height;
    const viewportHeight = window.innerHeight;
    const scrollTop = window.scrollY;
    const elementTop = elementRect.top + scrollTop;
    const targetScrollTop = elementTop - (viewportHeight - elementHeight) / 2;

    window.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior: "smooth",
    });
  }, []);

  function handleOpenChange(open: boolean) {
    setIsOpen(open);

    if (open) {
      setIsAnimating(true);
      setTimeout(() => {
        scrollToCenter();
        setTimeout(() => setIsAnimating(false), 500);
      }, 150);
    }
  }

  return (
    <Collapsible open={isOpen} onOpenChange={handleOpenChange}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className={cn(
            "border-border bg-card hover:bg-muted/50 flex w-full items-center justify-between rounded-lg border px-4 py-4 transition-all duration-200",
            isOpen && "bg-muted/30"
          )}
        >
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-base font-semibold">{title}</span>
            {description && <span className="text-muted-foreground text-sm">{description}</span>}
          </div>
          <div
            className={cn(
              "bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300",
              isOpen && "bg-primary/20"
            )}
          >
            <ChevronRight
              className={cn(
                "text-primary h-5 w-5 transition-transform duration-300 ease-out",
                isOpen && "rotate-90"
              )}
            />
          </div>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent
        className={cn(
          "overflow-hidden transition-all duration-300 ease-out",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-2"
        )}
      >
        <div
          ref={contentRef}
          className={cn(
            "pt-4 transition-opacity duration-300",
            isAnimating && "animate-in fade-in-0 duration-500"
          )}
        >
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
