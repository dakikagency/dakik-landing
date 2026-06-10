import {
  ChevronDownIcon,
  CreditCardIcon,
  LogOutIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/registry/react/components/button";
import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuShortcut,
  MenuTrigger,
} from "@/registry/react/components/menu";

export default function Demo() {
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState("dark");

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <Menu>
        <MenuTrigger asChild>
          <Button variant="outline">
            My Account
            <ChevronDownIcon />
          </Button>
        </MenuTrigger>

        <MenuContent className="min-w-52">
          <MenuGroup heading="Account">
            <MenuItem value="profile">
              <UserIcon />
              Profile
              <MenuShortcut>⇧⌘P</MenuShortcut>
            </MenuItem>
            <MenuItem value="billing">
              <CreditCardIcon />
              Billing
            </MenuItem>
            <MenuItem value="settings">
              <SettingsIcon />
              Settings
              <MenuShortcut>⌘,</MenuShortcut>
            </MenuItem>
          </MenuGroup>

          <MenuSeparator />

          <MenuCheckboxItem
            checked={notifications}
            onCheckedChange={setNotifications}
            value="notifications"
          >
            Notifications
          </MenuCheckboxItem>

          <MenuSeparator />

          <MenuRadioGroup
            heading="Theme"
            onValueChange={({ value }) => setTheme(value)}
            value={theme}
          >
            <MenuRadioItem value="light">Light</MenuRadioItem>
            <MenuRadioItem value="dark">Dark</MenuRadioItem>
            <MenuRadioItem value="system">System</MenuRadioItem>
          </MenuRadioGroup>

          <MenuSeparator />

          <MenuItem value="logout" variant="destructive">
            <LogOutIcon />
            Log out
          </MenuItem>
        </MenuContent>
      </Menu>
    </div>
  );
}
