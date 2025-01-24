import styled from "@emotion/styled";
import { ErrorMessage } from "@hookform/error-message";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { FC, useEffect, useState } from "react";
import { RemoveIcon } from "../../assets/icons/icon";
import { ListItemWrapper } from "../create-production/create-production-page";
import {
  FormInput,
  FormLabel,
  SecondaryButton,
  StyledWarningMessage,
} from "../landing-page/form-elements";
import { Spinner } from "../loader/loader";
import {
  AddLineHeader,
  AddLineSectionForm,
  CreateLineButton,
  DeleteButton,
  ManageButtons,
  RemoveIconWrapper,
  SpinnerWrapper,
} from "./production-list-components";
import { useAddProductionLine } from "../manage-productions-page/use-add-production-line";
import { useDeleteProduction } from "../manage-productions-page/use-delete-production";
import { useGlobalState } from "../../global-state/context-provider";
import { ConfirmationModal } from "../verify-decision/confirmation-modal";
import { TBasicProductionResponse } from "../../api/api";
import { Checkbox } from "../checkbox/checkbox";

interface ManageProductionButtonsProps {
  production: TBasicProductionResponse;
  isDeleteProductionDisabled: boolean;
}

type Line = {
  name: string;
  programOutputLine: boolean;
};

const CheckboxWrapper = styled.div`
  margin-bottom: 3rem;
  margin-top: 0.5rem;
`;

export const ManageProductionButtons: FC<ManageProductionButtonsProps> = (
  props
) => {
  const { production, isDeleteProductionDisabled } = props;

  const [, dispatch] = useGlobalState();
  const [removeProductionId, setRemoveProductionId] = useState<string>("");
  const [displayConfirmationModal, setDisplayConfirmationModal] =
    useState<boolean>(false);
  const [addLineOpen, setAddLineOpen] = useState<boolean>(false);
  const [newLine, setNewLine] = useState<Line | null>(null);

  const {
    formState: { errors },
    register,
    handleSubmit,
    control,
    setValue,
  } = useForm<Line>({
    defaultValues: {
      name: "",
      programOutputLine: false,
    },
    resetOptions: {
      keepDirtyValues: true,
      keepErrors: true,
    },
  });

  const {
    loading: createLineLoading,
    successfullCreate: successfullCreateLine,
    error: lineCreateError,
  } = useAddProductionLine(production.productionId, newLine);

  const {
    loading: deleteProductionLoading,
    successfullDelete: successfullDeleteProduction,
    error: productionDeleteError,
  } = useDeleteProduction(removeProductionId);

  useEffect(() => {
    if (successfullDeleteProduction) {
      dispatch({
        type: "PRODUCTION_UPDATED",
      });
    }
    setRemoveProductionId("");
  }, [successfullDeleteProduction, dispatch]);

  useEffect(() => {
    if (successfullCreateLine) {
      dispatch({
        type: "PRODUCTION_UPDATED",
      });
      setAddLineOpen(false);
      setNewLine(null);
    }
  }, [successfullCreateLine, dispatch]);

  const onSubmit: SubmitHandler<Line> = (values) => {
    if (values) {
      setNewLine(values);
    }
  };

  const handleAddLineOpen = () => {
    setAddLineOpen(!addLineOpen);
    setValue("name", "");
    setValue("programOutputLine", false);
  };

  return (
    <>
      {productionDeleteError && (
        <StyledWarningMessage className="error-message production-list">
          {productionDeleteError.message}
        </StyledWarningMessage>
      )}
      <ManageButtons>
        {!addLineOpen && (
          <SecondaryButton
            style={{ marginRight: "1rem" }}
            type="button"
            onClick={handleAddLineOpen}
          >
            Add Line
          </SecondaryButton>
        )}
        <DeleteButton
          type="button"
          disabled={isDeleteProductionDisabled}
          onClick={() => setDisplayConfirmationModal(true)}
        >
          Remove Production
          {deleteProductionLoading && (
            <SpinnerWrapper>
              <Spinner className="production-list" />
            </SpinnerWrapper>
          )}
        </DeleteButton>
      </ManageButtons>
      {addLineOpen && (
        <AddLineSectionForm>
          <FormLabel>
            <AddLineHeader>
              <span>Line Name</span>
              <RemoveIconWrapper onClick={() => setAddLineOpen(false)}>
                <RemoveIcon />
              </RemoveIconWrapper>
            </AddLineHeader>
            <ListItemWrapper>
              <FormInput
                // eslint-disable-next-line
                {...register("name", {
                  required: "Line name is required",
                  minLength: 1,
                })}
              />
            </ListItemWrapper>
            <CheckboxWrapper>
              <Controller
                name="programOutputLine"
                control={control}
                render={({ field: controllerField }) => (
                  <Checkbox
                    label="This line will be used for an audio feed"
                    checked={controllerField.value || false}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      controllerField.onChange(e.target.checked)
                    }
                  />
                )}
              />
            </CheckboxWrapper>
          </FormLabel>
          <ErrorMessage errors={errors} name="name" as={StyledWarningMessage} />
          {lineCreateError && (
            <StyledWarningMessage className="error-message">
              {lineCreateError.message}
            </StyledWarningMessage>
          )}
          <CreateLineButton onClick={handleSubmit(onSubmit)}>
            Create
            {createLineLoading && (
              <SpinnerWrapper>
                <Spinner className="production-list" />
              </SpinnerWrapper>
            )}
          </CreateLineButton>
        </AddLineSectionForm>
      )}
      {displayConfirmationModal && (
        <ConfirmationModal
          title="Delete Production"
          description={`You are about to delete the production: ${production.name}. Are you sure?`}
          onCancel={() => setDisplayConfirmationModal(false)}
          onConfirm={() => setRemoveProductionId(production.productionId)}
        />
      )}
    </>
  );
};
