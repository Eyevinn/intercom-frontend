import styled from "@emotion/styled";
import { useCallback, useEffect, useRef, useState } from "react";
import { GenerateWhipWhepUrlModal } from "../generate-urls/generate-whip-whep-url-modal";
import { ShareLineLinkModal } from "../generate-urls/share-line-link/share-line-link-modal";
import { useShareUrl } from "../../hooks/use-share-url";
import { TBasicProductionResponse } from "../../api/api";
import { TLine } from "./types";

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
  const menuRef = useRef<HTMLDivElement>(null);
  const { shareUrl, url } = useShareUrl();

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
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="More options"
      >
        ⋮
      </KebabButton>
      {isOpen && (
        <DropdownMenu>
          {showHotkeys && onOpenHotkeys && (
            <DropdownItem
              type="button"
              onClick={() => {
                onOpenHotkeys();
                setIsOpen(false);
              }}
            >
              Hotkeys
            </DropdownItem>
          )}
          <DropdownItem type="button" onClick={handleShareClick}>
            Share
          </DropdownItem>
          <DropdownItem
            type="button"
            onClick={() => {
              setActiveModal("whip-whep");
              setIsOpen(false);
            }}
          >
            WebRTC
          </DropdownItem>
        </DropdownMenu>
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
