import { useEffect, useRef, useState } from "react";

type TUseControlVolumeOptions = {
  stream: MediaStream | null;
};

type TUseControlVolume = (options: TUseControlVolumeOptions) => {
  setVolume: (value: number) => void;
  audioContext: AudioContext | null;
};

export const useControlVolume: TUseControlVolume = ({ stream }) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (!stream) return;

    console.log("Initializing Audio Context");

    const audioCtx = new AudioContext();
    setAudioContext(audioCtx);

    const source = audioCtx.createMediaStreamSource(stream);

    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.5;

    source.connect(gainNode);
    // Outputs the audio to the speakers
    gainNode.connect(audioCtx.destination);

    gainNodeRef.current = gainNode;

    // eslint-disable-next-line consistent-return
    return () => {
      source.disconnect();
      gainNode.disconnect();
      audioCtx.close();
      gainNodeRef.current = null;
    };
  }, [stream]);

  const setVolume = (value: number) => {
    if (gainNodeRef.current) {
      const clampedValue = Math.max(0, Math.min(1, value));
      gainNodeRef.current.gain.value = clampedValue;

      console.log("Setting Gain Node Volume:", clampedValue);
    }
  };

  return { setVolume, audioContext };
};
