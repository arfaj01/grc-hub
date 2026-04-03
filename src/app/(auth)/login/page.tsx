import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-teal mb-4">
          <span className="text-white text-2xl font-bold">DRD</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">DRD Executive Hub</h1>
        <p className="text-sm text-muted-foreground mt-1">إدارة التطوير والتأهيل — وزارة البلديات والإسكان</p>
      </div>
      <LoginForm />
    </div>
  );
}
