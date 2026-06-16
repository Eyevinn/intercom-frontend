import styled from "@emotion/styled";
import { useState } from "react";
import { useGlobalState } from "../../global-state/context-provider";
import { useInitiateProductionCall } from "../../hooks/use-initiate-production-call";
import { useVideoDeviceLabels } from "../../hooks/use-video-device-labels";
import { FormSelect, PrimaryButton } from "../form-elements/form-elements";
import { FormItem } from "../user-settings-form/form-item";

const CardContainer = styled.div<{ order?: number }>`
  padding: 2rem;
  border: 0.1rem solid rgba(109, 109, 109, 0.3);
  border-radius: 1rem;
  background: rgba(45, 62, 124, 0.2);
  flex: 0 0 calc(25% - 2rem);
  flex-grow: 0;
  min-width: 30rem;
  order: ${({ order }) => order ?? 0};

  @media (max-width: 1440px) {
    flex: 0 0 calc(33.333% - 2rem);
  }

  @media (max-width: 1024px) {
    flex: 0 0 calc(50% - 2rem);
  }

  @media (max-width: 768px) {
    flex: 0 0 calc(100%);
    min-width: 0;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
`;

const CardTitleWrapper = styled.div`
  flex: 1;
  min-width: 0;
`;

const CardTitle = styled.div`
  font-size: 2rem;
  font-weight: bold;
  line-height: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  min-width: 0;
`;

const CardSubtitle = styled.div`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.55);
  margin-top: 0.4rem;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const ButtonRow = styled.div`
  margin: 2rem 0 0 0;
  display: flex;
  justify-content: flex-end;
`;

const JoinBtn = styled(PrimaryButton)`
  padding: 0.6rem 1.4rem;
  font-size: 1.4rem;
`;

type VideoLineJoinCardProps = {
  productionId: string;
  lineId: string;
  lineName?: string;
  productionName?: string;
  presetOrder?: number;
  customGlobalMute: string;
  onJoined: () => void;
};

export const VideoLineJoinCard = ({
  productionId,
  lineId,
  lineName,
  productionName,
  presetOrder,
  customGlobalMute,
  onJoined,
}: VideoLineJoinCardProps) => {
  const [videoinput, setVideoinput] = useState<string>("no-device");
  const [{ userSettings, devices }, dispatch] = useGlobalState();
  const { initiateProductionCall } = useInitiateProductionCall({ dispatch });

  useVideoDeviceLabels({ enabled: true, dispatch });

  const displayName = lineName || lineId;
  const hasCameraSelected = videoinput !== "no-device";

  const handleJoin = async () => {
    if (!userSettings?.username) return;

    if (hasCameraSelected) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoinput === "" ? true : { deviceId: { exact: videoinput } },
        });
        stream.getTracks().forEach((t) => t.stop());
      } catch {
        // permission prompt may be denied — safe to ignore
      }
    }

    const success = await initiateProductionCall({
      payload: {
        joinProductionOptions: {
          productionId,
          lineId,
          username: userSettings.username,
          audioinput: userSettings.audioinput,
          videoinput,
          lineUsedForProgramOutput: false,
          isProgramUser: false,
          videoEnabled: true,
          lineName,
        },
        audiooutput: userSettings.audiooutput,
      },
      customGlobalMute,
    });

    if (success) {
      onJoined();
    }
  };

  return (
    <CardContainer order={presetOrder}>
      <CardHeader>
        <CardTitleWrapper>
          <CardTitle title={displayName}>{displayName}</CardTitle>
          {productionName && (
            <CardSubtitle title={productionName}>{productionName}</CardSubtitle>
          )}
        </CardTitleWrapper>
      </CardHeader>
      <FormItem label="Camera">
        <FormSelect
          value={videoinput}
          onChange={(e) => setVideoinput(e.target.value)}
        >
          <option value="no-device">No camera</option>
          {devices.videoInput && devices.videoInput.length > 0 ? (
            devices.videoInput.map((device, index) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${index + 1}`}
              </option>
            ))
          ) : (
            <option value="">Use camera</option>
          )}
        </FormSelect>
      </FormItem>
      <ButtonRow>
        <JoinBtn
          type="button"
          onClick={handleJoin}
          disabled={!userSettings?.username}
        >
          Join
        </JoinBtn>
      </ButtonRow>
    </CardContainer>
  );
};
