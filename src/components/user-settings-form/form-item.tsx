import React from "react";
import { ErrorMessage } from "@hookform/error-message";
import { FieldErrors } from "react-hook-form";
import {
  DecorativeLabel,
  FormLabel,
  StyledWarningMessage,
} from "../landing-page/form-elements";
import {
  NameWrapper,
  FetchErrorMessage,
} from "../landing-page/join-production-components";
import { ProductionName } from "../production-list/production-list-components";
import { FormValues } from "../create-production/use-create-production";
import { TUserSettings } from "../user-settings/types";

export const FormItem = ({
  label,
  fieldName,
  errors,
  productionLabel,
  productionFetchError,
  errorClassName,
  children,
}: {
  label: string;
  fieldName?: string;
  errors?: FieldErrors<TUserSettings | FormValues>;
  productionLabel?: string;
  productionFetchError?: Error | null;
  errorClassName?: string;
  children: React.ReactNode;
}) => {
  const Wrapper = productionLabel ? React.Fragment : FormLabel;

  return (
    <>
      <Wrapper>
        {productionLabel ? (
          <NameWrapper>
            <ProductionName>{label}</ProductionName>
            <ProductionName className="name">{productionLabel}</ProductionName>
          </NameWrapper>
        ) : (
          <DecorativeLabel>{label}</DecorativeLabel>
        )}
        {children}
      </Wrapper>
      {productionFetchError && (
        <FetchErrorMessage>
          The production ID could not be fetched. {productionFetchError.name}{" "}
          {productionFetchError.message}.
        </FetchErrorMessage>
      )}
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
