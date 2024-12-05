import styled from "@emotion/styled";
import { PrimaryButton } from "../landing-page/form-elements";
import { Spinner } from "../loader/loader";

type TVerifyDecision = {
  loader?: boolean;
  confirm: () => void;
  abort: () => void;
};

const VerifyButtons = styled.div`
  display: flex;
  padding: 1rem 0 0 0;
`;

const Button = styled(PrimaryButton)`
  margin: 0 1rem 0 0;
`;

export const VerifyDecision = ({ loader, confirm, abort }: TVerifyDecision) => {
  return (
    <VerifyButtons>
      <Button
        type="button"
        className={loader ? "submit" : ""}
        disabled={loader}
        onClick={() => confirm()}
      >
        Yes
        {loader && <Spinner className="manage-production" />}
      </Button>
      <Button
        type="button"
        className={loader ? "submit" : ""}
        onClick={() => abort()}
      >
        Go back
        {loader && <Spinner className="manage-production" />}
      </Button>
    </VerifyButtons>
  );
};
