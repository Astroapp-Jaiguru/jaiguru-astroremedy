import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Map</h1>
        <p className="text-sm text-muted-foreground">Google Map embed & direction links.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming in a later phase</CardTitle>
          <CardDescription>
            This module is scaffolded. Full CRUD UI will be implemented in its
            dedicated phase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The route structure and navigation are ready.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
