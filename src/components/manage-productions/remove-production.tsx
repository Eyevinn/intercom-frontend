import styled from "@emotion/styled";
import { Spinner } from "../loader/loader";
import { VerifyDecision } from "../verify-decision/verify-decision";
import { RemoveButton } from "../remove-button/remove-button";
import { isMobile } from "../../bowser";

const VerifyBtnWrapper = styled.div`
  margin: 3rem 0 2rem 2rem;
`;

const ButtonWrapper = styled.div`
  margin: ${isMobile ? "0 0 1rem" : "2.5rem 0 2rem 0"};

  ${() =>
    isMobile &&
    `
      display: flex;
      justify-content: flex-end;
    `}
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
    <>
      {!verifyRemove && (
        <ButtonWrapper>
          <RemoveButton
            type="button"
            className={deleteLoader ? "submit" : ""}
            onClick={() => {
              setVerifyRemove(true);
            }}
          >
            Remove
            {deleteLoader && <Spinner className="manage-production" />}
          </RemoveButton>
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
    </>
  );
};
