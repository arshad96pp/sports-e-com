import { Loader2 } from "lucide-react";

export default function AccountLoading() {
  return (
    <div className="container-app flex min-h-[70vh] items-center justify-center py-12">
      <Loader2 className="h-6 w-6 animate-spin text-muted" />
    </div>
  );
}
