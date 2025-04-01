import { useEffect, useState } from "react";

export const useCopyLinks = () => {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    let timeout: number | null = null;
    if (isCopied) {
      timeout = window.setTimeout(() => {
        setIsCopied(false);
      }, 1500);
    }
    return () => {
      if (timeout !== null) {
        window.clearTimeout(timeout);
      }
    };
  }, [isCopied]);

  const handleCopyUrlToClipboard = (input: string | string[]) => {
    if (input !== null) {
      navigator.clipboard
        .writeText(Array.isArray(input) ? input.join("\n") : input)
        .then(() => {
          setIsCopied(true);
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
        });
    }
  };

  return { isCopied, handleCopyUrlToClipboard };
};
