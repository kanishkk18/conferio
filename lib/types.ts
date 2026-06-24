
// export enum IntegrationAppEnum {
//   GOOGLE_MEET_AND_CALENDAR = "GOOGLE_MEET_AND_CALENDAR",
// }

// export const IntegrationLogos: Record<IntegrationAppType, string | string[]> = {
//   GOOGLE_MEET_AND_CALENDAR: ["https://i.pinimg.com/736x/0c/22/94/0c2294408d1d2eca1663cfedf95bee64.jpg","https://i.pinimg.com/736x/a4/06/13/a40613ba33adcce92df4b6b147d2869f.jpg"],
// };
// export type IntegrationAppType =
//   | "GOOGLE_MEET_AND_CALENDAR"

// export type IntegrationTitleType =
//   | "Google Meet & Calendar"

// // Integration Descriptions
// export const IntegrationDescriptions: Record<IntegrationAppType, string> = {
//   GOOGLE_MEET_AND_CALENDAR:
//     "Include Google Meet details in your Meetly events and sync with Google Calendar.",
// };

// export enum VideoConferencingPlatform {
//   GOOGLE_MEET_AND_CALENDAR = IntegrationAppEnum.GOOGLE_MEET_AND_CALENDAR,
  
// }

// export const locationOptions = [
//   {
//     label: "Google Meet",
//     value: VideoConferencingPlatform.GOOGLE_MEET_AND_CALENDAR,
//     logo: IntegrationLogos.GOOGLE_MEET_AND_CALENDAR?.[0],
//     isAvailable: true,
//   },
// ];

// ============================================
// Integration App Types & Enums
// ============================================

export enum IntegrationAppEnum {
  GOOGLE_MEET_AND_CALENDAR = "GOOGLE_MEET_AND_CALENDAR",
  ZOOM_MEETING = "ZOOM_MEETING",
  CONFERIO = "CONFERIO",
}

export type IntegrationAppType =
  | "GOOGLE_MEET_AND_CALENDAR"
  | "ZOOM_MEETING"
  | "CONFERIO";

export type IntegrationTitleType =
  | "Google Meet & Calendar"
  | "Zoom Meeting"
  | "Conferio";

// ============================================
// Integration Logos
// ============================================

export const IntegrationLogos: Record<IntegrationAppType, string | string[]> = {
  GOOGLE_MEET_AND_CALENDAR: [
    "https://i.pinimg.com/736x/0c/22/94/0c2294408d1d2eca1663cfedf95bee64.jpg",
    "https://i.pinimg.com/736x/a4/06/13/a40613ba33adcce92df4b6b147d2869f.jpg",
  ],
  ZOOM_MEETING: "https://i.pinimg.com/736x/7e/69/ec/7e69eca344ca1465da9d7995c0b1a6b9.jpg",
  CONFERIO: "/logo-transparent.png", // Replace with actual Conferio logo URL
};

// ============================================
// Integration Descriptions
// ============================================

export const IntegrationDescriptions: Record<IntegrationAppType, string> = {
  GOOGLE_MEET_AND_CALENDAR:
    "Include Google Meet details in your Meetly events and sync with Google Calendar.",
  ZOOM_MEETING:
    "Automatically generate Zoom meeting links for your events and manage video conferencing seamlessly.",
  CONFERIO:
    "Use Conferio for secure, enterprise-grade video conferencing integrated directly into your workflow.",
};

// ============================================
// Video Conferencing Platform Mapping
// ============================================

export enum VideoConferencingPlatform {
  GOOGLE_MEET_AND_CALENDAR = IntegrationAppEnum.GOOGLE_MEET_AND_CALENDAR,
  ZOOM_MEETING = IntegrationAppEnum.ZOOM_MEETING,
  CONFERIO = IntegrationAppEnum.CONFERIO,
}

// ============================================
// Location Options for Event Creation UI
// ============================================

export const locationOptions = [
  {
    label: "Google Meet",
    value: VideoConferencingPlatform.GOOGLE_MEET_AND_CALENDAR,
    logo: Array.isArray(IntegrationLogos.GOOGLE_MEET_AND_CALENDAR) 
      ? IntegrationLogos.GOOGLE_MEET_AND_CALENDAR[0] 
      : IntegrationLogos.GOOGLE_MEET_AND_CALENDAR,
    isAvailable: true,
  },
  {
    label: "Zoom Meeting",
    value: VideoConferencingPlatform.ZOOM_MEETING,
    logo: IntegrationLogos.ZOOM_MEETING,
    isAvailable: true,
  },
  {
    label: "Conferio",
    value: VideoConferencingPlatform.CONFERIO,
    logo: IntegrationLogos.CONFERIO,
    isAvailable: true,
  },
];
