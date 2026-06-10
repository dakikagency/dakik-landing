import {
  TagsInput,
  TagsInputContext,
  TagsInputItem,
} from "@/registry/react/components/tags-input";

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <div className="flex w-full flex-col gap-2">
        <span className="font-medium text-foreground text-sm">
          Favorite frameworks
        </span>
        <TagsInput defaultValue={["React", "Vue", "Svelte"]} max={6}>
          <TagsInputContext>
            {(api) =>
              api.value.map((value, index) => (
                <TagsInputItem
                  index={index}
                  key={`${value}-${index}`}
                  value={value}
                >
                  {value}
                </TagsInputItem>
              ))
            }
          </TagsInputContext>
        </TagsInput>
        <span className="text-muted-foreground text-sm">
          Press Enter to add a tag, Backspace to remove the last one. Up to 6
          tags.
        </span>
      </div>
    </div>
  );
}
