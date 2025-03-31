// import React, { useEffect, useRef } from "react";
// // import { useCallState } from "../state/call-state";
// import { useGlobalState } from "../global-state/context-provider";

// interface IframeCallProps {
//   id: string;
// }

// const IframeCall: React.FC<IframeCallProps> = ({ id }) => {
//   const iframeRef = useRef<HTMLIFrameElement>(null);
//   // const { callState } = useCallState();
//   const [{ calls }] = useGlobalState();
//   const joinProductionOptions = calls[id]?.joinProductionOptions;

//   // When options change, update the iframe
//   useEffect(() => {
//     const iframe = iframeRef.current;
//     if (!iframe || !iframe.contentWindow || !joinProductionOptions) return;

//     // Send updated options to the iframe
//     iframe.contentWindow.postMessage(
//       {
//         type: "UPDATE_OPTIONS",
//         options: joinProductionOptions,
//       },
//       "*"
//     );
//   }, [id, joinProductionOptions]);

//   // Create the iframe URL with initial options
//   const iframeUrl = React.useMemo(() => {
//     if (!joinProductionOptions) return "";

//     const optionsParam = encodeURIComponent(
//       JSON.stringify(joinProductionOptions)
//     );
//     return `/call-frame.html?callId=${id}&options=${optionsParam}`;
//   }, [id, joinProductionOptions]);

//   return (
//     <iframe
//       ref={iframeRef}
//       src={iframeUrl}
//       title={`Call ${id}`}
//       className="call-iframe"
//       allow="microphone; camera; autoplay; display-capture; speaker-selection"
//       style={{ width: "100%", height: "400px", border: "1px solid #ccc" }}
//     />
//   );
// };

// export default IframeCall;
