import styled from "@emotion/styled";
import { RefreshIcon } from "../../assets/icons/icon";
import { StyledRefreshBtn } from "../reload-devices-button.tsx/reload-devices-button";

const RefreshButtonWrapper = styled.div`
  display: flex;
  justify-self: flex-end;
`;

export const RefreshButton = ({
  label,
  onRefresh,
}: {
  label: string;
  onRefresh: () => void;
}) => {
  return (
    <RefreshButtonWrapper>
      <StyledRefreshBtn onClick={onRefresh}>
        <RefreshIcon />
        {label}
      </StyledRefreshBtn>
    </RefreshButtonWrapper>
  );
};
