import { useEffect, useState, useRef } from "react";

export const useCopyLinks = () => {
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopyUrlToClipboard = (input: string | string[]) => {
    if (input !== null) {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }

      navigator.clipboard
        .writeText(Array.isArray(input) ? input.join("\n") : input)
        .then(() => {
          setIsCopied(true);

          timeoutRef.current = window.setTimeout(() => {
            setIsCopied(false);
            timeoutRef.current = null;
          }, 1500);
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
        });
    }
  };

  return { isCopied, handleCopyUrlToClipboard };
};
