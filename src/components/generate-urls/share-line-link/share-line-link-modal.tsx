import { useCallback, useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { Modal } from "../../modal/modal";
import { DEFAULT_RESTRICT_SHARE } from "../../../utils/guest-session";

type TShareLineLinkModalProps = {
  urls: string[];
  isCopyProduction?: boolean;
  onRefresh: (options: { guest: boolean }) => void;
  onClose: () => void;
};

const Description = styled.p`
  font-size: 1.4rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 1rem 0;
  line-height: 1.5;
`;

const Note = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.4);
  margin: 0.35rem 0 1.25rem;
  line-height: 1.4;
`;

const CheckboxRow = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1.25rem;
  font-size: 1.4rem;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  user-select: none;

  input[type="checkbox"] {
    width: 1.6rem;
    height: 1.6rem;
    cursor: pointer;
    accent-color: #59cbe8;
    flex-shrink: 0;
  }
`;

const RowsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
`;

const LineRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

const LineName = styled.span`
  font-size: 1.4rem;
  color: rgba(255, 255, 255, 0.85);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  flex: 1;
`;

const RowCopyButton = styled.button<{ copied: boolean; isLoading: boolean }>`
  flex-shrink: 0;
  width: 10rem;
  padding: 0.6rem 1rem;
  font-size: 1.4rem;
  font-weight: 600;
  background: #383838;
  color: ${({ copied, isLoading }) => {
    if (isLoading && !copied) return "rgba(255,255,255,0.3)";
    if (copied) return "#91fa8c";
    return "white";
  }};
  border: 0.1rem solid
    ${({ copied, isLoading }) => {
      if (isLoading && !copied) return "rgba(255,255,255,0.15)";
      if (copied) return "#91fa8c";
      return "#6d6d6d";
    }};
  border-radius: 0.6rem;
  cursor: ${({ isLoading, copied }) =>
    isLoading && !copied ? "not-allowed" : "pointer"};
  opacity: ${({ isLoading, copied }) => (isLoading && !copied ? 0.5 : 1)};
  transition:
    color 0.15s,
    border-color 0.15s;

  &:hover:not(:disabled) {
    border-color: ${({ copied, isLoading }) => {
      if (isLoading && !copied) return "rgba(255,255,255,0.15)";
      if (copied) return "#91fa8c";
      return "#59cbe8";
    }};
    color: ${({ copied, isLoading }) => {
      if (isLoading && !copied) return "rgba(255,255,255,0.3)";
      if (copied) return "#91fa8c";
      return "#59cbe8";
    }};
  }
`;

const FullWidthCopyButton = styled.button<{
  copied: boolean;
  isLoading: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 1rem 1.5rem;
  font-size: 1.4rem;
  font-weight: 600;
  background: #383838;
  color: ${({ copied, isLoading }) => {
    if (isLoading && !copied) return "rgba(255,255,255,0.3)";
    if (copied) return "#91fa8c";
    return "white";
  }};
  border: 0.1rem solid
    ${({ copied, isLoading }) => {
      if (isLoading && !copied) return "rgba(255,255,255,0.15)";
      if (copied) return "#91fa8c";
      return "#6d6d6d";
    }};
  border-radius: 0.6rem;
  cursor: ${({ isLoading, copied }) =>
    isLoading && !copied ? "not-allowed" : "pointer"};
  opacity: ${({ isLoading, copied }) => (isLoading && !copied ? 0.5 : 1)};
  transition:
    color 0.15s,
    border-color 0.15s;
  margin-bottom: 0.5rem;

  &:hover:not(:disabled) {
    border-color: ${({ copied, isLoading }) => {
      if (isLoading && !copied) return "rgba(255,255,255,0.15)";
      if (copied) return "#91fa8c";
      return "#59cbe8";
    }};
    color: ${({ copied, isLoading }) => {
      if (isLoading && !copied) return "rgba(255,255,255,0.3)";
      if (copied) return "#91fa8c";
      return "#59cbe8";
    }};
  }
`;

export const ShareLineLinkModal = ({
  urls,
  isCopyProduction = false,
  onRefresh,
  onClose,
}: TShareLineLinkModalProps) => {
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyTimerRefs = useRef<Record<number, ReturnType<typeof setTimeout>>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedRows, setCopiedRows] = useState<Record<number, boolean>>({});
  const [restrictAccess, setRestrictAccess] = useState(DEFAULT_RESTRICT_SHARE);

  useEffect(() => {
    const copyTimers = copyTimerRefs.current;
    return () => {
      if (refreshTimerRef.current !== null)
        clearTimeout(refreshTimerRef.current);
      Object.values(copyTimers).forEach(clearTimeout);
    };
  }, []);

  const handleRefresh = useCallback(
    (guest: boolean) => {
      setIsLoading(true);
      setCopied(false);
      setCopiedRows({});
      onRefresh({ guest });
      refreshTimerRef.current = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    },
    [onRefresh]
  );

  const handleRestrictToggle = (checked: boolean) => {
    setRestrictAccess(checked);
    handleRefresh(checked);
  };

  const handleCopySingle = () => {
    const url = urls[0];
    if (!url || isLoading) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      handleRefresh(restrictAccess);
    });
  };

  const handleCopyRow = (index: number, urlToCopy: string) => {
    if (isLoading) return;
    navigator.clipboard.writeText(urlToCopy).then(() => {
      setCopiedRows((prev) => ({ ...prev, [index]: true }));
      if (copyTimerRefs.current[index])
        clearTimeout(copyTimerRefs.current[index]);
      copyTimerRefs.current[index] = setTimeout(() => {
        setCopiedRows((prev) => ({ ...prev, [index]: false }));
      }, 2000);
      handleRefresh(restrictAccess);
    });
  };

  const singleLineLabel = () => {
    if (copied) return "✓ Link copied!";
    if (isLoading) return "Generating link…";
    return "Copy link";
  };

  const rowLabel = (index: number) => {
    if (copiedRows[index]) return "✓ Copied!";
    if (isLoading) return "Generating link…";
    return "Copy link";
  };

  return (
    <Modal
      onClose={onClose}
      title={`Share ${isCopyProduction ? "Calls" : "Call URL"}`}
    >
      <Description>
        {isCopyProduction
          ? "Share these links to invite others to each call."
          : "Anyone with this link can join the call."}
      </Description>
      <Note>
        Each link can only be used once. A fresh link is generated automatically
        when copying.
      </Note>
      {isCopyProduction ? (
        <RowsContainer>
          {urls.map((url, index) => {
            const [name, urlPart] = url.split(": ").map((s) => s.trim());
            const urlToCopy = urlPart ?? url;
            return (
              // eslint-disable-next-line react/no-array-index-key
              <LineRow key={index}>
                <LineName title={name}>{name}</LineName>
                <RowCopyButton
                  type="button"
                  copied={!!copiedRows[index]}
                  isLoading={isLoading}
                  disabled={isLoading && !copiedRows[index]}
                  onClick={() => handleCopyRow(index, urlToCopy)}
                >
                  {rowLabel(index)}
                </RowCopyButton>
              </LineRow>
            );
          })}
        </RowsContainer>
      ) : (
        <FullWidthCopyButton
          type="button"
          copied={copied}
          isLoading={isLoading}
          disabled={isLoading && !copied}
          onClick={handleCopySingle}
        >
          {singleLineLabel()}
        </FullWidthCopyButton>
      )}
      <CheckboxRow>
        <input
          type="checkbox"
          checked={restrictAccess}
          onChange={(e) => handleRestrictToggle(e.target.checked)}
        />
        Restrict recipients to {isCopyProduction ? "these calls" : "this call"}
      </CheckboxRow>
      <Note>
        Recipients of a restricted link only see the call they were invited to.
        This tailors their view — it is not an access-control boundary.
      </Note>
    </Modal>
  );
};
