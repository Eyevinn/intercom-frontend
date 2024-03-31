import styled from "@emotion/styled";
import { FC } from "react";
import { backgroundColour } from "../css-helpers/defaults.ts";

const HeaderWrapper = styled.div`
  width: 100%;
  background: ${backgroundColour};
  padding: 1rem;
  font-size: 2rem;
  font-weight: bold;
  margin: 0 0 1rem 0;
`;

export const Header: FC = () => {
  return <HeaderWrapper>Intercom</HeaderWrapper>;
};
