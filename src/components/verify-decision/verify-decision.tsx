import styled from "@emotion/styled";
import { ActionButton } from "../landing-page/form-elements";
import { Spinner } from "../loader/loader";
import { RemoveButton } from "../remove-button/remove-button";

type TVerifyDecision = {
  loader?: boolean;
  confirm: () => void;
  abort: () => void;
};

const VerifyButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
  gap: 1rem;

  button {
    width: 9rem;
    display: flex;
    justify-content: space-around;
  }
`;

const CancelButton = styled(ActionButton)`
  background: #d6d3d1;
  color: "#27272a";

  &:disabled {
    background: #d6d3d1;
  }
`;

export const VerifyDecision = ({ loader, confirm, abort }: TVerifyDecision) => {
  return (
    <VerifyButtons>
      <CancelButton
        type="button"
        className={loader ? "submit" : ""}
        onClick={() => abort()}
      >
        Cancel
        {loader && <Spinner className="manage-production" />}
      </CancelButton>
      <RemoveButton
        type="button"
        className={loader ? "submit" : ""}
        disabled={loader}
        onClick={() => confirm()}
      >
        Yes
        {loader && <Spinner className="manage-production" />}
      </RemoveButton>
    </VerifyButtons>
  );
};
