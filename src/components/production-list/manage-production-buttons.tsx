import { ErrorMessage } from "@hookform/error-message";
import { useForm } from "react-hook-form";
import { FC, useEffect, useState } from "react";
import { RemoveIcon } from "../../assets/icons/icon";
import { ListItemWrapper } from "../create-production/create-production";
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

interface ManageProductionButtonsProps {
  production: TBasicProductionResponse;
  isDeleteProductionDisabled: boolean;
}

export const ManageProductionButtons: FC<ManageProductionButtonsProps> = (
  props
) => {
  const { production, isDeleteProductionDisabled } = props;

  const [, dispatch] = useGlobalState();
  const [removeProductionId, setRemoveProductionId] = useState<string>("");
  const [displayConfirmationModal, setDisplayConfirmationModal] =
    useState<boolean>(false);
  const [lineName, setLineName] = useState<string>("");
  const [addLineOpen, setAddLineOpen] = useState<boolean>(false);

  const {
    formState: { errors },
    register,
    handleSubmit,
    setValue,
  } = useForm<{ lineName: string }>({
    resetOptions: {
      keepDirtyValues: true, // user-interacted input will be retained
      keepErrors: true, // input errors will be retained with value update
    },
  });

  const {
    loading: createLineLoading,
    successfullCreate: successfullCreateLine,
    error: lineCreateError,
  } = useAddProductionLine(production.productionId, lineName);

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
      setValue("lineName", "");
      setLineName("");
      setAddLineOpen(false);
    }
  }, [successfullCreateLine, setValue, dispatch]);

  const onSubmit = (values: { lineName: string }) => {
    if (values.lineName) setLineName(values.lineName);
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
            onClick={() => setAddLineOpen(!addLineOpen)}
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
                {...register(`lineName`, {
                  required: "Line name is required",
                  minLength: 1,
                })}
              />
            </ListItemWrapper>
          </FormLabel>
          <ErrorMessage
            errors={errors}
            name="lineName"
            as={StyledWarningMessage}
          />
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
