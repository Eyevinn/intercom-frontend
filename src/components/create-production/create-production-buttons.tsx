import { PrimaryButton, SecondaryButton } from "../form-elements/form-elements";
import { Spinner } from "../loader/loader";
import { ButtonContainer, ButtonWrapper } from "./create-production-components";

interface CreateProductionButtonsProps {
  loading: boolean;
  handleAddLine: () => void;
  handleSubmit: () => void;
  isAddLineDisabled: boolean;
  isCreateDisabled: boolean;
}

export const CreateProductionButtons = ({
  loading,
  handleAddLine,
  handleSubmit,
  isAddLineDisabled,
  isCreateDisabled,
}: CreateProductionButtonsProps) => {
  return (
    <ButtonContainer>
      <ButtonWrapper>
        <SecondaryButton
          type="button"
          onClick={handleAddLine}
          disabled={isAddLineDisabled}
        >
          Add Line
        </SecondaryButton>
      </ButtonWrapper>
      <ButtonWrapper>
        <PrimaryButton
          type="submit"
          className={loading ? "with-loader" : ""}
          onClick={handleSubmit}
          disabled={isCreateDisabled}
        >
          Create Production
          {loading && <Spinner className="create-production" />}
        </PrimaryButton>
      </ButtonWrapper>
    </ButtonContainer>
  );
};
