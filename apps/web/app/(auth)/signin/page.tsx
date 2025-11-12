import { SignInForm } from "@/components/forms/SignInForm";

export default function Page() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
      <SignInForm />
    </div>
  );
}
