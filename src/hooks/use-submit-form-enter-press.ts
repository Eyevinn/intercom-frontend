import { useEffect } from "react";
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
  useEffect(() => {
    if (!props.shouldSubmitOnEnter) return undefined;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;

      e.preventDefault();

      const { needsConfirmation, isBrowserFirefox, setConfirmModalOpen } =
        props;

      const shouldSubmitNow = !needsConfirmation || isBrowserFirefox;

      if ("handleSubmit" in props && shouldSubmitNow) {
        props.handleSubmit(props.submitHandler)();
      } else if ("handleSubmit" in props) {
        setConfirmModalOpen?.(true);
      } else if (shouldSubmitNow) {
        props.submitHandler();
      } else {
        setConfirmModalOpen?.(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [props]);
}
