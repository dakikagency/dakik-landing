import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/react/components/table";

const invoices = [
  { id: "INV-001", status: "Paid", method: "Credit card", amount: "$250.00" },
  { id: "INV-002", status: "Pending", method: "PayPal", amount: "$150.00" },
  { id: "INV-003", status: "Paid", method: "Bank transfer", amount: "$350.00" },
  { id: "INV-004", status: "Overdue", method: "Credit card", amount: "$450.00" },
  { id: "INV-005", status: "Paid", method: "PayPal", amount: "$550.00" },
];

export default function Demo() {
  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-6">
      <Table variant="striped">
        <TableCaption>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">{invoice.id}</TableCell>
              <TableCell>{invoice.status}</TableCell>
              <TableCell>{invoice.method}</TableCell>
              <TableCell className="text-right">{invoice.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell className="text-right">$1,750.00</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
