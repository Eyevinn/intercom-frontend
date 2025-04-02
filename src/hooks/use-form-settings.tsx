// // import { useState } from "react";
// import { ErrorMessage } from "@hookform/error-message";
// import { useForm } from "react-hook-form";
// import {
//   DecorativeLabel,
//   FormInput,
//   FormSelect,
//   StyledWarningMessage,
//   FormLabel,
// } from "../components/landing-page/form-elements";
// import { TUserSettings } from "../components/user-settings/types";
// import { TJoinProductionOptions } from "../components/production-line/types";

// // type FormSettings = {
// //   username: string;
// //   audioinput: string;
// //   audiooutput: string;
// // };

// type FormValues = TJoinProductionOptions & {
//   audiooutput: string;
// };

// export const useFormSettings = ({
//   defaultValues,
// }: {
//   defaultValues: TUserSettings | FormValues;
// }) => {
//   // const [formSettings, setFormSettings] = useState<FormSettings>({
//   //   username: "",
//   //   audioinput: "",
//   //   audiooutput: "",
//   // });
//   const {
//     formState: { errors },
//     register,
//     getValues,
//     setValue,
//     handleSubmit,
//   } = useForm<TUserSettings | FormValues>({
//     defaultValues,
//     resetOptions: {
//       keepDirtyValues: true, // user-interacted input will be retained
//       keepErrors: true, // input errors will be retained with value update
//     },
//   });

//   return (
//     <>
//       <FormLabel>
//         <DecorativeLabel>Username</DecorativeLabel>
//         <FormInput
//           // eslint-disable-next-line
//     {...register(`username`, {
//             required: "Username is required",
//             minLength: 1,
//           })}
//           placeholder="Username"
//         />
//       </FormLabel>
//       <ErrorMessage errors={errors} name="username" as={StyledWarningMessage} />
//       <FormLabel>
//         <DecorativeLabel>Input</DecorativeLabel>
//         <FormSelect
//           // eslint-disable-next-line
//     {...register(`audioinput`)}
//         >
//           {devices.input && devices.input.length > 0 ? (
//             devices.input.map((device) => (
//               <option key={device.deviceId} value={device.deviceId}>
//                 {device.label}
//               </option>
//             ))
//           ) : (
//             <option value="no-device">No device available</option>
//           )}
//         </FormSelect>
//       </FormLabel>
//       <FormLabel>
//         <DecorativeLabel>Output</DecorativeLabel>
//         {devices.output && devices.output.length > 0 ? (
//           <FormSelect
//             // eslint-disable-next-line
//       {...register(`audiooutput`)}
//           >
//             {devices.output.map((device) => (
//               <option key={device.deviceId} value={device.deviceId}>
//                 {device.label}
//               </option>
//             ))}
//           </FormSelect>
//         ) : (
//           <StyledWarningMessage>
//             Controlled by operating system
//           </StyledWarningMessage>
//         )}
//       </FormLabel>
//     </>
//   );
// };
