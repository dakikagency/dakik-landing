import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/registry/react/components/avatar";

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <div className="flex items-center gap-4">
        <Avatar size="sm">
          <AvatarImage alt="Lena Marsh" src="https://picsum.photos/seed/lena/64/64" />
          <AvatarFallback>LM</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage alt="Omar Reyes" src="https://picsum.photos/seed/omar/64/64" />
          <AvatarFallback>OR</AvatarFallback>
          <AvatarBadge variant="success" />
        </Avatar>
        <Avatar size="lg">
          <AvatarFallback>DK</AvatarFallback>
          <AvatarBadge variant="warning" />
        </Avatar>
      </div>

      <AvatarGroup>
        <Avatar>
          <AvatarImage alt="Ava Chen" src="https://picsum.photos/seed/ava/64/64" />
          <AvatarFallback>AC</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage alt="Noah Patel" src="https://picsum.photos/seed/noah/64/64" />
          <AvatarFallback>NP</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>EK</AvatarFallback>
        </Avatar>
        <AvatarGroupCount>+4</AvatarGroupCount>
      </AvatarGroup>
    </div>
  );
}
