import { useEffect, useMemo, useState } from "react";
import styled from "@emotion/styled";
import { API } from "../../api/api";
import { Modal } from "../modal/modal";
import {
  DEFAULT_RESTRICT_SHARE,
  appendGuestParam,
} from "../../utils/guest-session";

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

const withParam = (path: string, key: string, value: string): string =>
  `${path}${path.includes("?") ? "&" : "?"}${key}=${value}`;

export const ShareUrlModal = ({
  path,
  companionUrl,
  title = "Share",
  onClose,
}: ShareUrlModalProps) => {
  const [state, setState] = useState<FetchState>({ status: "loading" });
  const [includeCompanion, setIncludeCompanion] = useState(false);
  const [restrictAccess, setRestrictAccess] = useState(DEFAULT_RESTRICT_SHARE);
  const [copied, setCopied] = useState(false);
  const [nonce, setNonce] = useState(0);

  const companionHostPort = companionUrl
    ? companionUrl.replace(/^wss?:\/\//, "")
    : undefined;

  const effectivePath = useMemo(() => {
    let result = path;
    if (includeCompanion && companionHostPort) {
      result = withParam(result, "companion", companionHostPort);
    }
    if (restrictAccess) {
      result = appendGuestParam(result);
    }
    return result;
  }, [path, includeCompanion, companionHostPort, restrictAccess]);

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    API.shareUrl({ path: effectivePath })
      .then((res) => {
        if (!cancelled) setState({ status: "ready", url: res.url });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [effectivePath, nonce]);

  const isLoading = state.status === "loading";
  const isError = state.status === "error";
  const url = state.status === "ready" ? state.url : "";

  const handleCopy = () => {
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setNonce((n) => n + 1);
    });
  };

  const buttonLabel = () => {
    if (copied) return "Link copied!";
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
        disabled={(isLoading && !copied) || isError}
        onClick={handleCopy}
      >
        {buttonLabel()}
      </CopyButton>
      {companionUrl && (
        <CheckboxRow>
          <input
            type="checkbox"
            checked={includeCompanion}
            onChange={(e) => {
              setIncludeCompanion(e.target.checked);
              setCopied(false);
            }}
          />
          Include companion URL
        </CheckboxRow>
      )}
      <CheckboxRow>
        <input
          type="checkbox"
          checked={restrictAccess}
          onChange={(e) => {
            setRestrictAccess(e.target.checked);
            setCopied(false);
          }}
        />
        Restrict recipients to these calls
      </CheckboxRow>
      <Note>
        Recipients of a restricted link only see the calls they were invited to.
        This tailors their view — it is not an access-control boundary.
      </Note>
    </Modal>
  );
};
