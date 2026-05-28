import { AppShell } from "../components/AppShell";
import { Card } from "../components/ui/Card";

export function RoomsPage() {
  return (
    <AppShell title="Rooms">
      <div className="mx-auto max-w-5xl">
        <Card className="p-6 bg-card border-border shadow-sm">
          <h3 className="text-lg font-medium text-foreground mb-4">Room Management</h3>
          <div className="text-center py-10 text-muted-foreground border border-dashed border-border rounded-xl">
            Room directory and status features are coming soon.
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
