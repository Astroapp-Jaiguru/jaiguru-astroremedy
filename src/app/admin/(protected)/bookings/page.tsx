import { prisma } from "@/lib/prisma";
import { BookingCalendar } from "@/components/admin/bookings/booking-calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toDateKey } from "@/lib/booking";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const blocks = await prisma.bookingBlock.findMany({
    orderBy: { date: "asc" },
  });
  const data = blocks.map((b) => ({
    id: b.id,
    dateKey: toDateKey(b.date),
    allDay: b.allDay,
    timeSlots: b.timeSlots,
    reason: b.reason,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Booking Calendar</h1>
        <p className="text-sm text-muted-foreground">
          Block whole days or specific time slots (07:00 AM – 12:00 PM) when
          you are away. Blocked slots are hidden from visitors booking
          services and consultations.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Availability Calendar</CardTitle>
          <CardDescription>
            Red = fully blocked day · Amber = some time slots blocked.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BookingCalendar blocks={data} />
        </CardContent>
      </Card>
    </div>
  );
}
