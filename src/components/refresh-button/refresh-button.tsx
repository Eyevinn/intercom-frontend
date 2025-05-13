import styled from "@emotion/styled";
import { RefreshIcon } from "../../assets/icons/icon";
import { StyledRefreshBtn } from "../reload-devices-button.tsx/reload-devices-button";
import { Spinner } from "../loader/loader";

const RefreshButtonWrapper = styled.div`
  display: flex;
  justify-self: flex-end;
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
