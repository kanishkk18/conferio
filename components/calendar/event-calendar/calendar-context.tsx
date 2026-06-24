// "use client";

// import React, { createContext, useContext, useState, ReactNode } from "react";
// import { etiquettes } from "@/components/calendar/big-calendar";

// interface CalendarContextType {
//   // Date management
//   currentDate: Date;
//   setCurrentDate: (date: Date) => void;

//   // Etiquette visibility management
//   visibleColors: string[];
//   toggleColorVisibility: (color: string) => void;
//   isColorVisible: (color: string | undefined) => boolean;
// }

// const CalendarContext = createContext<CalendarContextType | undefined>(
//   undefined,
// );

// export function useCalendarContext() {
//   const context = useContext(CalendarContext);
//   if (context === undefined) {
//     throw new Error(
//       "useCalendarContext must be used within a CalendarProvider",
//     );
//   }
//   return context;
// }

// interface CalendarProviderProps {
//   children: ReactNode;
// }

// export function CalendarProvider({ children }: CalendarProviderProps) {
//   const [currentDate, setCurrentDate] = useState<Date>(new Date());

//   // Initialize visibleColors based on the isActive property in etiquettes
//   const [visibleColors, setVisibleColors] = useState<string[]>(() => {
//     // Filter etiquettes to get only those that are active
//     return etiquettes
//       .filter((etiquette) => etiquette.isActive)
//       .map((etiquette) => etiquette.color);
//   });

//   // Toggle visibility of a color
//   const toggleColorVisibility = (color: string) => {
//     setVisibleColors((prev) => {
//       if (prev.includes(color)) {
//         return prev.filter((c) => c !== color);
//       } else {
//         return [...prev, color];
//       }
//     });
//   };

//   // Check if a color is visible
//   const isColorVisible = (color: string | undefined) => {
//     if (!color) return true; // Events without a color are always visible
//     return visibleColors.includes(color);
//   };

//   const value = {
//     currentDate,
//     setCurrentDate,
//     visibleColors,
//     toggleColorVisibility,
//     isColorVisible,
//   };

//   return (
//     <CalendarContext.Provider value={value}>
//       {children}
//     </CalendarContext.Provider>
//   );
// }

// components/calendar/event-calendar/calendar-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { etiquettes } from "@/components/calendar/big-calendar";

// Country codes supported by Nager.Date API (includes India)
export type CountryCode = 
  | "US" | "GB" | "CA" | "AU" | "DE" | "FR" | "ES" | "IT" 
  | "JP" | "IN" | "BR" | "MX" | "NL" | "SE" | "NO" | "DK" 
  | "FI" | "AT" | "CH" | "BE" | "PL" | "RU" | "CN" | "KR" | "SG" | "AE";

interface CalendarContextType {
  // Date management
  currentDate: Date;
  setCurrentDate: (date: Date) => void;

  // Etiquette visibility management
  visibleColors: string[];
  toggleColorVisibility: (color: string) => void;
  isColorVisible: (color: string | undefined) => boolean;

  // Public holidays management
  showHolidays: boolean;
  setShowHolidays: (show: boolean) => void;
  holidayCountry: CountryCode;
  setHolidayCountry: (country: CountryCode) => void;
  holidayYear: number;
  setHolidayYear: (year: number) => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(
  undefined,
);

export function useCalendarContext() {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error(
      "useCalendarContext must be used within a CalendarProvider",
    );
  }
  return context;
}

interface CalendarProviderProps {
  children: ReactNode;
}

export function CalendarProvider({ children }: CalendarProviderProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Initialize visibleColors based on the isActive property in etiquettes
  const [visibleColors, setVisibleColors] = useState<string[]>(() => {
    return etiquettes
      .filter((etiquette) => etiquette.isActive)
      .map((etiquette) => etiquette.color);
  });

  // Public holidays state
  const [showHolidays, setShowHolidays] = useState<boolean>(false);
  const [holidayCountry, setHolidayCountry] = useState<CountryCode>("IN");
  const [holidayYear, setHolidayYear] = useState<number>(new Date().getFullYear());

  // Toggle visibility of a color
  const toggleColorVisibility = useCallback((color: string) => {
    setVisibleColors((prev) => {
      if (prev.includes(color)) {
        return prev.filter((c) => c !== color);
      } else {
        return [...prev, color];
      }
    });
  }, []);

  // Check if a color is visible
  const isColorVisible = useCallback((color: string | undefined) => {
    if (!color) return true;
    return visibleColors.includes(color);
  }, [visibleColors]);

  const value = {
    currentDate,
    setCurrentDate,
    visibleColors,
    toggleColorVisibility,
    isColorVisible,
    showHolidays,
    setShowHolidays,
    holidayCountry,
    setHolidayCountry,
    holidayYear,
    setHolidayYear,
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
}