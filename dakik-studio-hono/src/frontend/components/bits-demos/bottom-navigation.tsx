import { CompassIcon, HeartIcon, HomeIcon, UserIcon } from "lucide-react";
import { useState } from "react";
import {
  BottomNavigation,
  BottomNavigationItem,
  BottomNavigationItemIcon,
  BottomNavigationItemLabel,
  BottomNavigationList,
} from "@/registry/react/components/bottom-navigation";

const items = [
  { value: "home", label: "Home", icon: HomeIcon },
  { value: "explore", label: "Explore", icon: CompassIcon },
  { value: "saved", label: "Saved", icon: HeartIcon },
  { value: "profile", label: "Profile", icon: UserIcon },
];

export default function Demo() {
  const [value, setValue] = useState("home");

  const active = items.find((item) => item.value === value);

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <div className="relative h-80 w-full max-w-xs overflow-hidden rounded-2xl border border-white/10">
        <BottomNavigation
          className="min-h-0"
          onValueChange={({ value: next }) => next && setValue(next)}
          value={value}
        >
          <div className="flex h-[calc(20rem-3.5rem)] flex-col items-center justify-center gap-2 px-6 text-center">
            <span className="font-medium text-foreground text-sm">
              {active?.label}
            </span>
            <span className="text-muted-foreground text-xs">
              Tap an item below to switch sections.
            </span>
          </div>

          <BottomNavigationList aria-label="Main" className="absolute">
            {items.map(({ value: itemValue, label, icon: Icon }) => (
              <BottomNavigationItem key={itemValue} value={itemValue}>
                <BottomNavigationItemIcon>
                  <Icon />
                </BottomNavigationItemIcon>
                <BottomNavigationItemLabel>{label}</BottomNavigationItemLabel>
              </BottomNavigationItem>
            ))}
          </BottomNavigationList>
        </BottomNavigation>
      </div>
    </div>
  );
}
