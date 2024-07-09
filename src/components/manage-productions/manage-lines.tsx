import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import styled from "@emotion/styled";
import { useCallback, useEffect, useState } from "react";
import { ErrorMessage } from "@hookform/error-message";
import { DisplayContainerHeader } from "../landing-page/display-container-header";
import { TLine, TProduction } from "../production-line/types";
import {
  DecorativeLabel,
  FormInput,
  FormLabel,
  PrimaryButton,
  SecondaryButton,
  StyledWarningMessage,
} from "../landing-page/form-elements";
import { FlexContainer } from "../generic-components";
import { Spinner } from "../loader/loader";
import { useRemoveProductionLine } from "./use-remove-production-line";
import { useAddProductionLine } from "./use-add-production-line";
import { RemoveLineButton } from "../remove-line-button/remove-line-button";
import { darkText, errorColour } from "../../css-helpers/defaults";
import { ConfirmIcon } from "../../assets/icons/icon";

type TManageLines = {
  production: TProduction;
  setProductionIdToFetch: (A: number) => void;
};

type FormValues = {
  lines: { name: string }[];
};

type TLastItem = {
  lastItem: boolean;
};

const Container = styled.div`
  max-width: 45rem;
  min-width: 35rem;
  padding: 2rem;
  margin: 0 2rem 2rem 0;
  border-radius: 1rem;
  border: 0.2rem solid #434343;
`;

const NewLineWrapper = styled.div`
  position: relative;
`;

const ListItemWrapper = styled.div<TLastItem>`
  position: relative;
  padding: 0.5rem 0;

  &:hover {
    background-color: #434343;
    border-radius: 0.2rem;
  }

  ${({ lastItem }) => (lastItem ? `margin-bottom: 2rem;` : "")}
`;

const LineItem = styled(DecorativeLabel)`
  padding: 0 1rem 0 0;
`;

const ConfirmButton = styled.button`
  cursor: pointer;
  position: absolute;
  font-size: 2rem;
  padding: 0.7rem;
  box-shadow: 0.5rem 0.5rem 1rem #212121;
  top: 1.5rem;
  right: 2.5rem;
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    transform: scale(1.1);
  }
`;

const ConfirmIconWrapper = styled.div`
  width: 3rem;
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

export const ManageLines = ({
  production,
  setProductionIdToFetch,
}: TManageLines) => {
  const [removeActive, setRemoveActive] = useState<boolean>(false);
  const [updateLines, setUpdateLines] = useState<FormValues | null>(null);
  const [verifyRemove, setVerifyRemove] = useState<null | string>(null);
  const [removeId, setRemoveId] = useState<null | number>(null);
  const productionIdToNumber = parseInt(production.productionId, 10);

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
      setRemoveActive(false);
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
    <Container>
      <DisplayContainerHeader>Manage Lines</DisplayContainerHeader>
      {production.lines.map((singleLine: TLine, index) => (
        <ListItemWrapper
          key={singleLine.id}
          lastItem={
            production.lines.length === index + 1 && fields.length === 0
          }
        >
          <LineItem>{singleLine.name}</LineItem>
          {removeActive && (
            <RemoveLineButton
              removeLine={() =>
                !verifyRemove
                  ? setVerifyRemove(singleLine.id)
                  : setVerifyRemove(null)
              }
            />
          )}
          {verifyRemove === singleLine.id && (
            <ConfirmButton
              type="button"
              onClick={(event) => {
                event.preventDefault();
                setRemoveId(parseInt(singleLine.id, 10));
              }}
            >
              remove {singleLine.name}
              <ConfirmIconWrapper>
                <ConfirmIcon />
              </ConfirmIconWrapper>
            </ConfirmButton>
          )}
        </ListItemWrapper>
      ))}
      {fields.map((field, index) => (
        <div key={field.id}>
          <FormLabel>
            <NewLineWrapper>
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
              {index === fields.length - 1 && (
                <RemoveLineButton removeLine={() => remove(0)} />
              )}
            </NewLineWrapper>
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
          <SecondaryButton
            type="button"
            disabled={fields.length !== 0}
            onClick={() => {
              setVerifyRemove(null);
              append({ name: "" });
            }}
          >
            Create Line
          </SecondaryButton>
        </ButtonWrapper>
        <ButtonWrapper>
          <SecondaryButton
            type="button"
            className={deleteInProgress ? "with-loader" : ""}
            onClick={() => {
              setVerifyRemove(null);
              setRemoveActive(!removeActive);
            }}
          >
            Remove Line
            {deleteInProgress && <Spinner className="create-production" />}
          </SecondaryButton>
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
      </FlexContainer>
      {deleteError && (
        <FetchErrorMessage>
          The production line could not be removed. {deleteError.message}.
        </FetchErrorMessage>
      )}
      {createError && (
        <FetchErrorMessage>
          The production line could not be created. {createError.message}.
        </FetchErrorMessage>
      )}
    </Container>
  );
};
