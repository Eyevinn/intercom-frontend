import styled from "@emotion/styled";
import { FC, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import {
  NoSoundIcon,
  FullSoundIcon,
  MinusIcon,
  PlusIcon,
} from "../../assets/icons/icon";
import { isMobile, isIosSafari } from "../../bowser";
import { PrimaryButton } from "../landing-page/form-elements";
import { audioContexts } from "../../audioContexts";

const SliderWrapper = styled.div`
  width: 100%;
  margin: 2rem 0;
  display: flex;
  flex-direction: row;
  position: relative;
`;

const VolumeContainer = styled.div`
  display: flex;
  flex-direction: column;
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
  margin-top: 2.5rem;
`;
// TODO: Remove margin-top and solve in a better way

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
      console.log("IS IOS SAFARI VOL SLIDER: ", isIosSafari);
      console.log(
        "AUDIO CONTEXTS HAS AUDIO ELEMENT: ",
        audioContexts.has(audioElement)
      );
      if (isIosSafari && audioContexts.has(audioElement)) {
        console.log("IS INSIDE IOS SAFARI VOLUME SLIDER");

        const { context, gainNode } = audioContexts.get(audioElement)!;
        console.log("STATE OF AUDIO CONTEXT: ", context.state);

        if (context.state === "suspended") {
          context
            .resume()
            .then(() => {
              console.log(
                "Audio context resumed for volume change in slider component yay"
              );
              console.log("Setting gain value to:", newValue);
              gainNode.gain.value = newValue;
              console.log("ACTUAL Gain value set to:", gainNode.gain.value);
            })
            .catch((error: Error) => {
              console.error(
                "Failed to resume audio context for volume change in slider component",
                error
              );
            });
        } else {
          console.log("Setting gain value to:", newValue);
          gainNode.gain.value = newValue;
          console.log("ACTUAL Gain value set to:", gainNode.gain.value);
        }
      } else {
        console.log("SEtting volume to: ", newValue);
        // eslint-disable-next-line no-param-reassign
        audioElement.volume = newValue;
      }
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
        {isMobile && (
          <VolumeButton onClick={() => handleVolumeButtonClick("decrease")}>
            <MinusIcon />
          </VolumeButton>
        )}
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
        {isMobile && (
          <VolumeButton onClick={() => handleVolumeButtonClick("increase")}>
            <PlusIcon />
          </VolumeButton>
        )}
      </VolumeContainer>
    </SliderWrapper>
  );
};
