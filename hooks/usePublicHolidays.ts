// hooks/usePublicHolidays.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { type CalendarEvent, type EventColor } from "@/components/calendar/event-calendar";

// All country codes supported by Nager.Date (including India)
export type CountryCode = 
  | "US" | "GB" | "CA" | "AU" | "DE" | "FR" | "ES" | "IT" 
  | "JP" | "IN" | "BR" | "MX" | "NL" | "SE" | "NO" | "DK" 
  | "FI" | "AT" | "CH" | "BE" | "PL" | "RU" | "CN" | "KR" | "SG" | "AE";

interface NagerHoliday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  global: boolean;
  types: string[];
}

const HOLIDAY_COLOR: EventColor = "rose";

export function usePublicHolidays() {
  const [showHolidays, setShowHolidays] = useState(false);
  const [countryCode, setCountryCode] = useState<CountryCode>("IN"); // Default to India
  const [holidays, setHolidays] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHolidays = useCallback(async (year: number, code: CountryCode) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://date.nager.at/api/v3/PublicHolidays/${year}/${code}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch holidays: ${response.status}`);
      }
      
      const data: NagerHoliday[] = await response.json();
      
      const mappedHolidays: CalendarEvent[] = data.map((holiday) => ({
        id: `holiday-${holiday.date}-${holiday.name}`,
        title: holiday.localName || holiday.name,
        description: `Public Holiday - ${holiday.name}`,
        start: new Date(holiday.date),
        end: new Date(holiday.date),
        color: HOLIDAY_COLOR,
        allDay: true,
        isHoliday: true,
      }));
      
      setHolidays(mappedHolidays);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load holidays");
      setHolidays([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleHolidays = useCallback(() => {
    setShowHolidays((prev) => !prev);
  }, []);

  const changeCountry = useCallback((code: CountryCode) => {
    setCountryCode(code);
  }, []);

  return {
    showHolidays,
    toggleHolidays,
    countryCode,
    changeCountry,
    holidays,
    isLoading,
    error,
    fetchHolidays,
  };
}