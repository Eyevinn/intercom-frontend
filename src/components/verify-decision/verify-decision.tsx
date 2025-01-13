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
  margin-top: 2rem;
  gap: 2rem;
`;

const CancelButton = styled(ActionButton)`
  background: #d6d3d1;
  color: "#27272a";

  &:disabled {
    background: rgba(214, 211, 209, 0.8);
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
