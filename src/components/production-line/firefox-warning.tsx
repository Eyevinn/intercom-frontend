import { Tooltip } from "../tooltip/tooltip";
import { WarningIcon } from "../../assets/icons/icon";

export const FirefoxWarning = ({
  type,
}: {
  type: "collapsable-header" | "firefox-warning";
}) => {
  return (
    <Tooltip
      tooltipText={
        <p>
          If a new device has been added Firefox needs the permission to be
          manually reset. If your device is missing, please remove the
          permission and reload page.
        </p>
      }
      type={type}
    >
      <WarningIcon />
    </Tooltip>
  );
};
