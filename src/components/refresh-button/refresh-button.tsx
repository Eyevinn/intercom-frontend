import styled from "@emotion/styled";
import { RefreshIcon } from "../../assets/icons/icon";
import { PrimaryButton } from "../form-elements/form-elements";
import { Spinner } from "../loader/loader";

const RefreshButtonWrapper = styled.div`
  display: flex;
  justify-self: flex-end;
`;

const StyledRefreshBtn = styled(PrimaryButton)`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg,
  .copy-button {
    width: 2rem;
    height: 2rem;
    fill: #1a1a1a;
  }
`;

export const RefreshButton = ({
  label,
  isLoading,
  onRefresh,
}: {
  label: string;
  isLoading: boolean;
  onRefresh: () => void;
}) => {
  return (
    <RefreshButtonWrapper>
      <StyledRefreshBtn onClick={onRefresh} disabled={isLoading}>
        {isLoading ? (
          <Spinner className="copy-button" />
        ) : (
          <>
            <RefreshIcon />
            {label}
          </>
        )}
      </StyledRefreshBtn>
    </RefreshButtonWrapper>
  );
};
