import { useEffect, useCallback } from "react";
import {
  FieldValues,
  SubmitHandler,
  UseFormHandleSubmit,
} from "react-hook-form";

type UseSubmitOnEnterWithForm<T extends FieldValues> = {
  handleSubmit: UseFormHandleSubmit<T>;
  submitHandler: SubmitHandler<T>;
};

type UseSubmitOnEnterWithModal = {
  submitHandler: () => void;
};

type CommonProps = {
  needsConfirmation?: boolean;
  shouldSubmitOnEnter?: boolean;
  isBrowserFirefox?: boolean;
  setConfirmModalOpen?: (open: boolean) => void;
};

// Combined props
export type UseSubmitOnEnterProps<T extends FieldValues> =
  | (UseSubmitOnEnterWithForm<T> & CommonProps)
  | (UseSubmitOnEnterWithModal & CommonProps);

export function useSubmitOnEnter<T extends FieldValues>(
  props: UseSubmitOnEnterProps<T>
) {
  const {
    shouldSubmitOnEnter,
    needsConfirmation,
    isBrowserFirefox,
    setConfirmModalOpen,
  } = props;

  const handleSubmit = "handleSubmit" in props ? props.handleSubmit : undefined;
  const submitHandler =
    "handleSubmit" in props ? props.submitHandler : props.submitHandler;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;

      // Stop event propagation to prevent other handlers from firing
      e.stopPropagation();
      e.preventDefault();

      const shouldSubmitNow = !needsConfirmation || isBrowserFirefox;

      if (handleSubmit && shouldSubmitNow) {
        handleSubmit(submitHandler)();
      } else if (handleSubmit) {
        setConfirmModalOpen?.(true);
      } else if (shouldSubmitNow) {
        (submitHandler as () => void)();
      } else {
        setConfirmModalOpen?.(true);
      }
    },
    [
      handleSubmit,
      submitHandler,
      needsConfirmation,
      isBrowserFirefox,
      setConfirmModalOpen,
    ]
  );

  useEffect(() => {
    if (!shouldSubmitOnEnter) return undefined;

    // Use capture phase to handle the event before it bubbles up
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [shouldSubmitOnEnter, handleKeyDown]);
}
