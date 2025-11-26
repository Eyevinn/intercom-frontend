import styled from "@emotion/styled";
import { FC } from "react";
import { NoSoundIcon, SpeakerOn } from "../../assets/icons/icon";

const SliderWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

const VolumeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  svg {
    width: 5rem;
    padding: 0.5rem;
    fill: #59cbe8;
  }
`;

const SliderTrack = styled.div`
  width: 80%;
  height: 0.4rem;
  background-color: #e0e0e0;
  border-radius: 0.2rem;
  position: relative;
`;

const SliderThumb = styled.div<{ position: number }>`
  width: 1.5rem;
  height: 1.5rem;
  background-color: #59cbe8;
  border-radius: 50%;
  position: absolute;
  top: -0.6rem;
  left: ${({ position }) => `${position}%`};
  transform: translateX(-50%);
`;

const VolumeWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  align-items: center;
`;

type TVolumeSliderProps = {
  value: number;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export const VolumeSlider: FC<TVolumeSliderProps> = ({
  handleInputChange,
  value,
}) => {
  const thumbPosition = value * 100;

  return (
    <SliderWrapper>
      <VolumeWrapper>
        <VolumeContainer>
          <NoSoundIcon />
        </VolumeContainer>
        <SliderTrack>
          <SliderThumb position={thumbPosition} />
          <input
            id="volumeSlider"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={value || 0.75}
            onChange={handleInputChange}
            style={{
              width: "100%",
              position: "absolute",
              top: 0,
              height: "0.4rem",
              opacity: 0,
              cursor: "pointer",
            }}
          />
        </SliderTrack>
        <VolumeContainer>
          <SpeakerOn />
        </VolumeContainer>
      </VolumeWrapper>
    </SliderWrapper>
  );
};
