import styled from "@emotion/styled";

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;

  svg {
    fill: grey;
    width: 2.2rem;
    height: 2.2rem;
  }

  &.collapsable-header,
  &.firefox-warning {
    svg {
      fill: #ebca6a;
      width: 2rem;
      height: 2rem;
    }
  }

  &.collapsable-header {
    position: absolute;
    left: 20%;
  }

  &.firefox-warning {
    position: absolute;
    left: 6.5rem;
    bottom: 0.5rem;
    width: auto;
  }
`;

const TooltipWrapper = styled.div`
  position: relative;
  display: inline-block;
  cursor: pointer;

  &:hover span {
    opacity: 1;
    visibility: visible;
  }
`;

const TooltipText = styled.span`
  position: absolute;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: #fff;
  padding: 0.4rem 0.8rem;
  border-radius: 0.4rem;
  font-size: 1.2rem;
  white-space: normal;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  pointer-events: none;
  z-index: 10;

  &.collapsable-header,
  &.firefox-warning {
    bottom: -9rem;
    left: 0;
    background-color: #676767;
    line-height: 1.5;
    white-space: normal;
    transform: none;
    width: 26rem;
  }
`;

export const Tooltip = ({
  children,
  tooltipText,
  type,
}: {
  children: React.ReactNode;
  tooltipText: string | React.ReactNode;
  type?: "collapsable-header" | "firefox-warning";
}) => {
  return (
    <IconWrapper className={type}>
      <TooltipWrapper>
        {children}
        <TooltipText className={type}>{tooltipText}</TooltipText>
      </TooltipWrapper>
    </IconWrapper>
  );
};
