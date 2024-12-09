import styled from "@emotion/styled";
import { FC, useState } from "react";
import { NoSoundIcon, FullSoundIcon } from "../../assets/icons/icon";

const SliderWrapper = styled.div`
  width: 100%;
  margin: 2rem 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
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

type SliderProps = {
  min: number;
  max: number;
  step?: number;
  initialValue?: number;
  setVolume: (value: number) => void;
};

export const Slider: FC<SliderProps> = ({
  min,
  max,
  step = 1,
  initialValue = min,
  setVolume,
}) => {
  const [value, setValue] = useState(initialValue);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setValue(newValue);
    setVolume(newValue / max);

    console.log("Slider value: ", newValue);
    console.log("Normalized value: ", newValue / max);
  };

  const thumbPosition = ((value - min) / (max - min)) * 100;

  return (
    <SliderWrapper>
      <IconWrapper>
        <NoSoundIcon />
      </IconWrapper>
      <SliderTrack>
        <SliderThumb position={thumbPosition} />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
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
      <IconWrapper>
        <FullSoundIcon />
      </IconWrapper>
    </SliderWrapper>
  );
};
