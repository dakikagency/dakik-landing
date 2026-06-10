import {
  Skeleton,
  SkeletonCircle,
  SkeletonText,
} from "@/registry/react/components/skeleton";

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <div className="flex w-full items-center gap-4">
        <SkeletonCircle />
        <div className="flex w-full flex-col gap-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>

      <div className="flex w-full flex-col gap-3">
        <Skeleton className="h-32 w-full rounded-xl" />
        <SkeletonText lines={3} />
      </div>
    </div>
  );
}
