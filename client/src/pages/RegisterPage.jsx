import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/useAuth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordChecks = [
    {
      label: "At least 8 characters",
      passed: formData.password.length >= 8,
    },
    {
      label: "Contains a letter",
      passed: /[a-zA-Z]/.test(formData.password),
    },
    {
      label: "Contains a number",
      passed: /\d/.test(formData.password),
    },
  ];

  const validate = () => {
    const errors = {};
    const name = formData.name.trim();
    const email = formData.email.trim();
    const { password, confirmPassword } = formData;

    if (!name) {
      errors.name = "Name is required";
    } else if (name.length < 2 || name.length > 80) {
      errors.name = "Name must be between 2 and 80 characters";
    }

    if (!email) {
      errors.email = "Email is required";
    } else if (!EMAIL_REGEX.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8 || password.length > 128) {
      errors.password = "Password must be between 8 and 128 characters";
    } else if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
      errors.password = "Password must include at least one letter and one number";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (confirmPassword !== password) {
      errors.confirmPassword = "Passwords do not match";
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
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      navigate("/dashboard", { replace: true });
    } catch (error) {
      if (error.errors) {
        setFieldErrors((prev) => ({ ...prev, ...error.errors }));
      }
      setApiError(error.message || "Unable to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start running autonomous browser tests with TestPilot."
      footer={
        <>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#00FFBA] underline-offset-4 transition hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
            htmlFor="register-name"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#D7E8FA]/80"
          >
            Full name
          </label>
          <input
            id="register-name"
            name="name"
            type="text"
            autoComplete="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Alex Rivera"
            aria-invalid={Boolean(fieldErrors.name)}
            className="w-full rounded-xl border border-[#D7E8FA]/20 bg-[#292B3A] px-4 py-3 text-sm text-[#D7E8FA] placeholder-[#D7E8FA]/40 transition outline-none focus:border-[#3B1EFF] focus:ring-2 focus:ring-[#3B1EFF]/40"
          />
          {fieldErrors.name && (
            <p className="mt-1.5 text-xs font-medium text-[#D7E8FA]/90">
              {fieldErrors.name}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="register-email"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#D7E8FA]/80"
          >
            Work email
          </label>
          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="alex@company.com"
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
          <label
            htmlFor="register-password"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#D7E8FA]/80"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="register-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
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

          <ul className="mt-2.5 grid grid-cols-1 gap-1.5 sm:grid-cols-3">
            {passwordChecks.map((rule) => (
              <li
                key={rule.label}
                className={`flex items-center gap-1.5 text-[11px] font-medium transition ${
                  rule.passed ? "text-[#00FFBA]" : "text-[#D7E8FA]/50"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    rule.passed ? "bg-[#00FFBA]" : "bg-[#D7E8FA]/30"
                  }`}
                />
                {rule.label}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <label
            htmlFor="register-confirm-password"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#D7E8FA]/80"
          >
            Confirm password
          </label>
          <input
            id="register-confirm-password"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password"
            aria-invalid={Boolean(fieldErrors.confirmPassword)}
            className="w-full rounded-xl border border-[#D7E8FA]/20 bg-[#292B3A] px-4 py-3 text-sm text-[#D7E8FA] placeholder-[#D7E8FA]/40 transition outline-none focus:border-[#3B1EFF] focus:ring-2 focus:ring-[#3B1EFF]/40"
          />
          {fieldErrors.confirmPassword && (
            <p className="mt-1.5 text-xs font-medium text-[#D7E8FA]/90">
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#3B1EFF] px-4 py-3 text-sm font-semibold text-[#D7E8FA] shadow-lg shadow-[#3B1EFF]/30 transition hover:brightness-110 focus:ring-2 focus:ring-[#00FFBA]/60 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#D7E8FA]/30 border-t-[#D7E8FA]" />
              Creating account...
            </>
          ) : (
            "Create TestPilot account"
          )}
        </button>
      </form>
    </AuthLayout>
  );
}

