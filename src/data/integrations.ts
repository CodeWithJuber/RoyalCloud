export const integrations = {
  analytics: {
    provider: "Google Analytics 4",
    measurementId: "G-P5KQ0VPEG6",
    zarazPurpose: "analytics",
    enabled: false
  },
  sessionReplay: {
    provider: "Microsoft Clarity",
    projectId: "3x1x1bd6t7",
    zarazPurpose: "analytics",
    enabled: false
  },
  liveChat: {
    provider: "Tawk.to",
    propertyId: "56acad7a04c24b5047a5a90d",
    widgetId: "default",
    zarazPurpose: "support",
    enabled: false
  },
  push: {
    provider: "OneSignal",
    appId: "a5234b02-c017-42c3-aaed-f181d6b6b971",
    zarazPurpose: "marketing",
    enabled: false,
    autoRegister: false
  },
  newsletter: {
    provider: "Mailchimp",
    action: "https://royalclouds.us11.list-manage.com/subscribe/post?u=78aa2ac66f8706eb3d4e378cc&id=eadb8a29c9",
    enabled: true
  }
} as const;
