import { useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { CopyButton } from "../copy-button/copy-button";
import { FormInput } from "../form-elements/form-elements";
import { Modal } from "../modal/modal";
import {
  InputWrapper,
  LinkLabel,
  ModalHeader,
  ModalText,
  Wrapper,
} from "../generate-urls/generate-urls-components";

const CheckboxRow = styled.label`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.4rem;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  margin-top: 1.5rem;

  input[type="checkbox"] {
    width: 1.6rem;
    height: 1.6rem;
    cursor: pointer;
    accent-color: #59cbe8;
  }
`;

const COMPANION_SUFFIX = "&companion=ws://127.0.0.1:12345";

type TAutoJoinLinkModalProps = {
  url: string;
  onClose: () => void;
};

export const AutoJoinLinkModal = ({ url, onClose }: TAutoJoinLinkModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [includeCompanion, setIncludeCompanion] = useState(false);

  const displayUrl = includeCompanion ? `${url}${COMPANION_SUFFIX}` : url;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <Modal onClose={onClose}>
      <div ref={modalRef}>
        <ModalHeader>Auto Join Link</ModalHeader>
        <ModalText>
          Share this link to let someone join the same set of calls automatically.
        </ModalText>
        <CheckboxRow>
          <input
            type="checkbox"
            checked={includeCompanion}
            onChange={(e) => setIncludeCompanion(e.target.checked)}
          />
          Include companion connection
        </CheckboxRow>
        <Wrapper>
          <InputWrapper>
            <LinkLabel>
              <FormInput readOnly value={displayUrl} />
            </LinkLabel>
            <CopyButton urls={[displayUrl]} className="share-line-link-modal" />
          </InputWrapper>
        </Wrapper>
      </div>
    </Modal>
  );
};
