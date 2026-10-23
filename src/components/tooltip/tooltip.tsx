import styled from "@emotion/styled";
import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const IconWrapper = styled.div`
  display: flex;
  align-items: center;

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
    margin-left: 0.5rem;
  }
`;

const TooltipWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const Popup = styled.span<{ x: number; y: number; placeAbove: boolean }>`
  position: fixed;
  left: ${({ x }) => x}px;
  ${({ y, placeAbove }) => (placeAbove ? `bottom: ${y}px;` : `top: ${y}px;`)}
  transform: translateX(-50%);
  background-color: #333;
  color: #fff;
  padding: 0.4rem 0.8rem;
  border-radius: 0.4rem;
  font-size: 1.2rem;
  white-space: normal;
  width: max-content;
  max-width: 22rem;
  text-align: center;
  pointer-events: none;
  z-index: 1000;
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
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0, placeAbove: true });

  useLayoutEffect(() => {
    if (!visible || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const margin = 8;
    const idealX = rect.left + rect.width / 2;
    const placeAbove = rect.top > 60;
    setPos({
      x: idealX,
      y: placeAbove
        ? window.innerHeight - rect.top + margin
        : rect.bottom + margin,
      placeAbove,
    });
  }, [visible]);

  return (
    <IconWrapper className={type}>
      <TooltipWrapper
        ref={ref}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        {children}
        {visible &&
          createPortal(
            <Popup x={pos.x} y={pos.y} placeAbove={pos.placeAbove}>
              {tooltipText}
            </Popup>,
            document.body
          )}
      </TooltipWrapper>
    </IconWrapper>
  );
};
