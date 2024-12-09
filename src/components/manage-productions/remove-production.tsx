import styled from "@emotion/styled";
import { DisplayContainerHeader } from "../landing-page/display-container-header";
import { PrimaryButton } from "../landing-page/form-elements";
import { Spinner } from "../loader/loader";
import { VerifyDecision } from "../verify-decision/verify-decision";

const Container = styled.div`
  max-width: 45rem;
  min-width: 35rem;
  padding: 2rem;
  margin: 0 2rem 2rem 0;
  border-radius: 1rem;
  border: 0.2rem solid #434343;
`;

const VerifyBtnWrapper = styled.div`
  margin: 3rem 0 2rem 2rem;
`;

const ButtonWrapper = styled.div`
  margin: 2rem 0 2rem 0;
`;

type TRemoveProduction = {
  deleteLoader: boolean;
  handleSubmit: () => void;
  verifyRemove: boolean;
  setVerifyRemove: (input: boolean) => void;
  reset: () => void;
};

export const RemoveProduction = ({
  deleteLoader,
  handleSubmit,
  verifyRemove,
  setVerifyRemove,
  reset,
}: TRemoveProduction) => {
  return (
    <Container>
      <DisplayContainerHeader>Remove Production</DisplayContainerHeader>
      {!verifyRemove && (
        <ButtonWrapper>
          <PrimaryButton
            type="button"
            className={deleteLoader ? "submit" : ""}
            onClick={() => {
              setVerifyRemove(true);
            }}
          >
            Remove
            {deleteLoader && <Spinner className="manage-production" />}
          </PrimaryButton>
        </ButtonWrapper>
      )}
      {verifyRemove && (
        <VerifyBtnWrapper>
          <p>Are you sure?</p>
          <VerifyDecision
            loader={deleteLoader}
            confirm={handleSubmit}
            abort={reset}
          />
        </VerifyBtnWrapper>
      )}
    </Container>
  );
};
