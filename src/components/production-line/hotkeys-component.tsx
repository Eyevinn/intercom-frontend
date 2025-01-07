import styled from "@emotion/styled";
import { useState } from "react";
import { SettingsModal } from "./settings-modal";
import { SettingsIcon } from "../../assets/icons/icon";
import { Hotkeys, TLine } from "./types";

const TempDiv = styled.div`
  padding: 0 0 2rem 0;
`;

const HotkeyDiv = styled.div`
  padding: 0 0 2rem 0;
  flex-direction: row;
  display: flex;
  align-items: center;
`;

const SettingsBtn = styled.div`
  padding: 0;
  margin-left: 1.5rem;
  width: 3rem;
  cursor: pointer;
  color: white;
  background: transparent;
`;

type HotkeysComponentProps = {
  callId: string;
  savedHotkeys: Hotkeys;
  customGlobalMute: string;
  line: TLine | null;
};

export const HotkeysComponent = ({
  callId,
  savedHotkeys,
  customGlobalMute,
  line,
}: HotkeysComponentProps) => {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const handleSettingsClick = () => {
    setIsSettingsModalOpen(!isSettingsModalOpen);
  };

  return (
    <>
      <HotkeyDiv>
        <strong>Hotkeys</strong>
        <SettingsBtn onClick={handleSettingsClick}>
          <SettingsIcon />
        </SettingsBtn>
      </HotkeyDiv>
      <TempDiv>
        <strong>{(savedHotkeys?.muteHotkey || "").toUpperCase()}: </strong>
        Toggle Input Mute
      </TempDiv>
      <TempDiv>
        <strong>{(savedHotkeys?.speakerHotkey || "").toUpperCase()}: </strong>
        Toggle Output Mute
      </TempDiv>
      <TempDiv>
        <strong>
          {(savedHotkeys?.pushToTalkHotkey || "").toUpperCase()}:{" "}
        </strong>
        Push to Talk
      </TempDiv>
      <TempDiv>
        <strong>{savedHotkeys?.increaseVolumeHotkey.toUpperCase()}: </strong>
        Increase Volume
      </TempDiv>
      <TempDiv>
        <strong>{savedHotkeys?.decreaseVolumeHotkey.toUpperCase()}: </strong>
        Decrease Volume
      </TempDiv>
      <TempDiv>
        <strong>
          {(savedHotkeys?.globalMuteHotkey || "").toUpperCase()}:{" "}
        </strong>
        Toggle Mute All Inputs
      </TempDiv>
      {isSettingsModalOpen && (
        <SettingsModal
          isOpen={isSettingsModalOpen}
          callId={callId}
          savedHotkeys={savedHotkeys}
          customGlobalMute={customGlobalMute}
          lineName={line?.name}
          onSave={() => setIsSettingsModalOpen(false)}
          onClose={handleSettingsClick}
        />
      )}
    </>
  );
};
