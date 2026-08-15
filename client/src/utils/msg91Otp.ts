const WIDGET_ID = "36686a677545373837323335";
const TOKEN_AUTH = "557959Tk608urZnwea6a7ec1adP1";
const SCRIPT_ID = "msg91-otp-provider";
const SCRIPT_SRC = "https://verify.msg91.com/otp-provider.js";
const WIDGET_READY_POLL_MS = 200;
const WIDGET_READY_TIMEOUT_MS = 8_000;
const OTP_CALLBACK_TIMEOUT_MS = 15_000;

type WidgetResponse = {
  reqId?: string;
  req_id?: string;
  requestId?: string;
  "access-token"?: string;
  accessToken?: string;
  token?: string;
  [key: string]: unknown;
};
type Success = (data: WidgetResponse) => void;
type Failure = (error: unknown) => void;

declare global {
  interface Window {
    initSendOTP?: (configuration: { widgetId: string; tokenAuth: string; identifier: string; exposeMethods: boolean; captchaRenderId: string; success: Success; failure: Failure }) => void;
    sendOtp?: (identifier: string, success: Success, failure: Failure) => void;
    retryOtp?: (channelValue: string | null, success: Success, failure: Failure, reqId?: string) => void;
    verifyOtp?: (otpValue: number, success: Success, failure: Failure, reqId?: string) => void;
  }
}

const requestIdFor = (data: WidgetResponse | undefined) => {
  const requestId = data?.reqId || data?.req_id || data?.requestId;
  return typeof requestId === "string" ? requestId : undefined;
};
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
  window.initSendOTP!({ widgetId: WIDGET_ID, tokenAuth: TOKEN_AUTH, identifier: activeIdentifier, exposeMethods: true, captchaRenderId: "", success: () => undefined, failure: () => undefined });
  await waitFor(() => Boolean(window.sendOtp && window.verifyOtp && window.retryOtp));
};

export const sendMsg91Otp = async (identifier: string) => {
  await initialise(identifier);

  return new Promise<string | undefined>((resolve, reject) => {
    let settled = false;
    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(safetyTimeout);
      callback();
    };
    const safetyTimeout = window.setTimeout(() => {
      finish(() => reject(new Error("Something went wrong, please try again.")));
    }, OTP_CALLBACK_TIMEOUT_MS);
    const fail = (error: unknown) => {
      finish(() => reject(error instanceof Error ? error : new Error("Unable to send OTP. Please try again.")));
    };

    try {
      window.sendOtp!(identifier, (data) => {
        // Temporary diagnostic: retain until MSG91's production callback shape is confirmed.
        console.log("[MSG91] sendOtp success callback data:", data);
        finish(() => resolve(requestIdFor(data)));
      }, fail);
    } catch (error) {
      fail(error);
    }
  });
};

export const retryMsg91Otp = async (requestId?: string) => {
  await initialise();
  return new Promise<string | undefined>((resolve, reject) => window.retryOtp!(null, (data) => resolve(requestIdFor(data) || requestId), reject, requestId));
};

export const verifyMsg91Otp = async (otp: string, requestId?: string) => {
  await initialise();
  return new Promise<string>((resolve, reject) => window.verifyOtp!(Number(otp), (data) => {
    const accessToken = data?.["access-token"] || data?.accessToken || data?.token;
    if (typeof accessToken !== "string" || !accessToken) { reject(new Error("MSG91 did not return a verification token")); return; }
    resolve(accessToken);
  }, reject, requestId));
};
