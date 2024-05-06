import styled from "@emotion/styled";
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect } from "react";
import { BackArrow } from "../../assets/icons/icon";
import { PrimaryButton } from "../landing-page/form-elements";
import { useGlobalState } from "../../global-state/context-provider";

const StyledBackBtn = styled(PrimaryButton)`
  padding: 0;
  margin: 0;
  width: 4rem;
`;

export const NavigateToRootButton = ({
  resetOnExit,
}: {
  resetOnExit?: boolean;
}) => {
  const navigate = useNavigate();
  const [, dispatch] = useGlobalState();

  const exit = useCallback(() => {
    navigate("/");
    dispatch({
      type: "UPDATE_JOIN_PRODUCTION_OPTIONS",
      payload: null,
    });
    window.removeEventListener("popstate", exit);
  }, [dispatch, navigate]);

  useEffect(() => {
    window.addEventListener("popstate", exit);
  }, [exit]);

  return (
    <StyledBackBtn
      type="button"
      onClick={() => {
        if (resetOnExit) {
          exit();
        } else {
          navigate("/");
        }
      }}
    >
      <BackArrow />
    </StyledBackBtn>
  );
};
