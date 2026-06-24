"use client";

import {
  useState,
  useRef,
  useEffect,
  useId,
  useMemo,
  useCallback,
  type ChangeEvent,
} from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/lib/utils";

function GooeyFilter({
  filterId,
  blur,
}: {
  filterId: string;
  blur: number;
}) {
  return (
    <svg className="absolute hidden h-0 w-0" aria-hidden>
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  );
}

function SearchIcon({ layoutId }: { layoutId: string }) {
  return (
    <motion.svg
      layoutId={layoutId}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      className="size-4 shrink-0"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </motion.svg>
  );
}

const transition = {
  duration: 0.4,
  type: "spring" as const,
  bounce: 0.25,
};

const iconBubbleVariants = {
  collapsed: { scale: 0, opacity: 0 },
  expanded: { scale: 1, opacity: 1 },
};

export interface GooeyInputClassNames {
  root?: string;
  filterWrap?: string;
  buttonRow?: string;
  trigger?: string;
  input?: string;
  bubble?: string;
  bubbleSurface?: string;
}

export interface GooeyInputProps extends Omit<React.ComponentProps<"input">, "className" | "value" | "defaultValue" | "onChange"> {
  placeholder?: string;
  className?: string;
  classNames?: GooeyInputClassNames;
  /** Collapsed control width in px */
  collapsedWidth?: number;
  /** Expanded control width in px */
  expandedWidth?: number;
  /** Horizontal offset when expanded (px), aligns detached bubble */
  expandedOffset?: number;
  /** Gaussian blur amount for the gooey SVG filter */
  gooeyBlur?: number;
  value?: string;
  defaultValue?: string;
  /** Legacy callback (still works) */
  onValueChange?: (value: string) => void;
  /** Standard input change event */
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

export function SearchInput({
  placeholder = "Type to search...",
  className,
  classNames,
  collapsedWidth = 115,
  expandedWidth = 200,
  expandedOffset = 50,
  gooeyBlur = 5,
  value: valueProp,
  defaultValue = "",
  onValueChange,
  onChange,
  onOpenChange,
  disabled = false,
  type = "search",
  ...inputProps
}: GooeyInputProps) {
  const reactId = useId();
  const safeId = reactId.replace(/:/g, "");
  const filterId = `gooey-filter-${safeId}`;
  const iconLayoutId = `gooey-input-icon-${safeId}`;
  const inputLayoutId = `gooey-input-field-${safeId}`;

  const inputRef = useRef<HTMLInputElement>(null);
  const prevExpandedRef = useRef(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);

  const isControlled = valueProp !== undefined;
  const searchText = isControlled ? valueProp : uncontrolledValue;

  // 🔴 REMOVED: setSearchText callback that called onValueChange from effects
  // const setSearchText = useCallback(
  //   (next: string) => {
  //     if (!isControlled) {
  //       setUncontrolledValue(next);
  //     }
  //     onValueChange?.(next); // ← Called from useEffect — BAD
  //   },
  //   [isControlled, onValueChange],
  // );

  // 🔴 REMOVED: setExpanded wrapper that called onOpenChange from effects
  // const setExpanded = useCallback(
  //   (next: boolean) => {
  //     setIsExpanded(next);
  //     onOpenChange?.(next); // ← Called from useEffect — BAD
  //   },
  //   [onOpenChange],
  // );

  // ✅ CHANGED: useEffect no longer calls any parent callbacks
  // Only manages internal state + DOM focus
  useEffect(() => {
    if (isExpanded) {
      inputRef.current?.focus();
    } else if (prevExpandedRef.current) {
      // 🔴 REMOVED: setSearchText(""); // This called onValueChange('')
      // ✅ Just clear internal uncontrolled state, don't notify parent
      if (!isControlled) {
        setUncontrolledValue("");
      }
    }
    prevExpandedRef.current = isExpanded;
  // 🔴 REMOVED: setSearchText from deps
  // ✅ CHANGED: deps now only [isExpanded, isControlled]
  }, [isExpanded, isControlled]);

  const buttonVariants = useMemo(
    () => ({
      collapsed: { width: collapsedWidth, marginLeft: 0 },
      expanded: { width: expandedWidth, marginLeft: expandedOffset },
    }),
    [collapsedWidth, expandedWidth, expandedOffset],
  );

  // ✅ CHANGED: Direct setIsExpanded, no onOpenChange here
  const handleExpand = useCallback(() => {
    if (!disabled) {
      setIsExpanded(true);
      // ✅ onOpenChange only called on explicit user click
      onOpenChange?.(true);
    }
  }, [disabled, onOpenChange]);

  // ✅ UNCHANGED: onValueChange only called when USER types
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (!isControlled) {
        setUncontrolledValue(newValue);
      }
      onValueChange?.(newValue);
      onChange?.(e);
    },
    [isControlled, onValueChange, onChange],
  );

  // ✅ CHANGED: Direct setIsExpanded, no onOpenChange here
  const handleBlur = useCallback(() => {
    if (!searchText) {
      setIsExpanded(false);
      // ✅ onOpenChange only called on explicit user blur
      onOpenChange?.(false);
    }
  }, [searchText, onOpenChange]);

  const surfaceClass =
    "bg-foreground dark:bg-[#111] rounded-xl text-[#B4B4B4] border dark:border-[#262626] shadow-sm ring-1 ring-border/60";

  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        className,
        classNames?.root,
      )}
    >
      <GooeyFilter filterId={filterId} blur={gooeyBlur} />

      <div
        className={cn(
          "relative flex h-8 items-center justify-center",
          classNames?.filterWrap,
        )}
        style={{ filter: `url(#${filterId})` }}
      >
        <motion.div
          className={cn("flex h-8 items-center justify-center", classNames?.buttonRow)}
          variants={buttonVariants}
          initial="collapsed"
          animate={isExpanded ? "expanded" : "collapsed"}
          transition={transition}
        >
          <button
            type="button"
            disabled={disabled}
            onClick={handleExpand}
            className={cn(
              "flex h-8 w-full cursor-pointer items-center justify-center gap-2 rounded-full px-2 text-sm font-medium outline-none transition-[color,box-shadow] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
              surfaceClass,
              classNames?.trigger,
            )}
          >
            {!isExpanded ? (
              <SearchIcon layoutId={iconLayoutId} />
            ) : null}
            <motion.input
              layoutId={inputLayoutId}
              ref={inputRef}
              type={type}
              enterKeyHint="search"
              autoComplete="off"
              value={searchText}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={disabled || !isExpanded}
              placeholder={placeholder}
              className={cn(
                "h-full min-w-0 flex-1 bg-transparent text-sm text-background dark:text-[#B4B4B4] !outline-none",
                isExpanded
                  ? "placeholder:text-background/50 dark:placeholder:text-[#B4B4B4] !outline-none"
                  : "pointer-events-none placeholder:text-background/80 dark:placeholder:text-[#B4B4B4] !outline-none",
                classNames?.input,
              )}
              {...inputProps}
            />
          </button>
        </motion.div>

        <motion.div
          className={cn(
            "absolute top-1/2 left-0 flex size-8 -translate-y-1/2 items-center justify-center",
            classNames?.bubble,
          )}
          variants={iconBubbleVariants}
          initial="collapsed"
          animate={isExpanded ? "expanded" : "collapsed"}
          transition={transition}
        >
          <div
            className={cn(
              "flex size-8 items-center justify-center rounded-full -mt-8",
              surfaceClass,
              classNames?.bubbleSurface,
            )}
          >
            <SearchIcon layoutId={iconLayoutId} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
