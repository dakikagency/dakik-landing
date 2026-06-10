import { ChevronRightIcon, FileTextIcon, FolderIcon } from "lucide-react";
import { Badge } from "@/registry/react/components/badge";
import { Button } from "@/registry/react/components/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/registry/react/components/item";

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <ItemGroup className="gap-2">
        <Item variant="outline">
          <ItemMedia variant="icon">
            <FolderIcon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>
              Design assets <Badge variant="secondary">24 files</Badge>
            </ItemTitle>
            <ItemDescription>
              Logos, illustrations and brand guidelines.
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button size="icon-sm" variant="ghost">
              <ChevronRightIcon />
            </Button>
          </ItemActions>
        </Item>

        <Item variant="muted">
          <ItemMedia variant="icon">
            <FileTextIcon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Quarterly report.pdf</ItemTitle>
            <ItemDescription>Updated 2 hours ago — 1.4 MB</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button size="sm" variant="outline">
              Download
            </Button>
          </ItemActions>
        </Item>

        <ItemSeparator />

        <Item variant="outline">
          <ItemMedia variant="image">
            <img
              alt="Cover thumbnail"
              src="https://picsum.photos/seed/item-bit/80/80"
            />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Launch cover</ItemTitle>
            <ItemDescription>Hero image for the release post.</ItemDescription>
          </ItemContent>
        </Item>
      </ItemGroup>
    </div>
  );
}
