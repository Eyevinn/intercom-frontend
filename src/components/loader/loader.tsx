import styled from "@emotion/styled";
import { FC } from "react";

const Wrapper = styled.div`
  height: auto;
  width: 20vw;
`;

const Loading = styled.div`
  background-color: #bdbdbd;
  aspect-ratio: 1;
  height: 1rem;
  border-radius: 10%;
  opacity: 0;
  animation:
    fadeEffect 4s ease-in-out infinite,
    slider 4s linear 0s infinite reverse;
  -webkit-animation:
    fadeEffect 4s ease-in-out infinite,
    slider 4s linear 0s infinite reverse;
  -moz-animation:
    fadeEffect 4s ease-in-out infinite,
    slider 4s linear 0s infinite reverse;

  @keyframes fadeEffect {
    0% {
      opacity: 0;
    }
    25% {
      opacity: 1;
    }
    95% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  @-webkit-keyframes fadeEffect {
    0% {
      opacity: 0;
    }
    25% {
      opacity: 1;
    }
    95% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  @-moz-keyframes fadeEffect {
    0% {
      opacity: 0;
    }
    25% {
      opacity: 1;
    }
    95% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  @keyframes slider {
    from {
      transform: translateX(15rem) rotate(359deg);
    }
    to {
      transform: translateX(0) rotate(0deg);
    }
  }
  @-webkit-keyframes slider {
    from {
      transform: translateX(15rem) rotate(359deg);
    }
    to {
      transform: translateX(0) rotate(0deg);
    }
  }
  @-moz-keyframes slider {
    from {
      transform: translateX(15rem) rotate(359deg);
    }
    to {
      transform: translateX(0) rotate(0deg);
    }
  }
`;

export const Loader: FC = () => {
  return (
    <Wrapper>
      <Loading />
    </Wrapper>
  );
};
