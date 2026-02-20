import styled from "@emotion/styled";
import { useEffect, useRef, useState } from "react";
import { GenerateWhipUrlModal } from "../generate-urls/generate-whip-url/generate-whip-url-modal";
import { GenerateWhepUrlModal } from "../generate-urls/generate-whep-url/generate-whep-url-modal";

const MenuWrapper = styled.div`
  position: relative;
  display: inline-flex;
`;

const KebabButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background: transparent;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.6);
  font-size: 2rem;
  line-height: 1;
  letter-spacing: 0.1rem;
  padding: 0;
  transition: all 0.15s ease;

  &:hover {
    background: rgba(89, 203, 232, 0.1);
    color: #59cbe8;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 10;
  min-width: 14rem;
  background: #32383b;
  border: 0.1rem solid #6d6d6d;
  border-radius: 0.5rem;
  box-shadow: 0 0.4rem 1.2rem rgba(0, 0, 0, 0.3);
  overflow: hidden;
  margin-top: 0.4rem;
`;

const DropdownItem = styled.button`
  display: block;
  width: 100%;
  padding: 1rem 1.5rem;
  background: transparent;
  border: none;
  color: white;
  font-size: 1.4rem;
  text-align: left;
  cursor: pointer;
  transition: background 0.1s ease;

  &:hover {
    background: rgba(89, 203, 232, 0.1);
  }

  &:not(:last-child) {
    border-bottom: 0.1rem solid rgba(109, 109, 109, 0.3);
  }
`;

type KebabMenuProps = {
  productionId: string;
  lineId: string;
};

export const KebabMenu = ({ productionId, lineId }: KebabMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<"whip" | "whep" | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <MenuWrapper ref={menuRef}>
      <KebabButton
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="More options"
      >
        ⋮
      </KebabButton>
      {isOpen && (
        <DropdownMenu>
          <DropdownItem
            type="button"
            onClick={() => {
              setActiveModal("whip");
              setIsOpen(false);
            }}
          >
            WHIP URL
          </DropdownItem>
          <DropdownItem
            type="button"
            onClick={() => {
              setActiveModal("whep");
              setIsOpen(false);
            }}
          >
            WHEP URL
          </DropdownItem>
        </DropdownMenu>
      )}
      {activeModal === "whip" && (
        <GenerateWhipUrlModal
          productionId={productionId}
          lineId={lineId}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === "whep" && (
        <GenerateWhepUrlModal
          productionId={productionId}
          lineId={lineId}
          onClose={() => setActiveModal(null)}
        />
      )}
    </MenuWrapper>
  );
};
