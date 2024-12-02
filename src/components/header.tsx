import styled from "@emotion/styled";
import { FC } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { backgroundColour } from "../css-helpers/defaults.ts";
import { useGlobalState } from "../global-state/context-provider.tsx";
import { HeadsetIcon } from "../assets/icons/icon.tsx";

const HeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  background: ${backgroundColour};
  padding: 1rem;
  font-size: 3rem;
  font-weight: semi-bold;
  margin: 0 0 1rem 0;
  cursor: pointer;
`;

export const Header: FC = () => {
  const [, dispatch] = useGlobalState();
  const navigate = useNavigate();
  const location = useLocation();

  const reset = () => {
    dispatch({
      type: "UPDATE_JOIN_PRODUCTION_OPTIONS",
      payload: null,
    });
  };

  const returnToRoot = () => {
    if (location.pathname.includes("/production")) {
      reset();
      navigate("/");
    } else {
      navigate("/");
    }
  };

  const Logo = styled.svg`
    width: 3rem;
    height: 3rem;
    margin-right: 1rem;
    margin-left: 2rem;
  `;

  return (
    <HeaderWrapper onClick={returnToRoot}>
      <Logo>
        <HeadsetIcon />
      </Logo>
      Intercom
    </HeaderWrapper>
  );
};
