import styled from "@emotion/styled";
import { FC } from "react";

const Loading = styled.div`
  position: absolute;
  top: 5px;
  left: 60px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top: 4px solid #333;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: auto;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

export const Loader: FC = () => {
  return <Loading />;
};
