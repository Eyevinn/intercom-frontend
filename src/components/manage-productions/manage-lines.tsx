import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";
import styled from "@emotion/styled";
import { useCallback, useEffect, useState, useRef } from "react";
import { ErrorMessage } from "@hookform/error-message";
import { DisplayContainerHeader } from "../landing-page/display-container-header";
import { TProduction } from "../production-line/types";
import {
  FormInput,
  FormLabel,
  PrimaryButton,
  StyledWarningMessage,
} from "../landing-page/form-elements";
import { Spinner } from "../loader/loader";
import { useRemoveProductionLine } from "./use-remove-production-line";
import { useAddProductionLine } from "./use-add-production-line";
import { RemoveLineButton } from "../remove-line-button/remove-line-button";
import { darkText, errorColour } from "../../css-helpers/defaults";
import { RemoveButton } from "../remove-button/remove-button";
import { LineTable } from "./line-table";
import { isMobile } from "../../bowser";
import { Checkbox } from "../checkbox/checkbox";

type TManageLines = {
  production: TProduction;
  setProductionIdToFetch: (A: number) => void;
};

type FormValues = {
  lines: { name: string; programOutputLine: boolean }[];
};

const NewLineWrapper = styled.div`
  width: ${isMobile ? "90%" : ""};
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex: 1;
  gap: 1rem;
`;

const RemoveButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  height: 100%;
  margin-bottom: 1.75rem;
  margin-left: 1rem;
`;

const ButtonWrapper = styled.div`
  margin: 0 1rem 1rem 0;
  :last-of-type {
    margin: 0 0 1rem;
  }
`;

const FetchErrorMessage = styled.div`
  background: ${errorColour};
  color: ${darkText};
  border-radius: 5rem;
  padding: 0.5rem;
  margin: 1rem 0;
  border-radius: 0.5rem;
`;

const FlexContainer = styled.div`
  margin-top: 6rem;
  gap: 2rem;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  max-width: 55rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  flex-direction: row;
  justify-content: space-between;
`;

const CheckboxWrapper = styled.div`
  margin-bottom: 3rem;
  margin-top: 0.5rem;
`;

export const ManageLines = ({
  production,
  setProductionIdToFetch,
}: TManageLines) => {
  const [removeActive, setRemoveActive] = useState<boolean>(false);
  const [updateLines, setUpdateLines] = useState<FormValues | null>(null);
  const [verifyRemove, setVerifyRemove] = useState<null | string>(null);
  const [creatingLineError, setCreatingLineError] = useState<boolean>(false);
  const [removeId, setRemoveId] = useState<null | number>(null);
  const productionIdToNumber = parseInt(production.productionId, 10);

  const inputRef = useRef<HTMLInputElement | null>(null);

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

  const {
    loading: fetchInProgress,
    successfullCreate,
    error: createError,
  } = useAddProductionLine(productionIdToNumber, updateLines);

  const {
    loading: deleteInProgress,
    successfullDelete,
    error: deleteError,
  } = useRemoveProductionLine(productionIdToNumber, removeId);

  useEffect(() => {
    setCreatingLineError(!!createError);
  }, [createError]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setCreatingLineError(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    (value) => {
      if (fetchInProgress) return;
      setUpdateLines(value);
    },
    [fetchInProgress]
  );

  // Reset form values when created production id changes
  useEffect(() => {
    if (successfullCreate || successfullDelete) {
      reset({
        lines: [],
      });
      setRemoveId(null);
      setVerifyRemove(null);
      setUpdateLines(null);
      setRemoveActive(false);
      setUpdateLines(null);
      setProductionIdToFetch(parseInt(production.productionId, 10));
    }
  }, [
    production.productionId,
    reset,
    setProductionIdToFetch,
    successfullCreate,
    successfullDelete,
  ]);

  return (
    <FlexContainer>
      <DisplayContainerHeader>Manage Lines</DisplayContainerHeader>
      <LineTable
        removeActive={removeActive}
        lines={production.lines}
        verifyRemove={verifyRemove}
        removeLine={setVerifyRemove}
        setRemoveId={setRemoveId}
      />
      {fields.map((field, index) => (
        <div key={field.id} ref={inputRef}>
          <FormLabel>
            <NewLineWrapper>
              <InputContainer>
                <FormInput
                  // eslint-disable-next-line
                  {...register(`lines.${index}.name`, {
                    required: "Line name is required",
                    minLength: 1,
                  })}
                  className="additional-line"
                  autoComplete="off"
                  placeholder="Line Name"
                />
                <RemoveButtonContainer>
                  {index === fields.length - 1 && (
                    <RemoveLineButton
                      isCreatingLine
                      removeLine={() => {
                        setCreatingLineError(false);
                        remove(index);
                      }}
                    />
                  )}
                </RemoveButtonContainer>
              </InputContainer>
            </NewLineWrapper>
            <CheckboxWrapper>
              <Controller
                name={`lines.${index}.programOutputLine`}
                control={control}
                render={({ field: controllerField }) => (
                  <Checkbox
                    label="This line will be used for a program output"
                    checked={controllerField.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      controllerField.onChange(e.target.checked)
                    }
                  />
                )}
              />
            </CheckboxWrapper>
          </FormLabel>
          <ErrorMessage
            errors={errors}
            name={`lines.${index}.name`}
            as={StyledWarningMessage}
          />
        </div>
      ))}
      {deleteError && (
        <FetchErrorMessage>
          The production line could not be removed. {deleteError.message}.
        </FetchErrorMessage>
      )}
      {creatingLineError && (
        <FetchErrorMessage>
          The production line could not be created. {createError?.message}.
        </FetchErrorMessage>
      )}
      <ButtonContainer>
        <ButtonWrapper>
          <RemoveButton
            type="button"
            className={deleteInProgress ? "with-loader" : ""}
            onClick={() => {
              setVerifyRemove(null);
              setRemoveActive(!removeActive);
            }}
          >
            Remove Line
            {deleteInProgress && <Spinner className="create-production" />}
          </RemoveButton>
        </ButtonWrapper>
        {fields.length !== 0 && (
          <ButtonWrapper>
            <PrimaryButton
              type="submit"
              className={fetchInProgress ? "with-loader" : ""}
              onClick={handleSubmit(onSubmit)}
            >
              Save Changes
              {fetchInProgress && <Spinner className="create-production" />}
            </PrimaryButton>
          </ButtonWrapper>
        )}
        <ButtonWrapper>
          <PrimaryButton
            type="button"
            disabled={fields.length !== 0}
            onClick={() => {
              setVerifyRemove(null);
              append({ name: "", programOutputLine: false });
            }}
          >
            Create Line
          </PrimaryButton>
        </ButtonWrapper>
      </ButtonContainer>
    </FlexContainer>
  );
};
