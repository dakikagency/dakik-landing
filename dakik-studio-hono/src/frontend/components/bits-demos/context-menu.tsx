import {
  ClipboardIcon,
  CopyIcon,
  PencilIcon,
  ShareIcon,
  Trash2Icon,
} from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/registry/react/components/context-menu";

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <ContextMenu>
        <ContextMenuTrigger className="flex h-40 w-full items-center justify-center rounded-lg border border-white/15 border-dashed text-muted-foreground text-sm">
          Right click here
        </ContextMenuTrigger>

        <ContextMenuContent className="min-w-48">
          <ContextMenuGroup>
            <ContextMenuItem value="copy">
              <CopyIcon />
              Copy
              <ContextMenuShortcut>⌘C</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem value="paste">
              <ClipboardIcon />
              Paste
              <ContextMenuShortcut>⌘V</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem value="rename">
              <PencilIcon />
              Rename
            </ContextMenuItem>
          </ContextMenuGroup>

          <ContextMenuSeparator />

          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <ShareIcon />
              Share
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem value="share-email">Email</ContextMenuItem>
              <ContextMenuItem value="share-link">Copy link</ContextMenuItem>
              <ContextMenuItem value="share-embed">Embed</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>

          <ContextMenuSeparator />

          <ContextMenuItem value="delete" variant="destructive">
            <Trash2Icon />
            Delete
            <ContextMenuShortcut>⌫</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}
