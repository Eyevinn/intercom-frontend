import { SettingsModal } from "./settings-modal";
import { SettingsIcon } from "../../assets/icons/icon";
import { Hotkeys, TJoinProductionOptions, TLine } from "./types";
import { ModalButton } from "../ui-components/buttons/modal-button";

type SettingsButtonProps = {
  callId: string;
  savedHotkeys: Hotkeys;
  customGlobalMute: string;
  line: TLine | null;
  joinProductionOptions: TJoinProductionOptions;
  productionId: string;
  lineId: string;
};

export const SettingsButton = ({
  callId,
  savedHotkeys,
  customGlobalMute,
  line,
  joinProductionOptions,
  productionId,
  lineId,
}: SettingsButtonProps) => {
  return (
    <ModalButton
      icon={<SettingsIcon />}
      className="hotkeys-button"
      modalContent={(onClose) => (
        <SettingsModal
          productionId={productionId}
          lineId={lineId}
          isOpen={true}
          callId={callId}
          savedHotkeys={savedHotkeys}
          customGlobalMute={customGlobalMute}
          lineName={line?.name}
          programOutPutLine={line?.programOutputLine}
          isProgramUser={joinProductionOptions.isProgramUser}
          onClose={onClose}
        />
      )}
    />
  );
};
