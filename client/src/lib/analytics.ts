
import { getAnalytics, logEvent } from "firebase/analytics";
import app from "./firebase";

const analytics = getAnalytics(app);

export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (process.env.NODE_ENV === "production") {
    logEvent(analytics, eventName, params);
  }
};

export const trackPageView = (pageName: string, timeSpent?: number) => {
  trackEvent("page_view", {
    page_title: pageName,
    time_spent: timeSpent
  });
};

export const trackButtonClick = (buttonName: string, location: string) => {
  trackEvent("button_click", {
    button_name: buttonName,
    click_location: location
  });
};
