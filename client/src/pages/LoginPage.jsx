import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/useAuth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errors = {};
    const email = formData.email.trim();

    if (!email) {
      errors.email = "Email is required";
    } else if (!EMAIL_REGEX.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (apiError) {
      setApiError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setApiError("");

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await login({
        email: formData.email.trim(),
        password: formData.password,
      });
      const redirectTo = location.state?.from?.pathname || "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (error) {
      if (error.errors) {
        setFieldErrors((prev) => ({ ...prev, ...error.errors }));
      }
      setApiError(error.message || "Unable to sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to access your TestPilot workspace."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-[#00FFBA] underline-offset-4 transition hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {apiError && (
          <div
            role="alert"
            className="rounded-xl border border-[#D7E8FA]/25 bg-[#292B3A] px-4 py-3 text-sm text-[#D7E8FA]"
          >
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full bg-[#3B1EFF]" />
              <span>{apiError}</span>
            </div>
          </div>
        )}

        <div>
          <label
            htmlFor="login-email"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#D7E8FA]/80"
          >
            Email address
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@company.com"
            aria-invalid={Boolean(fieldErrors.email)}
            className="w-full rounded-xl border border-[#D7E8FA]/20 bg-[#292B3A] px-4 py-3 text-sm text-[#D7E8FA] placeholder-[#D7E8FA]/40 transition outline-none focus:border-[#3B1EFF] focus:ring-2 focus:ring-[#3B1EFF]/40"
          />
          {fieldErrors.email && (
            <p className="mt-1.5 text-xs font-medium text-[#D7E8FA]/90">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="login-password"
              className="block text-xs font-semibold uppercase tracking-wider text-[#D7E8FA]/80"
            >
              Password
            </label>
          </div>
          <div className="relative">
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              aria-invalid={Boolean(fieldErrors.password)}
              className="w-full rounded-xl border border-[#D7E8FA]/20 bg-[#292B3A] px-4 py-3 pr-16 text-sm text-[#D7E8FA] placeholder-[#D7E8FA]/40 transition outline-none focus:border-[#3B1EFF] focus:ring-2 focus:ring-[#3B1EFF]/40"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-3 my-auto h-7 rounded-md px-2 text-xs font-medium text-[#D7E8FA]/70 transition hover:text-[#D7E8FA]"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="mt-1.5 text-xs font-medium text-[#D7E8FA]/90">
              {fieldErrors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#3B1EFF] px-4 py-3 text-sm font-semibold text-[#D7E8FA] shadow-lg shadow-[#3B1EFF]/30 transition hover:brightness-110 focus:ring-2 focus:ring-[#00FFBA]/60 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#D7E8FA]/30 border-t-[#D7E8FA]" />
              Signing in...
            </>
          ) : (
            "Sign in to TestPilot"
          )}
        </button>
      </form>
    </AuthLayout>
  );
}

