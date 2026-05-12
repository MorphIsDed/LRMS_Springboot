import { Link } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

export function UnauthorizedPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-6">
      <Card className="w-full p-6">
        <div className="text-base font-semibold">Unauthorized</div>
        <div className="mt-1 text-sm text-slate-600">You do not have access to this page.</div>
        <div className="mt-5 flex items-center gap-3">
          <Button variant="secondary" type="button" onClick={() => window.history.back()}>
            Back
          </Button>
          <Link className="text-sm font-medium underline underline-offset-2" to="/">
            Home
          </Link>
        </div>
      </Card>
    </div>
  );
}
