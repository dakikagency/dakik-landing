import {
  DataList,
  DataListItem,
  DataListItemLabel,
  DataListItemValue,
} from "@/registry/react/components/data-list";
import { Badge } from "@/registry/react/components/badge";

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <DataList className="w-full">
        <DataListItem>
          <DataListItemLabel>Status</DataListItemLabel>
          <DataListItemValue>
            <Badge pill variant="success">
              Deployed
            </Badge>
          </DataListItemValue>
        </DataListItem>
        <DataListItem>
          <DataListItemLabel>Environment</DataListItemLabel>
          <DataListItemValue>Production</DataListItemValue>
        </DataListItem>
        <DataListItem>
          <DataListItemLabel>Branch</DataListItemLabel>
          <DataListItemValue className="font-mono">main</DataListItemValue>
        </DataListItem>
        <DataListItem>
          <DataListItemLabel>Commit</DataListItemLabel>
          <DataListItemValue className="font-mono">51679eb</DataListItemValue>
        </DataListItem>
        <DataListItem>
          <DataListItemLabel>Deployed by</DataListItemLabel>
          <DataListItemValue>erdeniz@dakik.co.uk</DataListItemValue>
        </DataListItem>
      </DataList>
    </div>
  );
}
