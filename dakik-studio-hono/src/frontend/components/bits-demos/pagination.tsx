import {
  Pagination,
  PaginationItems,
  PaginationNext,
  PaginationPrevious,
} from "@/registry/react/components/pagination";

export default function Demo() {
  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-6">
      <Pagination count={120} defaultPage={5} pageSize={10} siblingCount={1}>
        <PaginationPrevious />
        <PaginationItems />
        <PaginationNext />
      </Pagination>
    </div>
  );
}
