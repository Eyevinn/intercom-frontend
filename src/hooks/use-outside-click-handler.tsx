import { MutableRefObject, RefObject, useEffect } from "react";

export const useOutsideClickHandler = <T extends HTMLElement>(
  ref: RefObject<T | null> | MutableRefObject<T | null>,
  callback: () => void
) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref, callback]);
};
