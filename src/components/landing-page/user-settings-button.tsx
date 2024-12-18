import styled from "@emotion/styled";
import { FC } from "react";
import { UserSettingsIcon } from "../../assets/icons/icon";

const UserSettingsWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  padding: 1.6rem 2rem 1rem 0;
  font-size: 2rem;
  display: flex;
  align-items: center;
  font-weight: bold;
  &:hover {
    cursor: pointer;
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

  return (
    <UserSettingsWrapper onClick={onClick}>
      <Username>{window.localStorage?.getItem("username") || "Guest"}</Username>
      <UserSettingsIcon />
    </UserSettingsWrapper>
  );
};
