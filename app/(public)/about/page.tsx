// app/(public)/about/page.tsx
export default function AboutPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-semibold text-foreground">About Us</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        About page — public, no dock.
      </p>
    </div>
  );
}
