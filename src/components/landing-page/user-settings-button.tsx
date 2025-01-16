import styled from "@emotion/styled";
import { FC } from "react";
import { UserSettingsIcon } from "../../assets/icons/icon";
import { useStorage } from "../accessing-local-storage/access-local-storage";
import { isMobile } from "../../bowser";

const UserSettingsWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  padding: 1.6rem 2rem 1rem 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 2rem;
  font-weight: bold;

  &:hover {
    cursor: pointer;
  }

  svg {
    width: 2.5rem;
    flex-shrink: 0;
  }

  &.mobile {
    width: 50vw;
    justify-content: end;
    font-size: 1.5rem;
  }
`;

const Username = styled.div`
  margin-right: 0.5rem;
`;

interface UserSettingsButtonProps {
  onClick?: () => void;
}

export const UserSettingsButton: FC<UserSettingsButtonProps> = (props) => {
  const { onClick } = props;
  const { readFromStorage } = useStorage();
  const username = readFromStorage("username") || "Guest";

  const truncatedUsername =
    isMobile && username.length > 25 ? `${username.slice(0, 25)}...` : username;

  return (
    <UserSettingsWrapper className={isMobile ? "mobile" : ""} onClick={onClick}>
      <Username>{truncatedUsername}</Username>
      <UserSettingsIcon />
    </UserSettingsWrapper>
  );
};
