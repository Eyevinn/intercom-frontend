import { useEffect, useState } from "react";
import { browserName, browserVersion } from "./bowser";

export const useCheckForSupportedBrowser = () => {
  const [browserSupported, setBrowserSupported] = useState(false);
  const [browserUpdated, setBrowserUpdated] = useState(false);

  const getNumbersBeforeLastDot = () => {
    const lastIndex = browserVersion.lastIndexOf(".");
    const numbersBeforeLastDotStr = browserVersion.substring(0, lastIndex);

    const numbersBeforeLastDotNum = parseFloat(numbersBeforeLastDotStr);

    return numbersBeforeLastDotNum;
  };

  useEffect(() => {
    switch (browserName) {
      case "Chrome":
        setBrowserSupported(true);
        setBrowserUpdated(parseInt(browserVersion, 10) >= 80);
        return;
      case "Microsoft Edge":
        setBrowserSupported(true);
        setBrowserUpdated(parseInt(browserVersion, 10) >= 80);
        return;
      case "Firefox":
        setBrowserSupported(true);
        setBrowserUpdated(parseInt(browserVersion, 10) >= 113);
        return;
      case "Safari":
        setBrowserSupported(true);
        setBrowserUpdated(getNumbersBeforeLastDot() >= 16.4);
        return;
      case "Samsung Internet for Android":
        setBrowserSupported(true);
        setBrowserUpdated(parseInt(browserVersion, 10) >= 21);
        return;
      default:
        setBrowserSupported(false);
    }
  }, []);

  return { browserSupported, browserUpdated };
};
