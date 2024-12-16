import styled from "@emotion/styled";
import { FC, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import {
  NoSoundIcon,
  FullSoundIcon,
  MinusIcon,
  PlusIcon,
} from "../../assets/icons/icon";
import { isMobile } from "../../bowser";
import { PrimaryButton } from "../landing-page/form-elements";

const SliderWrapper = styled.div`
  width: 100%;
  margin: 2rem 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
`;

const VolumeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const IconWrapper = styled.div`
  width: 5rem;
  height: 5rem;
  padding: 0.5rem;
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
  cursor: pointer;
`;

const VolumeButton = styled(PrimaryButton)`
  width: 7rem;
  align-items: center;
  height: 4.5rem;
  padding: 1.5rem;
  cursor: pointer;
  margin-top: 1rem;
`;

const VolumeButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

type TVolumeSliderProps = {
  audioElements: HTMLAudioElement[];
  increaseVolumeKey?: string;
  decreaseVolumeKey?: string;
};

export const VolumeSlider: FC<TVolumeSliderProps> = ({
  audioElements,
  increaseVolumeKey,
  decreaseVolumeKey,
}) => {
  const [value, setValue] = useState(0.75);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setValue(newValue);

    audioElements.forEach((audioElement) => {
      console.log("Setting volume to: ", newValue);
      // eslint-disable-next-line no-param-reassign
      audioElement.volume = newValue;
    });
  };

  const thumbPosition = value * 100;

  useHotkeys(increaseVolumeKey || "u", () => {
    const newValue = Math.min(value + 0.05, 1);
    setValue(newValue);

    audioElements.forEach((audioElement) => {
      // eslint-disable-next-line no-param-reassign
      audioElement.volume = newValue;
    });
  });

  useHotkeys(decreaseVolumeKey || "d", () => {
    const newValue = Math.max(value - 0.05, 0);
    setValue(newValue);

    audioElements.forEach((audioElement) => {
      // eslint-disable-next-line no-param-reassign
      audioElement.volume = newValue;
    });
  });

  const handleVolumeButtonClick = (type: "increase" | "decrease") => {
    const newValue =
      type === "increase"
        ? Math.min(value + 0.05, 1)
        : Math.max(value - 0.05, 0);
    setValue(newValue);
    // TODO: Fix for iOS
  };

  return (
    <SliderWrapper>
      <VolumeContainer>
        <IconWrapper>
          <NoSoundIcon />
        </IconWrapper>
      </VolumeContainer>
      <SliderTrack>
        <SliderThumb position={thumbPosition} />
        <input
          id="volumeSlider"
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={value}
          onChange={handleInputChange}
          style={{
            width: "100%",
            position: "absolute",
            top: 0,
            height: "0.4rem",
            opacity: 0,
            pointerEvents: "all",
          }}
        />
      </SliderTrack>
      <VolumeContainer>
        <IconWrapper>
          <FullSoundIcon />
        </IconWrapper>
      </VolumeContainer>
      {isMobile && (
        <VolumeButtonContainer>
          <VolumeButton onClick={() => handleVolumeButtonClick("decrease")}>
            <MinusIcon />
          </VolumeButton>
          <VolumeButton onClick={() => handleVolumeButtonClick("increase")}>
            <PlusIcon />
          </VolumeButton>
        </VolumeButtonContainer>
      )}
    </SliderWrapper>
  );
};
