import { PrimaryButton, SecondaryButton } from "../landing-page/form-elements";
import { Spinner } from "../loader/loader";
import { ButtonContainer, ButtonWrapper } from "./create-production-components";

interface CreateProductionButtonsProps {
  loading: boolean;
  handleAddLine: () => void;
  handleSubmit: () => void;
}

export const CreateProductionButtons = ({
  loading,
  handleAddLine,
  handleSubmit,
}: CreateProductionButtonsProps) => {
  return (
    <ButtonContainer>
      <ButtonWrapper>
        <SecondaryButton type="button" onClick={handleAddLine}>
          Add Line
        </SecondaryButton>
      </ButtonWrapper>
      <ButtonWrapper>
        <PrimaryButton
          type="submit"
          className={loading ? "with-loader" : ""}
          onClick={handleSubmit}
        >
          Create Production
          {loading && <Spinner className="create-production" />}
        </PrimaryButton>
      </ButtonWrapper>
    </ButtonContainer>
  );
};
