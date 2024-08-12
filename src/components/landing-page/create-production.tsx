import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { ErrorMessage } from "@hookform/error-message";
import { DisplayContainerHeader } from "./display-container-header.tsx";
import {
  DecorativeLabel,
  FormContainer,
  FormInput,
  FormLabel,
  StyledWarningMessage,
  PrimaryButton,
  SecondaryButton,
} from "./form-elements.tsx";
import { API } from "../../api/api.ts";
import { useGlobalState } from "../../global-state/context-provider.tsx";
import { Spinner } from "../loader/loader.tsx";
import { FlexContainer } from "../generic-components.ts";
import { RemoveLineButton } from "../remove-line-button/remove-line-button.tsx";
import { useFetchProduction } from "./use-fetch-production.ts";
import { darkText, errorColour } from "../../css-helpers/defaults.ts";

type FormValues = {
  productionName: string;
  defaultLine: string;
  lines: { name: string }[];
};

const ListItemWrapper = styled.div`
  position: relative;
`;

const ButtonWrapper = styled.div`
  margin: 0 1rem 1rem 0;
  :last-of-type {
    margin: 0 0 1rem;
  }
`;

const ProductionConfirmation = styled.div`
  background: #91fa8c;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #b2ffa1;
  color: #1a1a1a;
`;

const CopyToClipboardWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const CopyConfirmation = styled.p`
  padding-left: 1rem;
`;

const FetchErrorMessage = styled.div`
  background: ${errorColour};
  color: ${darkText};
  padding: 0.5rem;
  margin: 1rem 0;
`;

export const CreateProduction = () => {
  const [, dispatch] = useGlobalState();
  const [createdProductionId, setCreatedProductionId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const {
    formState: { errors },
    control,
    register,
    handleSubmit,
    reset,
  } = useForm<FormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines",
    rules: {
      minLength: 1,
    },
  });

  const { error: productionFetchError, production } = useFetchProduction(
    createdProductionId ? parseInt(createdProductionId, 10) : null
  );

  const onSubmit: SubmitHandler<FormValues> = (value) => {
    setLoading(true);
    API.createProduction({
      name: value.productionName,
      lines: [{ name: value.defaultLine }, ...value.lines],
    })
      .then((v) => {
        setCreatedProductionId(v.productionId);
        setLoading(false);
      })
      .catch((error) => {
        dispatch({
          type: "ERROR",
          payload: error,
        });
        setLoading(false);
      });
  };

  // Reset form values when created production id changes
  useEffect(() => {
    if (createdProductionId) {
      reset({
        productionName: "",
        defaultLine: "",
        lines: [],
      });
      dispatch({
        type: "PRODUCTION_UPDATED",
      });
    }
  }, [createdProductionId, dispatch, reset]);

  useEffect(() => {
    let timeout: number | null = null;
    if (copiedUrl) {
      timeout = window.setTimeout(() => {
        setCopiedUrl(false);
      }, 1500);
    }
    return () => {
      if (timeout !== null) {
        window.clearTimeout(timeout);
      }
    };
  }, [copiedUrl]);

  const handleCopyProdUrlsToClipboard = (input: string[]) => {
    if (input !== null) {
      navigator.clipboard
        .writeText(input.join("\n"))
        .then(() => {
          setCopiedUrl(true);
          console.log("Text copied to clipboard");
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
        });
    }
  };

  return (
    <FormContainer>
      <DisplayContainerHeader>Create Production</DisplayContainerHeader>
      <FormLabel>
        <DecorativeLabel>Production Name</DecorativeLabel>
        <FormInput
          // eslint-disable-next-line
          {...register(`productionName`, {
            required: "Production name is required",
            minLength: 1,
          })}
          autoComplete="off"
          placeholder="Production Name"
        />
      </FormLabel>
      <ErrorMessage
        errors={errors}
        name="productionName"
        as={StyledWarningMessage}
      />
      <FormLabel>
        <DecorativeLabel>Line</DecorativeLabel>
        <FormInput
          // eslint-disable-next-line
          {...register(`defaultLine`, {
            required: "Line name is required",
            minLength: 1,
          })}
          autoComplete="off"
          placeholder="Line Name"
        />
      </FormLabel>
      <ErrorMessage
        errors={errors}
        name="defaultLine"
        as={StyledWarningMessage}
      />
      {fields.map((field, index) => (
        <div key={field.id}>
          <FormLabel>
            <DecorativeLabel>Line</DecorativeLabel>
            <ListItemWrapper>
              <FormInput
                // eslint-disable-next-line
                {...register(`lines.${index}.name`, {
                  required: "Line name is required",
                  minLength: 1,
                })}
                className={index === fields.length - 1 ? "additional-line" : ""}
                autoComplete="off"
                placeholder="Line Name"
              />
              {index === fields.length - 1 && (
                <RemoveLineButton removeLine={() => remove(index)} />
              )}
            </ListItemWrapper>
          </FormLabel>
          <ErrorMessage
            errors={errors}
            name={`lines.${index}.name`}
            as={StyledWarningMessage}
          />
        </div>
      ))}
      <FlexContainer>
        <ButtonWrapper>
          <SecondaryButton type="button" onClick={() => append({ name: "" })}>
            Add Line
          </SecondaryButton>
        </ButtonWrapper>
        <ButtonWrapper>
          <PrimaryButton
            type="submit"
            className={loading ? "with-loader" : ""}
            onClick={handleSubmit(onSubmit)}
          >
            Create Production
            {loading && <Spinner className="create-production" />}
          </PrimaryButton>
        </ButtonWrapper>
      </FlexContainer>
      {createdProductionId !== null && (
        <>
          <ProductionConfirmation>
            The production ID is: {createdProductionId.toString()}
          </ProductionConfirmation>
          {!productionFetchError && production && (
            <CopyToClipboardWrapper>
              <PrimaryButton
                type="button"
                onClick={() =>
                  handleCopyProdUrlsToClipboard(
                    production.lines.map((item) => {
                      return ` ${item.name}: ${window.location.origin}/production/${production.productionId}/line/${item.id}`;
                    })
                  )
                }
                disabled={copiedUrl}
              >
                Copy Links
              </PrimaryButton>
              {copiedUrl && <CopyConfirmation>Copied</CopyConfirmation>}
            </CopyToClipboardWrapper>
          )}
          {productionFetchError && (
            <FetchErrorMessage>
              The production information could not be fetched, not able to copy
              to clipboard.
            </FetchErrorMessage>
          )}
        </>
      )}
    </FormContainer>
  );
};
