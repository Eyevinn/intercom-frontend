import styled from "@emotion/styled";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { GenerateWhipWhepUrlModal } from "../generate-urls/generate-whip-whep-url-modal";
import { ShareLineLinkModal } from "../generate-urls/share-line-link/share-line-link-modal";
import { useShareUrl } from "../../hooks/use-share-url";
import { TBasicProductionResponse } from "../../api/api";
import { TLine } from "./types";

const MenuWrapper = styled.div`
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

const DropdownMenu = styled.div<{ top: number; left: number }>`
  position: fixed;
  top: ${({ top }) => top}px;
  left: ${({ left }) => left}px;
  z-index: 100;
  min-width: 14rem;
  background: #32383b;
  border: 0.1rem solid #6d6d6d;
  border-radius: 0.5rem;
  box-shadow: 0 0.4rem 1.2rem rgba(0, 0, 0, 0.3);
  overflow: hidden;
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
  production: TBasicProductionResponse | null;
  line: TLine | null;
  showHotkeys?: boolean;
  onOpenHotkeys?: () => void;
};

export const KebabMenu = ({
  productionId,
  lineId,
  production,
  line,
  showHotkeys,
  onOpenHotkeys,
}: KebabMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<"whip-whep" | "share" | null>(
    null
  );
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { shareUrl, url } = useShareUrl();

  const openMenu = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 4, left: rect.left });
    }
    setIsOpen(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
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

  const handleShareClick = useCallback(() => {
    if (production && line) {
      shareUrl({
        productionId: production.productionId,
        lineId: line.id,
      });
    }
    setActiveModal("share");
    setIsOpen(false);
  }, [production, line, shareUrl]);

  const handleShareRefresh = useCallback(() => {
    if (production && line) {
      shareUrl({
        productionId: production.productionId,
        lineId: line.id,
      });
    }
  }, [production, line, shareUrl]);

  return (
    <MenuWrapper ref={menuRef}>
      <KebabButton
        ref={buttonRef}
        type="button"
        onClick={() => (isOpen ? setIsOpen(false) : openMenu())}
        aria-label="More options"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        title="More options"
      >
        ⋮
      </KebabButton>
      {isOpen &&
        createPortal(
          <DropdownMenu
            ref={dropdownRef}
            role="menu"
            top={dropdownPos.top}
            left={dropdownPos.left}
          >
            {showHotkeys && onOpenHotkeys && (
              <DropdownItem
                type="button"
                role="menuitem"
                onClick={() => {
                  onOpenHotkeys();
                  setIsOpen(false);
                }}
              >
                Hotkeys
              </DropdownItem>
            )}
            <DropdownItem
              type="button"
              role="menuitem"
              onClick={handleShareClick}
            >
              Share
            </DropdownItem>
            <DropdownItem
              type="button"
              role="menuitem"
              onClick={() => {
                setActiveModal("whip-whep");
                setIsOpen(false);
              }}
            >
              WebRTC
            </DropdownItem>
          </DropdownMenu>,
          document.body
        )}
      {activeModal === "whip-whep" && (
        <GenerateWhipWhepUrlModal
          productionId={productionId}
          lineId={lineId}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === "share" && (
        <ShareLineLinkModal
          urls={[url]}
          onRefresh={handleShareRefresh}
          onClose={() => setActiveModal(null)}
        />
      )}
    </MenuWrapper>
  );
};
