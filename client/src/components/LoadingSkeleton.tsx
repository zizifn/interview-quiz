import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCard() {
  return (
    <div data-testid="skeleton-card" className="flex h-full justify-center items-center flex-col space-y-3 animate-pulse">
      <Skeleton className="h-[125px] w-[250px] rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}
