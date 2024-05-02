import styled from "@emotion/styled";
import { FC } from "react";
import { backgroundColour } from "../css-helpers/defaults.ts";
import { NavigateToRootButton } from "./navigate-to-root-button/navigate-to-root-button.tsx";

const HeaderWrapper = styled.div`
  width: 100%;
  background: ${backgroundColour};
  padding: 1rem;
  margin: 0 0 1rem 0;
`;

const HeaderText = styled.p`
  font-size: 2rem;
  font-weight: bold;
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background: ${backgroundColour};

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`;

export const Header: FC = () => {
  return (
    <HeaderWrapper>
      <NavigateToRootButton header resetOnExit>
        <HeaderText>Intercom</HeaderText>
      </NavigateToRootButton>
    </HeaderWrapper>
  );
};
