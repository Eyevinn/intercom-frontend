import styled from "@emotion/styled";
import { useState } from "react";
import { useGlobalState } from "../../global-state/context-provider";
import { buildCallsUrl } from "../../utils/call-url";
import { Modal } from "../modal/modal";
import { FormInput, PrimaryButton } from "../form-elements/form-elements";

const InputRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-start;

  input {
    margin: 0;
    flex: 1;
  }
`;

const CopyBtn = styled(PrimaryButton)`
  flex-shrink: 0;
  white-space: nowrap;
`;

const SuccessText = styled.p`
  color: #91fa8c;
  font-size: 1.4rem;
  margin: 0.5rem 0 0;
`;

type ShareUrlModalProps = {
  onClose: () => void;
};

export const ShareUrlModal = ({ onClose }: ShareUrlModalProps) => {
  const [{ calls }] = useGlobalState();
  const [copied, setCopied] = useState(false);

  const callRefs = Object.values(calls)
    .map((c) => c.joinProductionOptions)
    .filter(Boolean)
    .map((o) => ({
      productionId: o!.productionId,
      lineId: o!.lineId,
    }));

  const url = `${window.location.origin}${buildCallsUrl(callRefs)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <Modal onClose={onClose} title="Share Calls">
      <InputRow>
        <FormInput readOnly value={url} />
        <CopyBtn type="button" onClick={handleCopy}>
          {copied ? "Copied!" : "Copy"}
        </CopyBtn>
      </InputRow>
      {copied && <SuccessText>URL copied to clipboard</SuccessText>}
    </Modal>
  );
};
