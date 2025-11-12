import { SignUpForm } from "@/components/forms/SignUpForm";

export default function Page() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold mb-6 text-gray-900">Create your account</h1>
      <SignUpForm />
    </div>
  );
}
