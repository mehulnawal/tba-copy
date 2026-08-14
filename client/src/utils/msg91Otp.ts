const WIDGET_ID = "36686a677545373837323335";
const TOKEN_AUTH = "557959Tk608urZnweaGa7ec1adP1";
const SCRIPT_ID = "msg91-otp-provider";
const SCRIPT_SRC = "https://verify.msg91.com/otp-provider.js";
const WIDGET_READY_POLL_MS = 200;
const WIDGET_READY_TIMEOUT_MS = 8_000;

type WidgetResponse = { reqId?: string; req_id?: string; requestId?: string; "access-token"?: string; accessToken?: string; token?: string };
type Success = (data: WidgetResponse) => void;
type Failure = (error: unknown) => void;

declare global {
  interface Window {
    initSendOTP?: (configuration: { widgetId: string; tokenAuth: string; identifier: string; exposeMethods: boolean; captchaRenderId: string }) => void;
    sendOtp?: (identifier: string, success: Success, failure: Failure) => void;
    retryOtp?: (channelValue: string | null, success: Success, failure: Failure, reqId?: string) => void;
    verifyOtp?: (otpValue: number, success: Success, failure: Failure, reqId?: string) => void;
  }
}

const requestIdFor = (data: WidgetResponse) => data.reqId || data.req_id || data.requestId;
let activeIdentifier = "";

const waitFor = (isReady: () => boolean) => new Promise<void>((resolve, reject) => {
  const startedAt = Date.now();
  const check = () => {
    if (isReady()) { resolve(); return; }
    if (Date.now() - startedAt >= WIDGET_READY_TIMEOUT_MS) {
      reject(new Error("MSG91 OTP service is unavailable"));
      return;
    }
    window.setTimeout(check, WIDGET_READY_POLL_MS);
  };
  check();
});

const loadScript = async () => {
  let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    const loadResult = new Promise<void>((resolve, reject) => {
      script!.onload = () => resolve();
      script!.onerror = () => reject(new Error("MSG91 OTP service could not load"));
    });
    document.head.appendChild(script);
    await loadResult;
  }
  await waitFor(() => Boolean(window.initSendOTP));
};

const initialise = async (identifier = activeIdentifier) => {
  await loadScript();
  activeIdentifier = identifier || activeIdentifier;
  window.initSendOTP!({ widgetId: WIDGET_ID, tokenAuth: TOKEN_AUTH, identifier: activeIdentifier, exposeMethods: true, captchaRenderId: "" });
  await waitFor(() => Boolean(window.sendOtp && window.verifyOtp && window.retryOtp));
};

export const sendMsg91Otp = async (identifier: string) => {
  await initialise(identifier);
  return new Promise<string | undefined>((resolve, reject) => window.sendOtp!(identifier, (data) => resolve(requestIdFor(data || {})), reject));
};

export const retryMsg91Otp = async (requestId?: string) => {
  await initialise();
  return new Promise<string | undefined>((resolve, reject) => window.retryOtp!(null, (data) => resolve(requestIdFor(data || {}) || requestId), reject, requestId));
};

export const verifyMsg91Otp = async (otp: string, requestId?: string) => {
  await initialise();
  return new Promise<string>((resolve, reject) => window.verifyOtp!(Number(otp), (data) => {
    const accessToken = data?.["access-token"] || data?.accessToken || data?.token;
    if (!accessToken) { reject(new Error("MSG91 did not return a verification token")); return; }
    resolve(accessToken);
  }, reject, requestId));
};