import { useState } from "react";
import { SettingToggle } from "./ui_components";
interface SwitchProps {
  sound_effect: boolean;
  background_music: boolean;
  show_notification: boolean;
}
const SettingsUI: React.FC = () => {
  const [switchProps, setSwitchProps] = useState<SwitchProps>({
    sound_effect: false,
    background_music: false,
    show_notification: false,
  });

  const handleSwitchChange = (key: keyof SwitchProps) => (isOn: boolean) => {
    setSwitchProps((prev) => ({
      ...prev,
      [key]: isOn,
    }));
  };

  return (
    <div className="p-6">
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-6 backdrop-blur-sm border border-gray-700/50">
        <h1 className="text-2xl font-bold text-white mb-6">Game Settings</h1>
        <div className="space-y-6">
          <SettingToggle
            label="Sound Effects"
            defaultOn={switchProps.sound_effect}
            onChange={handleSwitchChange("sound_effect")}
          />
          <SettingToggle
            label="Background Music"
            defaultOn={switchProps.background_music}
            onChange={handleSwitchChange("background_music")}
          />
          <SettingToggle
            label="Show Notifications"
            defaultOn={switchProps.show_notification}
            onChange={handleSwitchChange("show_notification")}
          />
          <div className="mt-6">
            <label className="block text-white mb-2">Graphics Quality</label>
            <div className="w-full h-2 bg-gray-700 rounded-full">
              <div className="w-3/4 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SettingsUI;
