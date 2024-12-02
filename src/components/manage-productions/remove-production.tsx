import styled from "@emotion/styled";
import { ActionButton } from "../landing-page/form-elements";
import { Spinner } from "../loader/loader";
import { RemoveButton } from "../remove-button/remove-button";
import { isMobile } from "../../bowser";

const VerifyBtnWrapper = styled.div`
  margin: 3rem 0 2rem 2rem;
`;

const VerifyButtons = styled.div`
  display: flex;
  margin-top: 2rem;
  gap: 2rem;
`;

const CancelButton = styled(ActionButton)`
  background: #d6d3d1;
  color: "#27272a";
`;

const ButtonWrapper = styled.div`
  margin: ${isMobile ? "0 0 1rem" : "2rem 0 2rem 0"};

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
          <VerifyButtons>
            <CancelButton
              type="button"
              className={deleteLoader ? "submit" : ""}
              onClick={() => {
                reset();
              }}
            >
              Cancel
              {deleteLoader && <Spinner className="manage-production" />}
            </CancelButton>
            <RemoveButton
              type="button"
              className={deleteLoader ? "submit" : ""}
              disabled={deleteLoader}
              onClick={() => {
                handleSubmit();
              }}
            >
              Yes
              {deleteLoader && <Spinner className="manage-production" />}
            </RemoveButton>
          </VerifyButtons>
        </VerifyBtnWrapper>
      )}
    </>
  );
};
