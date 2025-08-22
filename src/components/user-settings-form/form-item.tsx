import React from "react";
import { ErrorMessage } from "@hookform/error-message";
import { FieldErrors } from "react-hook-form";
import {
  DecorativeLabel,
  FormLabel,
  StyledWarningMessage,
} from "../form-elements/form-elements";
import { FormValues } from "../create-production/use-create-production";
import { TUserSettings } from "../user-settings/types";

export const FormItem = ({
  label,
  fieldName,
  errors,
  productionLabel,
  errorClassName,
  children,
  className,
}: {
  label?: string;
  fieldName?: string;
  errors?: FieldErrors<TUserSettings | FormValues>;
  productionLabel?: string;
  errorClassName?: string;
  children: React.ReactNode;
  className?: string;
}) => {
  const Wrapper = productionLabel ? React.Fragment : FormLabel;

  return (
    <>
      <Wrapper className={className}>
        {label && <DecorativeLabel>{label}</DecorativeLabel>}
        {children}
      </Wrapper>
      {fieldName && (
        <ErrorMessage
          errors={errors}
          name={fieldName}
          as={<StyledWarningMessage className={errorClassName || ""} />}
        />
      )}
    </>
  );
};
