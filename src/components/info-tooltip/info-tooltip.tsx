import styled from "@emotion/styled";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";

const Trigger = styled.span`
  display: inline-flex;
  align-items: center;
  cursor: help;
  font-size: 2rem;
  line-height: 1;
  vertical-align: middle;
  position: relative;
  top: 0;
`;

const Popup = styled.span<{ x: number; y: number }>`
  position: fixed;
  bottom: ${({ y }) => y}px;
  left: ${({ x }) => x}px;
  transform: translateX(-50%);
  background: #32383b;
  color: white;
  padding: 0.5rem 1rem;
  padding-bottom: 0.9rem;
  border-radius: 0.4rem;
  font-size: 1.2rem;
  white-space: normal;
  width: min(30rem, 90vw);
  text-align: center;
  border: 0.1rem solid #6d6d6d;
  z-index: 1000;

  a {
    color: #59cbe8;
    text-decoration: underline;
  }
`;

export const InfoTooltip = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const hideTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = () => {
    clearTimeout(hideTimeout.current);
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const popupHalfWidth = Math.min(300, window.innerWidth * 0.9) / 2;
    const margin = 8;
    const idealX = rect.left + rect.width / 2;
    const clampedX = Math.max(
      popupHalfWidth + margin,
      Math.min(window.innerWidth - popupHalfWidth - margin, idealX)
    );
    setPos({
      x: clampedX,
      y: viewportHeight - rect.top + 4,
    });
    setVisible(true);
  };

  const hideDelayed = () => {
    hideTimeout.current = setTimeout(() => setVisible(false), 150);
  };

  const keepVisible = () => {
    clearTimeout(hideTimeout.current);
  };

  return (
    <Trigger
      ref={ref}
      onMouseEnter={show}
      onMouseLeave={hideDelayed}
      onFocus={show}
      onBlur={hideDelayed}
      tabIndex={0}
    >
      &#9432;
      {visible &&
        createPortal(
          <Popup
            x={pos.x}
            y={pos.y}
            onMouseEnter={keepVisible}
            onMouseLeave={hideDelayed}
          >
            {children}
          </Popup>,
          document.body
        )}
    </Trigger>
  );
};
