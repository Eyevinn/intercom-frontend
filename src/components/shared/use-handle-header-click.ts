import { useCallback } from "react";

export const useHandleHeaderClick = (editNameOpen: boolean) => {
  const handleHeaderClick = useCallback(
    (e: React.MouseEvent, open: boolean, setOpen: (open: boolean) => void) => {
      if (
        !editNameOpen &&
        !(e.target as HTMLElement).closest(".name-edit-button")
      ) {
        setOpen(!open);
      }
    },
    [editNameOpen]
  );

  return handleHeaderClick;
};
