type Gtag = (...args: unknown[]) => void;

type AnalyticsWindow = Window & { gtag?: Gtag };

export type Ga4Item = {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
};

export const trackGa4Event = (eventName: string, params: object) => {
  if (typeof window === "undefined") return false;
  const gtag = (window as AnalyticsWindow).gtag;
  if (!gtag) return false;
  gtag("event", eventName, params);
  return true;
};

export const trackGa4EventOncePerSession = (
  key: string,
  eventName: string,
  params: object,
) => {
  if (typeof window === "undefined") return false;
  try {
    if (window.sessionStorage.getItem(key)) return false;
    if (!trackGa4Event(eventName, params)) return false;
    window.sessionStorage.setItem(key, "1");
    return true;
  } catch {
    return trackGa4Event(eventName, params);
  }
};
