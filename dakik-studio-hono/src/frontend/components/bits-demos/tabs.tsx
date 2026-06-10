import { KeyRoundIcon, SettingsIcon, UserIcon } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/react/components/tabs";

const panels = [
  {
    value: "account",
    label: "Account",
    icon: UserIcon,
    text: "Update your name, email and avatar here.",
  },
  {
    value: "password",
    label: "Password",
    icon: KeyRoundIcon,
    text: "Change your password and enable two-factor auth.",
  },
  {
    value: "settings",
    label: "Settings",
    icon: SettingsIcon,
    text: "Configure notifications and workspace preferences.",
  },
];

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-8">
      <Tabs className="w-full items-center" defaultValue="account">
        <TabsList>
          {panels.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value}>
              <Icon />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {panels.map(({ value, label, text }) => (
          <TabsContent
            className="w-full rounded-lg border border-white/10 px-4 py-5 text-center"
            key={value}
            value={value}
          >
            <p className="font-medium text-foreground text-sm">{label}</p>
            <p className="mt-1 text-muted-foreground text-xs">{text}</p>
          </TabsContent>
        ))}
      </Tabs>

      <Tabs defaultValue="account">
        <TabsList variant="underline">
          {panels.map(({ value, label }) => (
            <TabsTrigger key={value} value={value}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
