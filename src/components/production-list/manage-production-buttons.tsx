import styled from "@emotion/styled";
import { ErrorMessage } from "@hookform/error-message";
import { FC, useEffect, useRef, useState } from "react";
import { Controller, SubmitHandler, useForm, useWatch } from "react-hook-form";
import { TBasicProductionResponse } from "../../api/api";
import { RemoveIcon } from "../../assets/icons/icon";
import { useGlobalState } from "../../global-state/context-provider";
import { Checkbox } from "../checkbox/checkbox";
import {
  FormInput,
  FormLabel,
  SecondaryButton,
  StyledWarningMessage,
} from "../form-elements/form-elements";
import { Spinner } from "../loader/loader";
import { useAddProductionLine } from "../manage-productions-page/use-add-production-line";
import { useDeleteProduction } from "../manage-productions-page/use-delete-production";
import { ConfirmationModal } from "../verify-decision/confirmation-modal";
import {
  AddLineHeader,
  AddLineSectionForm,
  CheckboxWrapper,
  CreateLineButton,
  RemoveIconWrapper,
  ManageLineInputRow,
} from "./production-list-components";
import {
  TooltipWrapper,
  TooltipContent,
} from "../create-production/create-production-components";
import {
  ButtonsWrapper,
  DeleteButton,
  SpinnerWrapper,
} from "../delete-button/delete-button-components";
import { useHasDuplicateLineName } from "../../hooks/use-has-duplicate-line-name.ts";

const LineConfirmation = styled.div`
  background: #91fa8c;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #b2ffa1;
  color: #1a1a1a;
`;

interface ManageProductionButtonsProps {
  production: TBasicProductionResponse;
  isDeleteProductionDisabled: boolean;
}

type Line = {
  name: string;
  programOutputLine: boolean;
};

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
  const pendingLineNameRef = useRef<string>("");
  const [showLineConfirmation, setShowLineConfirmation] =
    useState<boolean>(false);
  const [lastCreatedLineName, setLastCreatedLineName] = useState<string>("");

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

  const { loading: createLineLoading, success: successfullCreateLine } =
    useAddProductionLine(production.productionId, newLine);

  const {
    loading: deleteProductionLoading,
    success: successfullDeleteProduction,
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
      setLastCreatedLineName(pendingLineNameRef.current);
      setShowLineConfirmation(true);
      setAddLineOpen(false);
      setNewLine(null);
      const id = setTimeout(() => setShowLineConfirmation(false), 4000);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [successfullCreateLine, dispatch]);

  const onSubmit: SubmitHandler<Line> = (values) => {
    if (values) {
      pendingLineNameRef.current = values.name;
      setNewLine(values);
    }
  };

  const lineName = useWatch({ control, name: "name" });

  const hasDuplicateWithExistingLines = useHasDuplicateLineName({
    candidateName: lineName,
    lines: production.lines,
  });

  const handleAddLineOpen = () => {
    setAddLineOpen(!addLineOpen);
    setValue("name", "");
    setValue("programOutputLine", false);
  };

  const validateUniqueLineName = (value: string) => {
    if (!value?.trim()) return true;

    return hasDuplicateWithExistingLines
      ? "Line name must be unique within this production."
      : true;
  };

  return (
    <>
      {addLineOpen && (
        <AddLineSectionForm>
          <AddLineHeader>
            <span>Line Name</span>
            <RemoveIconWrapper onClick={() => setAddLineOpen(false)}>
              <RemoveIcon />
            </RemoveIconWrapper>
          </AddLineHeader>
          <ManageLineInputRow>
            <FormLabel>
              <FormInput
                // eslint-disable-next-line
                {...register("name", {
                  required: "Line name is required",
                  minLength: 1,
                  validate: validateUniqueLineName,
                })}
                placeholder="Line Name"
              />
            </FormLabel>
            <CheckboxWrapper>
              <Controller
                name="programOutputLine"
                control={control}
                render={({ field: controllerField }) => (
                  <Checkbox
                    label="Audio Feed"
                    checked={controllerField.value || false}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      controllerField.onChange(e.target.checked)
                    }
                  />
                )}
              />
              <TooltipWrapper>
                ⓘ
                <TooltipContent className="tooltip-content">
                  In an <strong>Audio Feed</strong> line, listeners are not able
                  to talk. Only the <strong>Audio Feed</strong> will be heard.
                </TooltipContent>
              </TooltipWrapper>
            </CheckboxWrapper>
          </ManageLineInputRow>
          <ErrorMessage errors={errors} name="name" as={StyledWarningMessage} />
          {hasDuplicateWithExistingLines && (
            <StyledWarningMessage style={{ marginBottom: "1rem" }}>
              Line name must be unique within this production.
            </StyledWarningMessage>
          )}
          <CreateLineButton
            onClick={handleSubmit(onSubmit)}
            disabled={hasDuplicateWithExistingLines}
          >
            Create
            {createLineLoading && (
              <SpinnerWrapper>
                <Spinner className="production-list" />
              </SpinnerWrapper>
            )}
          </CreateLineButton>
        </AddLineSectionForm>
      )}
      {showLineConfirmation && lastCreatedLineName && (
        <LineConfirmation>
          The line <strong>{lastCreatedLineName}</strong> has been created.
        </LineConfirmation>
      )}
      <ButtonsWrapper>
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
          Delete Production
          {deleteProductionLoading && (
            <SpinnerWrapper>
              <Spinner className="production-list" />
            </SpinnerWrapper>
          )}
        </DeleteButton>
      </ButtonsWrapper>
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
