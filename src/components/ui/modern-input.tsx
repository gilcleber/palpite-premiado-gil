
import * as React from "react"
import { cn } from "@/lib/utils"

export interface ModernInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const ModernInput = React.forwardRef<HTMLInputElement, ModernInputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)

    const handleFocus = () => setIsFocused(true)
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      setHasValue(!!e.target.value)
      props.onBlur?.(e)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value)
      props.onChange?.(e)
    }

    return (
      <div className="relative">
        <input
          type={type}
          className={cn(
            "peer w-full px-4 pt-6 pb-2 text-base bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl",
            "focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/20",
            "transition-all duration-300 placeholder-transparent",
            "hover:border-white/30",
            error && "border-red-400 focus:border-red-400 focus:ring-red-400/20",
            className
          )}
          ref={ref}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          placeholder=" "
          {...props}
        />
        {label && (
          <label
            className={cn(
              "absolute left-4 transition-all duration-300 pointer-events-none text-white/60",
              "peer-placeholder-shown:top-4 peer-placeholder-shown:text-base",
              "peer-focus:top-2 peer-focus:text-xs peer-focus:text-white/80",
              (isFocused || hasValue || props.value) && "top-2 text-xs text-white/80"
            )}
          >
            {label}
          </label>
        )}
        {error && (
          <p className="mt-1 text-xs text-red-300 animate-fade-in">
            {error}
          </p>
        )}
      </div>
    )
  }
)
ModernInput.displayName = "ModernInput"

export { ModernInput }
