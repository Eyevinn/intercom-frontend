type TAudioElement = {
  audioCtx: AudioContext;
  gainNode: GainNode;
  source: MediaStreamAudioSourceNode;
};

type TUseControlVolumeOptions = {
  audioElements: TAudioElement[];
};

type TUseControlVolume = (options: TUseControlVolumeOptions) => {
  setVolume: (value: number) => void;
};

export const useControlVolume: TUseControlVolume = ({ audioElements }) => {
  const setVolume = (value: number) => {
    audioElements.forEach(({ gainNode }) => {
      const clampedValue = Math.max(0, Math.min(1, value));
      gainNode.gain.setValueAtTime(clampedValue, gainNode.context.currentTime);

      console.log("Setting Gain Node Volume:", clampedValue);
    });
  };

  return { setVolume };
};
