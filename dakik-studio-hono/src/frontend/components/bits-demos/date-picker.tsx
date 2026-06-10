import {
  CalendarNextTrigger,
  CalendarPrevTrigger,
  CalendarTable,
  CalendarTableDays,
  CalendarView,
  CalendarViewControl,
  CalendarViewDate,
  CalendarWeekDays,
} from "@/registry/react/components/calendar";
import {
  DatePicker,
  DatePickerContent,
  DatePickerInput,
} from "@/registry/react/components/date-picker";

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <div className="flex w-full max-w-64 flex-col gap-2">
        <span className="text-muted-foreground text-sm">Delivery date</span>

        <DatePicker>
          <DatePickerInput placeholder="Pick a date" />

          <DatePickerContent>
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
          </DatePickerContent>
        </DatePicker>
      </div>
    </div>
  );
}
