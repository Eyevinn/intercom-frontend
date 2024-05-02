import styled from "@emotion/styled";
import { useLocation, useNavigate } from "react-router-dom";
import { BackArrow } from "../../assets/icons/icon";
import { PrimaryButton } from "../landing-page/form-elements";
import { useGlobalState } from "../../global-state/context-provider";

const StyledBackBtn = styled(PrimaryButton)`
  padding: 0;
  margin: 0;
  width: 4rem;
`;

export const NavigateToRootButton = ({
  children,
  resetOnExit,
  header,
}: {
  children?: React.ReactNode;
  resetOnExit?: boolean;
  header?: boolean;
}) => {
  const [, dispatch] = useGlobalState();
  const navigate = useNavigate();

  const location = useLocation();

  const isHome = location.pathname === "/";

  const reset = () => {
    dispatch({
      type: "UPDATE_JOIN_PRODUCTION_OPTIONS",
      payload: null,
    });
  };

  return (
    <StyledBackBtn
      type="button"
      onClick={() => {
        if (resetOnExit) {
          reset();
        }
        navigate("/");
      }}
      disabled={isHome}
    >
      {!header ? <BackArrow /> : children}
    </StyledBackBtn>
  );
};
