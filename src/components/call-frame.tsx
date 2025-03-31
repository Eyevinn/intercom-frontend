// import React, { useEffect, useState } from 'react';
// import { useRtcConnection } from './production-line/use-rtc-connection';

// interface CallFrameProps {
//   callId: string;
//   joinProductionOptions: any;
// }

// const CallFrame: React.FC<CallFrameProps> = ({ callId, joinProductionOptions }) => {
//   const [options, setOptions] = useState(joinProductionOptions);

//   // Set up message listener to receive updates from parent
//   useEffect(() => {
//     const handleMessage = (event: MessageEvent) => {
//       if (event.data.type === 'UPDATE_OPTIONS') {
//         console.log('[CallFrame] Received updated options:', event.data.options);
//         setOptions(event.data.options);
//       }
//     };

//     window.addEventListener('message', handleMessage);

//     // Notify parent that frame is ready
//     window.parent.postMessage({ type: 'FRAME_READY', callId }, '*');

//     return () => {
//       window.removeEventListener('message', handleMessage);
//     };
//   }, [callId]);

//   // Use your existing RTC connection hook with the options
//   const { connectionState, connectionActive, setConnectionActive } =
//     useRtcConnection({
//       callId,
//       joinProductionOptions: options,
//     });

//   // Activate connection when component mounts
//   useEffect(() => {
//     setConnectionActive(true);

//     return () => {
//       setConnectionActive(false);
//     };
//   }, [setConnectionActive]);

//   return (
//     <div className="call-frame">
//       <div className="connection-status">
//         Connection: {connectionState}
//       </div>
//     </div>
//   );
// };

// export default CallFrame;
