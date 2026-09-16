import Link from "next/link";
import { CompassIcon } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-app flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <CompassIcon className="mb-4 h-14 w-14 text-muted-soft" strokeWidth={1.5} />
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">404</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        We couldn&apos;t find the page you&apos;re looking for. It may have been moved or no longer exists.
      </p>
      <Link
        href="/"
        className="tap-target mt-6 inline-flex items-center justify-center rounded-full bg-ink px-7 text-sm font-semibold text-white"
      >
        Back to Home
      </Link>
    </div>
  );
}
