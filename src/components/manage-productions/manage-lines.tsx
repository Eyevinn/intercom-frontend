import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import styled from "@emotion/styled";
import { useEffect, useState } from "react";
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

type TManageLines = {
  production: TProduction;
  updateProduction: () => void;
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
  margin-right: 2rem;
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
  top: 1.5rem;
  right: 2.5rem;
  z-index: 100;

  &:hover:active {
    transform: scale(1.1);
  }
`;

const ButtonWrapper = styled.div`
  margin: 0 1rem 1rem 0;
  :last-of-type {
    margin: 0 0 1rem;
  }
`;

export const ManageLines = ({ production, updateProduction }: TManageLines) => {
  const [loading, setLoading] = useState<boolean>(false);
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

  const { loading: fetchInProgress, successfullCreate } = useAddProductionLine(
    productionIdToNumber,
    updateLines
  );

  const { loading: deleteInProgress, successfullDelete } =
    useRemoveProductionLine(productionIdToNumber, removeId);

  const onSubmit: SubmitHandler<FormValues> = (value) => {
    if (fetchInProgress) return;

    setLoading(true);
    setUpdateLines(value);
  };

  // Reset form values when created production id changes
  useEffect(() => {
    if (successfullCreate || successfullDelete) {
      reset({
        lines: [],
      });
      setRemoveId(null);
      setVerifyRemove(null);
      setLoading(false);
      setRemoveActive(false);
      updateProduction();
    }
  }, [reset, successfullCreate, successfullDelete, updateProduction]);

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
              className={loading ? "with-loader" : ""}
              onClick={handleSubmit(onSubmit)}
            >
              Save Changes
              {loading && <Spinner className="create-production" />}
            </PrimaryButton>
          </ButtonWrapper>
        )}
      </FlexContainer>
    </Container>
  );
};