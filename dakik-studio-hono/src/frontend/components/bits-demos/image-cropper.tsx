import {
  ImageCropper,
  ImageCropperImage,
  ImageCropperSelection,
} from "@/registry/react/components/image-cropper";

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <ImageCropper className="overflow-hidden rounded-xl border border-border bg-muted/20">
        <ImageCropperImage
          alt="Landscape to crop"
          src="https://picsum.photos/seed/crop/600/400"
        />
        <ImageCropperSelection />
      </ImageCropper>
      <p className="text-muted-foreground text-sm">
        Drag the selection or pull a handle to adjust the crop area.
      </p>
    </div>
  );
}
