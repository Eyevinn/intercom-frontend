import { useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { API } from "../../api/api";
import { Modal } from "../modal/modal";

const Description = styled.p`
  font-size: 1.4rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
`;

const CopyButton = styled.button<{
  copied: boolean;
  isError: boolean;
  isLoading: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem 1.5rem;
  font-size: 1.6rem;
  font-weight: 600;
  background: #383838;
  color: ${({ copied, isError, isLoading }) => {
    if ((isLoading && !copied) || isError) return "rgba(255,255,255,0.3)";
    if (copied) return "#91fa8c";
    return "white";
  }};
  border: 0.1rem solid
    ${({ copied, isError, isLoading }) => {
      if ((isLoading && !copied) || isError) return "rgba(255,255,255,0.15)";
      if (copied) return "#91fa8c";
      return "#6d6d6d";
    }};
  border-radius: 0.6rem;
  cursor: ${({ isLoading, isError, copied }) =>
    (isLoading && !copied) || isError ? "not-allowed" : "pointer"};
  opacity: ${({ isLoading, isError, copied }) =>
    (isLoading && !copied) || isError ? 0.5 : 1};
  transition:
    color 0.15s,
    border-color 0.15s;

  &:hover:not(:disabled) {
    border-color: ${({ copied, isError, isLoading }) => {
      if ((isLoading && !copied) || isError) return "rgba(255,255,255,0.15)";
      if (copied) return "#91fa8c";
      return "#59cbe8";
    }};
    color: ${({ copied, isError, isLoading }) => {
      if ((isLoading && !copied) || isError) return "rgba(255,255,255,0.3)";
      if (copied) return "#91fa8c";
      return "#59cbe8";
    }};
  }
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

interface ShareUrlModalProps {
  path: string;
  companionUrl?: string;
  title?: string;
  onClose: () => void;
}

type FetchState =
  | { status: "loading" }
  | { status: "ready"; url: string }
  | { status: "error" };

export const ShareUrlModal = ({
  path,
  companionUrl,
  title = "Share",
  onClose,
}: ShareUrlModalProps) => {
  const [baseState, setBaseState] = useState<FetchState>({ status: "loading" });
  const [withCompanionState, setWithCompanionState] =
    useState<FetchState | null>(null);
  const [includeCompanion, setIncludeCompanion] = useState(false);
  const [copied, setCopied] = useState(false);
  const postCopyCancel = useRef<(() => void) | null>(null);

  // Cancel any in-flight post-copy fetch on unmount.
  useEffect(() => {
    return () => {
      postCopyCancel.current?.();
    };
  }, []);

  const companionHostPort = companionUrl
    ? companionUrl.replace(/^wss?:\/\//, "")
    : undefined;

  const companionPath = companionHostPort
    ? `${path}${path.includes("?") ? "&" : "?"}companion=${companionHostPort}`
    : undefined;

  useEffect(() => {
    let cancelled = false;
    API.shareUrl({ path })
      .then((res) => {
        if (!cancelled) setBaseState({ status: "ready", url: res.url });
      })
      .catch(() => {
        if (!cancelled) setBaseState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [path]);

  const handleCompanionToggle = (checked: boolean) => {
    setIncludeCompanion(checked);
    setCopied(false);

    if (!checked || !companionPath) return;

    // Already fetched — reuse cached result
    if (withCompanionState !== null) return;

    setWithCompanionState({ status: "loading" });
    API.shareUrl({ path: companionPath })
      .then((res) => {
        setWithCompanionState({ status: "ready", url: res.url });
      })
      .catch(() => {
        setWithCompanionState({ status: "error" });
      });
  };

  // While companion fetch is in-flight, keep showing the base URL so the
  // button doesn't flicker. Only switch once the companion result is ready.
  const activeState =
    includeCompanion &&
    companionPath &&
    withCompanionState?.status !== "loading"
      ? (withCompanionState ?? baseState)
      : baseState;

  const isLoading = activeState.status === "loading";
  const isError = activeState.status === "error";
  const url = activeState.status === "ready" ? activeState.url : "";

  const handleCopy = () => {
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      // Immediately start fetching a replacement so the modal always shows a fresh link.
      if (includeCompanion && companionPath) {
        setWithCompanionState({ status: "loading" });
        let cancelled = false;
        API.shareUrl({ path: companionPath })
          .then((res) => {
            if (!cancelled)
              setWithCompanionState({ status: "ready", url: res.url });
          })
          .catch(() => {
            if (!cancelled) setWithCompanionState({ status: "error" });
          });
        // Store the cancel flag on the closure; component unmount cleans up
        // by capturing it in the outer ref below.
        postCopyCancel.current = () => {
          cancelled = true;
        };
      } else {
        setBaseState({ status: "loading" });
        let cancelled = false;
        API.shareUrl({ path })
          .then((res) => {
            if (!cancelled) setBaseState({ status: "ready", url: res.url });
          })
          .catch(() => {
            if (!cancelled) setBaseState({ status: "error" });
          });
        postCopyCancel.current = () => {
          cancelled = true;
        };
      }
    });
  };

  const buttonLabel = () => {
    if (copied) return "✓ Link copied!";
    if (isLoading) return "Generating link…";
    if (isError) return "Failed to generate link";
    return "Copy link";
  };

  return (
    <Modal onClose={onClose} title={title}>
      <Description>Anyone with this link can join the session.</Description>
      <Note>
        Each link can only be used once. A fresh link is generated automatically
        when copying.
      </Note>
      <CopyButton
        type="button"
        copied={copied}
        isError={isError}
        isLoading={isLoading}
        disabled={isLoading && !copied}
        onClick={handleCopy}
      >
        {buttonLabel()}
      </CopyButton>
      {companionUrl && (
        <CheckboxRow>
          <input
            type="checkbox"
            checked={includeCompanion}
            onChange={(e) => handleCompanionToggle(e.target.checked)}
          />
          Include companion URL
        </CheckboxRow>
      )}
    </Modal>
  );
};
