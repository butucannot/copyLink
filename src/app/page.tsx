"use client";
import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import type { ChangeEvent, FormEvent } from "react";
import { GoogleIcon } from "@/components/icons";
import { AppleIcon } from "@/components/icons";
import { FooterLink } from "@/components/FooterLink";

// Types
interface FormErrors {
  email?: string;
  verificationCode?: string;
}

interface ThemeConfig {
  background: string;
  cardBg: string;
  textColor: string;
  borderColor: string;
  inputBg: string;
  placeholderColor: string;
}

// Constants
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VERIFICATION_CODE_REGEX = /^\d{6}$/;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isEmailWritten, setIsEmailWritten] = useState(false);
  const [isCodeWritten, setIsCodeWritten] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStep = searchParams.get("authStep") || "enter-email";

  // Memoized values
  const themeConfig: ThemeConfig = useMemo(
    () => ({
      background: isDarkMode
        ? "linear-gradient(45deg, #4f46e5, #7c3aed, #9333ea)"
        : "linear-gradient(to bottom right, #f5f3ff, #e9d5ff)",
      cardBg: isDarkMode ? "bg-black" : "bg-white",
      textColor: isDarkMode ? "text-white" : "text-gray-900",
      borderColor: isDarkMode ? "border-gray-600" : "border-gray-300",
      inputBg: isDarkMode ? "bg-black" : "bg-gray-50",
      placeholderColor: isDarkMode
        ? "placeholder-gray-500"
        : "placeholder-gray-400",
    }),
    [isDarkMode]
  );

  // Validation
  const validateEmail = useCallback((email: string): string | undefined => {
    if (!email.trim()) {
      return "Email обязателен";
    }
    if (!EMAIL_REGEX.test(email)) {
      return "Введите корректный email";
    }
    return undefined;
  }, []);

  const validateVerificationCode = useCallback(
    (code: string): string | undefined => {
      if (!code.trim()) {
        return "Код подтверждения обязателен";
      }
      if (!VERIFICATION_CODE_REGEX.test(code)) {
        return "Введите 6-значный код";
      }
      return undefined;
    },
    []
  );

  // Handlers
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!email || isSubmitting) return;

      const emailError = validateEmail(email);
      if (emailError) {
        setErrors({ email: emailError });
        return;
      }

      setIsSubmitting(true);
      setErrors({});

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        router.push(
          `?authStep=verify-email&email=${encodeURIComponent(email.trim())}`
        );
      } catch (error) {
        setErrors({ email: "Произошла ошибка. Попробуйте еще раз." });
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, isSubmitting, validateEmail, router]
  );

  const handleEmailChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setEmail(value);
      setIsEmailWritten(value.trim().length > 0);

      // Clear error when user starts typing
      if (errors.email) {
        setErrors((prev) => ({ ...prev, email: undefined }));
      }
    },
    [errors.email]
  );

  const handleVerificationCodeChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/\D/g, "").slice(0, 6); // Only allow digits, max 6
      setVerificationCode(value);
      setIsCodeWritten(value.length === 6);

      // Clear error when user starts typing
      if (errors.verificationCode) {
        setErrors((prev) => ({ ...prev, verificationCode: undefined }));
      }
    },
    [errors.verificationCode]
  );

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => !prev);
    // Save theme preference to localStorage
    try {
      localStorage.setItem("theme", (!isDarkMode).toString());
    } catch (error) {
      console.warn("Failed to save theme preference");
    }
  }, [isDarkMode]);

  const handleSocialLogin = useCallback((provider: "google" | "apple") => {
    // In a real app, this would redirect to OAuth provider
    console.log(`Redirecting to ${provider} OAuth`);
    // For demo purposes, show alert
    alert(
      `Перенаправление на ${provider === "google" ? "Google" : "Apple"} OAuth`
    );
  }, []);

  const goBack = useCallback(() => {
    router.push("?authStep=enter-email");
  }, [router]);

  // Load theme preference on mount
  useState(() => {
    try {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === "true");
      }
    } catch (error) {
      console.warn("Failed to load theme preference");
    }
  });

  // Common background animation component
  const AnimatedBackground = useCallback(
    ({ children }: { children: React.ReactNode }) => (
      <motion.div
        className={`flex items-center justify-center p-5 min-h-screen ${themeConfig.textColor}`}
        animate={{
          background: themeConfig.background,
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear",
        }}
      >
        {children}
      </motion.div>
    ),
    [isDarkMode, themeConfig]
  );

  // Common card component
  const Card = useCallback(
    ({ children }: { children: React.ReactNode }) => (
      <div
        className={`w-full max-w-lg p-10 rounded-3xl shadow-2xl transition-all duration-300 ${themeConfig.cardBg} ${themeConfig.textColor}`}
      >
        <div className="w-3/4 mx-auto">{children}</div>
      </div>
    ),
    [themeConfig]
  );

  // Logo component
  const Logo = useCallback(
    () => (
      <div className="text-center mb-10">
        <div className="text-3xl font-light tracking-tight">
          igor<span className="text-amber-500">/</span>ink
          <div className="text-emerald-500 italic font-normal">premium</div>
        </div>
      </div>
    ),
    []
  );

  // Theme toggle component
  const ThemeToggle = useCallback(
    () => (
      <div
        className={`flex items-center justify-center gap-3 p-3 rounded-xl border mb-8 transition-all duration-300 ${
          isDarkMode
            ? "bg-black border-gray-600"
            : "bg-gray-100 border-gray-300"
        }`}
      >
        <span className="text-gray-400 text-sm transition-all duration-300">
          {isDarkMode ? "Включить свет" : "Выключить свет"}
        </span>
        <button
          onClick={toggleTheme}
          aria-label={
            isDarkMode
              ? "Переключить на светлую тему"
              : "Переключить на темную тему"
          }
          className={`relative w-11 h-6 rounded-full transition-all duration-300 cursor-pointer ${
            isDarkMode ? "bg-purple-500" : "bg-gray-400"
          }`}
        >
          <div
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all duration-300 ${
              isDarkMode ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
    ),
    [isDarkMode, toggleTheme]
  );

  // Footer component
  const Footer = useCallback(
    () => (
      <div className="pt-6">
        <div className="text-center text-xs mb-4">
          Igor Link™ Premium © 2025
        </div>
        <div className="flex justify-between gap-4 text-xs">
          <FooterLink
            href="https://t.me/IgorLinkPremiumSupportBot"
            isDarkMode={isDarkMode}
          >
            Техподдержка
          </FooterLink>
          <FooterLink href="https://igorlink.com/legal" isDarkMode={isDarkMode}>
            Юридическая информация
          </FooterLink>
          <FooterLink
            href="https://igorlink.com/applications"
            isDarkMode={isDarkMode}
          >
            Приложения
          </FooterLink>
        </div>
      </div>
    ),
    [isDarkMode]
  );

  // Step 1: Email Input
  if (currentStep === "enter-email") {
    return (
      <AnimatedBackground>
        <Card>
          <Logo />

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="mb-6" noValidate>
            <div className="mb-5 relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Введите ваш email"
                className={`w-full px-4 py-4 rounded-xl border transition-colors duration-200 text-base outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.email
                    ? "border-red-500 focus:ring-red-500"
                    : themeConfig.borderColor
                } ${themeConfig.inputBg} ${themeConfig.textColor} ${
                  themeConfig.placeholderColor
                }`}
                required
                aria-describedby={errors.email ? "email-error" : undefined}
                disabled={isSubmitting}
              />
              <label
                htmlFor="email"
                className={`absolute -top-2 left-4 px-2 text-sm transition-colors duration-200 ${
                  isDarkMode
                    ? "bg-black text-gray-400"
                    : "bg-white text-gray-600"
                }`}
              >
                Ваш email
              </label>
              {errors.email && (
                <p id="email-error" className="text-red-500 text-sm mt-1">
                  {errors.email}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={!isEmailWritten || isSubmitting}
              aria-label="Продолжить регистрацию"
              className={`w-full py-4 rounded-xl font-medium text-base transition-colors duration-200 mb-6 ${
                isEmailWritten && !isSubmitting
                  ? isDarkMode
                    ? "bg-[#1C1C1C] hover:bg-gray-600 text-white"
                    : "bg-gray-600 hover:bg-gray-700 text-white"
                  : isDarkMode
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? "Отправка..." : "Продолжить"}
            </button>
          </form>

          {/* Social Buttons */}
          <div className="text-center text-gray-400 text-sm mb-6">или</div>
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleSocialLogin("google")}
              disabled={isSubmitting}
              aria-label="Войти через Google"
              className={`w-full py-4 rounded-xl font-medium text-base transition-colors duration-200 flex items-center justify-center gap-3 ${
                isDarkMode
                  ? "bg-white hover:bg-gray-50 text-gray-900"
                  : "bg-black hover:bg-gray-800 text-white"
              }`}
            >
              <GoogleIcon />
              Войти через Google
            </button>
            <button
              onClick={() => handleSocialLogin("apple")}
              disabled={isSubmitting}
              aria-label="Войти через Apple"
              className={`w-full py-4 rounded-xl font-medium text-base transition-colors duration-200 flex items-center justify-center gap-3 ${
                isDarkMode
                  ? "bg-white hover:bg-gray-50 text-gray-900"
                  : "bg-black hover:bg-gray-800 text-white"
              }`}
            >
              <AppleIcon isDarkMode={isDarkMode} />
              Войти через Apple
            </button>
          </div>

          <ThemeToggle />
          <Footer />
        </Card>
      </AnimatedBackground>
    );
  }

  // Step 2: Email Verification
  if (currentStep === "verify-email") {
    const userEmail = searchParams.get("email") || email;

    return (
      <AnimatedBackground>
        <Card>
          <Logo />

          <div
            className={`bg-[#1C1C1C] p-8 rounded-lg ${
              isDarkMode ? "bg-[#1C1C1C]" : "bg-[#99A1AF]"
            }`}
          >
            <div className="flex items-center justify-between w-full max-w-[280px] mx-auto">
              {/* Step 1 - Active */}
              <div className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full border-2    flex items-center justify-center text-sm font-medium ${
                      isDarkMode
                        ? "bg-white text-gray-900 border-white"
                        : "bg-black text-white border-black"
                    }`}
                  >
                    1
                  </div>
                  <span
                    className={`mt-2 text-sm ${
                      isDarkMode ? "text-white" : "text-black"
                    }`}
                  >
                    Почта
                  </span>
                </div>
                <div className="w-10 h-px bg-gray-600 mx-2 mt-[-20px]" />
              </div>
              {/* Step 2 - Inactive */}
              <div className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full border-2 border-gray-500 text-gray-400 flex items-center justify-center text-sm font-medium ${
                      isDarkMode
                        ? "text-gray-400 border-white"
                        : " text-white border-black"
                    }`}
                  >
                    2
                  </div>
                  <span
                    className={`mt-2 text-sm ${
                      isDarkMode ? "text-gray-400" : "text-black-800"
                    }`}
                  >
                    Пароль
                  </span>
                </div>
                <div className="w-10 h-px bg-gray-600 mx-2 mt-[-20px]" />
              </div>
              {/* Step 3 - Inactive */}
              <div className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full border-2 border-gray-500 text-gray-400 flex items-center justify-center text-sm font-medium ${
                      isDarkMode
                        ? " text-gray-400 border-white"
                        : " text-white border-black"
                    }`}
                  >
                    3
                  </div>
                  <span
                    className={`mt-2 text-sm ${
                      isDarkMode ? "text-gray-400" : "text-black-800"
                    }`}
                  >
                    Завершение
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-6">Подтвердите email</h2>
            <div className="mb-6">
              <p className="font-medium mb-1">Ваш email</p>
              <p className="text-gray-400">{userEmail}</p>
              <p className="text-sm text-gray-500 mt-2">
                На этот адрес будут приходить чеки о покупках
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => router.push("?authStep=complete")}
                disabled={isLoading}
                aria-label="Получить код подтверждения"
                className={`w-full py-4 rounded-xl font-medium text-base transition-colors duration-200 ${
                  isDarkMode
                    ? "bg-[#1C1C1C] hover:bg-gray-600 text-white"
                    : "bg-gray-600 hover:bg-gray-700 text-white"
                }`}
              >
                {isLoading ? "Отправка..." : "Получить код"}
              </button>
              <button
                onClick={goBack}
                disabled={isLoading}
                aria-label="Вернуться к вводу email"
                className={`w-full py-2 rounded-lg font-medium text-sm transition-colors duration-200 ${
                  isDarkMode
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                ← Назад
              </button>
            </div>
          </div>
        </Card>
      </AnimatedBackground>
    );
  }

  // Step 3: Completion
  return (
    <AnimatedBackground>
      <Card>
        <Logo />

        <div className="mb-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Регистрация завершена!</h2>
          <p className="mb-6">
            На адрес <span className="font-medium">{email}</span> отправлено
            письмо с кодом подтверждения.
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!verificationCode || isSubmitting) return;

              const codeError = validateVerificationCode(verificationCode);
              if (codeError) {
                setErrors({ verificationCode: codeError });
                return;
              }

              setIsSubmitting(true);
              setErrors({});

              try {
                // Simulate API call for code verification
                await new Promise((resolve) => setTimeout(resolve, 1000));
                // Here you would typically verify the code with your backend
                console.log("Verifying code:", verificationCode);
                // For demo purposes, just show success
                alert("Код подтвержден! Регистрация завершена.");
              } catch (error) {
                setErrors({
                  verificationCode: "Неверный код. Попробуйте еще раз.",
                });
              } finally {
                setIsSubmitting(false);
              }
            }}
            className="mb-6"
            noValidate
          >
            <div className="mb-5 relative">
              <input
                type="text"
                id="verificationCode"
                value={verificationCode}
                onChange={handleVerificationCodeChange}
                placeholder="000000"
                maxLength={6}
                className={`w-full px-4 py-4 rounded-xl border transition-colors duration-200 text-base outline-none focus:ring-2 focus:ring-purple-500 text-center tracking-widest ${
                  errors.verificationCode
                    ? "border-red-500 focus:ring-red-500"
                    : themeConfig.borderColor
                } ${themeConfig.inputBg} ${themeConfig.textColor} ${
                  themeConfig.placeholderColor
                }`}
                required
                aria-describedby={
                  errors.verificationCode
                    ? "verification-code-error"
                    : undefined
                }
                disabled={isSubmitting}
              />
              <label
                htmlFor="verificationCode"
                className={`absolute -top-2 left-4 px-2 text-sm transition-colors duration-200 ${
                  isDarkMode
                    ? "bg-black text-gray-400"
                    : "bg-white text-gray-600"
                }`}
              >
                Код подтверждения
              </label>
              {errors.verificationCode && (
                <p
                  id="verification-code-error"
                  className="text-red-500 text-sm mt-1"
                >
                  {errors.verificationCode}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={!isCodeWritten || isSubmitting}
              aria-label="Подтвердить код"
              className={`w-full py-4 rounded-xl font-medium text-base transition-colors duration-200 mb-6 ${
                isCodeWritten && !isSubmitting
                  ? isDarkMode
                    ? "bg-[#1C1C1C] hover:bg-gray-600 text-white"
                    : "bg-gray-600 hover:bg-gray-700 text-white"
                  : isDarkMode
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? "Проверка..." : "Подтвердить"}
            </button>
          </form>

          <button
            onClick={goBack}
            aria-label="Вернуться к началу регистрации"
            className={`px-6 py-2 rounded-lg font-medium ${
              isDarkMode
                ? "bg-[#1C1C1C] hover:bg-gray-600 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            }`}
          >
            Вернуться
          </button>
        </div>
      </Card>
    </AnimatedBackground>
  );
}
