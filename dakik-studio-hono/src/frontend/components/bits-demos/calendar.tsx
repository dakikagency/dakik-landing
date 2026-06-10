import {
  Calendar,
  CalendarNextTrigger,
  CalendarPrevTrigger,
  CalendarTable,
  CalendarTableDays,
  CalendarView,
  CalendarViewControl,
  CalendarViewDate,
  CalendarWeekDays,
} from "@/registry/react/components/calendar";

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <Calendar className="rounded-2xl border bg-card p-3">
        <CalendarView view="day">
          <CalendarViewControl>
            <CalendarPrevTrigger />
            <CalendarViewDate />
            <CalendarNextTrigger />
          </CalendarViewControl>

          <CalendarTable>
            <CalendarWeekDays />
            <CalendarTableDays />
          </CalendarTable>
        </CalendarView>
      </Calendar>
    </div>
  );
}
