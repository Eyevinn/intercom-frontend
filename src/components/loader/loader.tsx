import styled from "@emotion/styled";
import { FC, useEffect, useState } from "react";

const Loading = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top: 4px solid #333;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: auto;

  &.create-production {
    position: absolute;
    top: 5px;
    left: 60px;
  }

  &.join-production {
    border: 4px solid rgba(201, 201, 201, 0.1);
    border-top: 4px solid #e2e2e2;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @-webkit-keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @-moz-keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const Dots = styled.span`
  padding-left: 0.2rem;
  font-size: 2rem;
  transform: translateY(-50%);

  &.active {
    color: #cdcdcd;
  }
  &.in-active {
    color: #242424;
  }
`;

type Props = { className: string };

export const Loader: FC<Props> = ({ className }: Props) => {
  return <Loading className={className} />;
};

export const LoaderDots: FC<Props> = ({ className }: Props) => {
  const [dots, setDots] = useState<string>(".");

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setDots((prevDots) => (prevDots.length > 2 ? "." : `${prevDots}.`));
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div>
      <Text className={className}>refreshing</Text>
      <Dots className={className}>{dots}</Dots>
    </div>
  );
};
