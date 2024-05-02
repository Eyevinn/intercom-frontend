import styled from "@emotion/styled";
import { FC } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { backgroundColour } from "../css-helpers/defaults.ts";
import { useGlobalState } from "../global-state/context-provider.tsx";

const HeaderWrapper = styled.div`
  width: 100%;
  background: ${backgroundColour};
  padding: 1rem;
  font-size: 2rem;
  font-weight: bold;
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
  return <HeaderWrapper onClick={() => returnToRoot()}>Intercom</HeaderWrapper>;
};
