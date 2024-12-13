import React from "react";
import styled from "@emotion/styled";

const SliderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1rem 0;
`;

const Slider = styled.input`
  -webkit-appearance: none;
  width: 300px;
  height: 5px;
  background: #ddd;
  border-radius: 5px;
  outline: none;
  transition: opacity 0.2s;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: #59cbe8;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: #333;
    cursor: pointer;
  }

  &:hover {
    opacity: 1;
  }
`;

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const VolumeSlider: React.FC<SliderProps> = ({
  value,
  min,
  max,
  step,
  onChange,
}) => {
  return (
    <SliderContainer>
      <Slider
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
      />
    </SliderContainer>
  );
};

export default VolumeSlider;
