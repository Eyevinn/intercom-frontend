import { ToolTip } from "../tool-tip/tool-tip";
import { WarningIcon } from "../../assets/icons/icon";

export const FirefoxWarning = ({
  type,
}: {
  type: "collapsable-header" | "firefox-warning";
}) => {
  return (
    <ToolTip
      tooltipText={
        <>
          <p>If a new device has been added Firefox</p>
          <p>needs the permission to be manually reset.</p>
          <p>If your device is missing, please</p>
          <p>remove the permission and reload page.</p>
        </>
      }
      type={type}
    >
      <WarningIcon />
    </ToolTip>
  );
};
