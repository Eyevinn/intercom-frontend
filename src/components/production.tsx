import { FC } from "react";
import styled from "@emotion/styled";
import { backgroundColour } from "../css-helpers/defaults.ts";

const UserList = styled.div`
  padding: 1rem;
  background: ${backgroundColour};
`;

export const Production: FC = () => {
  return <UserList>A User</UserList>;
};
