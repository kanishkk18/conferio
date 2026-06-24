// // components/calendar/holiday-toggle.tsx
// "use client";

// import { useState } from "react";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Globe, Loader2 } from "lucide-react";
// import { useCalendarContext } from "./event-calendar/calendar-context";
// import { usePublicHolidays, type CountryCode } from "hooks/usePublicHolidays";
// import { useEffect } from "react";

// const COUNTRIES: { code: CountryCode; name: string }[] = [
//   { code: "IN", name: "🇮🇳 India" },
//   { code: "US", name: "🇺🇸 United States" },
//   { code: "GB", name: "🇬🇧 United Kingdom" },
//   { code: "CA", name: "🇨🇦 Canada" },
//   { code: "AU", name: "🇦🇺 Australia" },
//   { code: "DE", name: "🇩🇪 Germany" },
//   { code: "FR", name: "🇫🇷 France" },
//   { code: "SG", name: "🇸🇬 Singapore" },
//   { code: "AE", name: "🇦🇪 UAE" },
//   { code: "JP", name: "🇯🇵 Japan" },
// ];

// export function HolidayToggle() {
//   const { showHolidays, setShowHolidays, holidayCountry, setHolidayCountry, currentDate } = useCalendarContext();
//   const { fetchHolidays, isLoading } = usePublicHolidays();

//   useEffect(() => {
//     if (showHolidays) {
//       fetchHolidays(currentDate.getFullYear(), holidayCountry as CountryCode);
//     }
//   }, [showHolidays, holidayCountry, currentDate.getFullYear(), fetchHolidays]);

//   const handleToggle = (checked: boolean) => {
//     setShowHolidays(checked);
//   };

//   const handleCountryChange = (value: string) => {
//     setHolidayCountry(value);
//   };

//   return (
//     <div className="flex flex-col gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-background">
//       <div className="flex items-center gap-2">
//         <Globe className="h-4 w-4 text-muted-foreground" />
//         <span className="text-sm font-medium">Public Holidays</span>
//       </div>
      
//       <div className="flex items-center gap-2">
//         <Checkbox
//           id="show-holidays"
//           checked={showHolidays}
//           onCheckedChange={handleToggle}
//         />
//         <Label htmlFor="show-holidays" className="text-sm cursor-pointer">
//           Show public holidays
//         </Label>
//         {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
//       </div>

//       {showHolidays && (
//         <Select value={holidayCountry} onValueChange={handleCountryChange}>
//           <SelectTrigger className="h-8 text-xs">
//             <SelectValue placeholder="Select country" />
//           </SelectTrigger>
//           <SelectContent>
//             {COUNTRIES.map((country) => (
//               <SelectItem key={country.code} value={country.code}>
//                 {country.name}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       )}
//     </div>
//   );

// }

// components/calendar/holiday-toggle.tsx
"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe, Loader2 } from "lucide-react";
import { useCalendarContext } from "./event-calendar/calendar-context";

const COUNTRIES = [
  { code: "IN", name: "🇮🇳 India" },
  { code: "US", name: "🇺🇸 United States" },
  { code: "GB", name: "🇬🇧 United Kingdom" },
  { code: "CA", name: "🇨🇦 Canada" },
  { code: "AU", name: "🇦🇺 Australia" },
  { code: "DE", name: "🇩🇪 Germany" },
  { code: "FR", name: "🇫🇷 France" },
  { code: "SG", name: "🇸🇬 Singapore" },
  { code: "AE", name: "🇦🇪 UAE" },
  { code: "JP", name: "🇯🇵 Japan" },
];

export function HolidayToggle() {
  const { showHolidays, setShowHolidays, holidayCountry, setHolidayCountry } = useCalendarContext();

  return (
    <div className="flex flex-col gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-background">
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Public Holidays</span>
      </div>
      
      <div className="flex items-center gap-2">
        <Checkbox
          id="show-holidays"
          checked={showHolidays}
          onCheckedChange={(checked) => setShowHolidays(checked as boolean)}
        />
        <Label htmlFor="show-holidays" className="text-sm cursor-pointer">
          Show public holidays
        </Label>
      </div>

      {showHolidays && (
        <Select 
          value={holidayCountry} 
          onValueChange={(value) => setHolidayCountry(value as any)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}