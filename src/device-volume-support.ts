export const isVolumeRestrictedDevice = !!Object.getOwnPropertyDescriptor(
  HTMLAudioElement.prototype,
  "volume"
)?.configurable;

const audioEvaluator = document.createElement("audio");
const originalVolume = audioEvaluator.volume;

audioEvaluator.volume = 0.123;

export const isVolumeRestrictedDeviceCheck =
  audioEvaluator.volume === originalVolume;
