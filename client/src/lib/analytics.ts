
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}


export const trackEvent = (category: string, action: string, label?: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
    });
  }
};

export const trackTimeSpent = (section: string) => {
  const startTime = Date.now();
  
  const handleVisibilityChange = () => {
    if (document.hidden) {
      const timeSpent = Date.now() - startTime;
      trackEvent('Section Time', 'time_spent', `${section}: ${timeSpent}ms`);
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    const timeSpent = Date.now() - startTime;
    trackEvent('Section Time', 'time_spent', `${section}: ${timeSpent}ms`);
  };
};
