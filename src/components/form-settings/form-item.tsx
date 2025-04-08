import { ErrorMessage } from "@hookform/error-message";
import { FieldErrors } from "react-hook-form";
import {
  DecorativeLabel,
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
  productionLabel,
  fieldName,
  className,
  productionFetchError,
  errors,
  errorMessage,
  children,
}: {
  label: string;
  productionLabel?: string;
  fieldName: string;
  className: string;
  productionFetchError: Error | null;
  errors: FieldErrors<TUserSettings | FormValues>;
  errorMessage: string;
  children: React.ReactNode;
}) => {
  return (
    <>
      {productionLabel ? (
        <NameWrapper>
          <ProductionName>{label}</ProductionName>
          <ProductionName className={className}>
            {productionLabel}
          </ProductionName>
        </NameWrapper>
      ) : (
        <DecorativeLabel>{label}</DecorativeLabel>
      )}
      {children}
      {productionFetchError && (
        <FetchErrorMessage>{errorMessage}</FetchErrorMessage>
      )}
      <ErrorMessage
        errors={errors}
        name={fieldName}
        as={StyledWarningMessage}
      />
    </>
  );
};
