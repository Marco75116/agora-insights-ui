"use client";

import * as React from "react";

export const COMPACT_LAYOUT_BREAKPOINT = 1280;

interface LayoutWidthContextValue {
  width: number;
  isCompact: boolean;
}

const LayoutWidthContext = React.createContext<LayoutWidthContextValue>({
  width: 0,
  isCompact: false,
});

interface LayoutWidthProviderProps {
  children: React.ReactNode;
  className?: string;
  breakpoint?: number;
}

export function LayoutWidthProvider({
  children,
  className,
  breakpoint = COMPACT_LAYOUT_BREAKPOINT,
}: LayoutWidthProviderProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(0);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.getBoundingClientRect().width);
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const value = React.useMemo(
    () => ({ width, isCompact: width > 0 && width < breakpoint }),
    [width, breakpoint]
  );

  return (
    <LayoutWidthContext.Provider value={value}>
      <div ref={ref} className={className}>
        {children}
      </div>
    </LayoutWidthContext.Provider>
  );
}

export function useIsCompactLayout(): boolean {
  return React.useContext(LayoutWidthContext).isCompact;
}
