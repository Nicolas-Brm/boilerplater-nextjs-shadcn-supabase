"use client"

import React, { useId, useState, forwardRef } from "react"
import { PhoneIcon, CheckIcon, AlertCircleIcon } from "lucide-react"
import * as RPNInput from "react-phone-number-input"
import flags from "react-phone-number-input/flags"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { Badge } from "./ui/badge"

interface InputPhoneNumberProps {
  value?: string
  onChange?: (value: string | undefined) => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: string
  label?: string
  description?: string
  className?: string
  name?: string
  id?: string
  showValidation?: boolean
  validator?: (value: string) => boolean
}

const InputPhoneNumber = forwardRef<HTMLInputElement, InputPhoneNumberProps>(
  ({
    value,
    onChange,
    onBlur,
    placeholder = "Enter phone number",
    disabled = false,
    required = false,
    error,
    label = "Phone Number",
    description,
    className,
    name,
    id: propId,
    showValidation = true,
    validator,
    ...props
  }, ref) => {
    const generatedId = useId()
    const id = propId || generatedId
    const [isFocused, setIsFocused] = useState(false)
    const [isValid, setIsValid] = useState<boolean | null>(null)

    const normalizeValue = (val: string | undefined): string | undefined => {
      if (!val) return val
      if (/^\+[1-9]\d{1,14}$/.test(val)) return val
      const cleaned = val.replace(/\D/g, '')
      return cleaned.length >= 10 ? `+${cleaned}` : val
    }

    const handleChange = (newValue: string | undefined) => {
      onChange?.(newValue)
      if (newValue && showValidation) {
        const validationResult = validator ? validator(newValue) : newValue.length >= 10 && /^\+/.test(newValue)
        setIsValid(validationResult)
      } else {
        setIsValid(null)
      }
    }

    const handleFocus = () => setIsFocused(true)
    const handleBlur = () => {
      setIsFocused(false)
      onBlur?.()
    }

    const hasError = !!error
    const hasValue = !!value
    const showValidIcon = showValidation && isValid && hasValue && !hasError

    return (
      <div className={cn("space-y-2", className)} dir="ltr">
        {label && (
          <Label 
            htmlFor={id}
            className={cn(
              "text-sm font-medium transition-colors",
              hasError && "text-destructive",
              required && "after:content-['*'] after:ml-1 after:text-destructive"
            )}
          >
            {label}
          </Label>
        )}
        
        <div className="relative">
          <RPNInput.default
            className={cn(
              "flex rounded-md shadow-xs transition-all duration-200 border border-input overflow-hidden",
              "focus-within:ring-2 focus-within:ring-ring/50 focus-within:border-ring",
              hasError && "border-destructive focus-within:border-destructive focus-within:ring-destructive/20",
              disabled && "opacity-50 cursor-not-allowed",
              isFocused && "ring-2 ring-ring/50 border-ring",
              "hover:border-ring/60"
            )}
            international
            flagComponent={FlagComponent}
            countrySelectComponent={CountrySelect}
            inputComponent={React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
              function InputComponent(props, inputRef) {
                return <PhoneInput {...props} ref={inputRef || ref} />
              }
            )}
            id={id}
            name={name}
            placeholder={placeholder}
            value={normalizeValue(value)}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            {...props}
          />
          
          {showValidation && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center z-10">
              {showValidIcon && (
                <CheckIcon className="h-4 w-4 text-green-600" aria-hidden="true" />
              )}
              {hasError && (
                <AlertCircleIcon className="h-4 w-4 text-destructive" aria-hidden="true" />
              )}
            </div>
          )}
        </div>

        {description && !error && (
          <p className="text-sm text-muted-foreground" id={`${id}-description`}>
            {description}
          </p>
        )}

        {error && (
          <p 
            className="text-sm text-destructive flex items-center gap-1.5" 
            id={`${id}-error`}
            role="alert"
            aria-live="polite"
          >
            <AlertCircleIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}
      </div>
    )
  }
)

InputPhoneNumber.displayName = "InputPhoneNumber"

const PhoneInput = forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => (
    <Input
      data-slot="phone-input"
      className={cn(
        "rounded-none rounded-r-md shadow-none focus-visible:z-10 border-0 focus-visible:ring-0 focus-visible:border-0",
        "pl-3 pr-10 flex-1",
        "bg-transparent h-9",
        className
      )}
      ref={ref}
      {...props}
    />
  )
)

PhoneInput.displayName = "PhoneInput"

type CountrySelectProps = {
  disabled?: boolean
  value: RPNInput.Country
  onChange: (value: RPNInput.Country) => void
  options: { label: string; value: RPNInput.Country | undefined }[]
}

const CountrySelect = ({
  disabled,
  value,
  onChange,
  options,
}: CountrySelectProps) => {
  const validOptions = options.filter((x) => x.value)
  const currentCountry = value || validOptions[0]?.value || ''

  const handleValueChange = (newValue: string) => {
    onChange(newValue as RPNInput.Country)
  }

  const getCurrentCountryName = () => {
    const option = validOptions.find(opt => opt.value === value)
    return option?.label || value || ''
  }

  return (
    <div className="flex items-center h-9">
      <Select
        value={currentCountry}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger 
          className={cn(
            "w-auto min-w-[80px] max-w-[120px] border-0 rounded-none rounded-l-md shadow-none",
            "focus:ring-0 focus:ring-offset-0 bg-transparent px-2 h-9",
            "hover:bg-accent/50 data-[state=open]:bg-accent/30",
            "border-r border-input"
          )}
          aria-label="Select country"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <FlagComponent 
              country={value} 
              countryName={getCurrentCountryName()} 
            />
          </div>
        </SelectTrigger>
        
        <SelectContent className="max-h-[300px] w-[280px]">
          {validOptions.map((option) => (
            option.value && (
              <SelectItem 
                key={option.value} 
                value={option.value}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-3 w-full">
                  <FlagComponent 
                    country={option.value} 
                    countryName={option.label} 
                  />
                  <span className="flex-1 truncate text-sm">{option.label}</span>
                  <span className="text-muted-foreground text-xs ml-auto">
                    +{RPNInput.getCountryCallingCode(option.value)}
                  </span>
                </div>
              </SelectItem>
            )
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country]

  return (
    <Badge variant="outline" >
      {Flag ? (
        <Flag title={countryName} />
      ) : (
        <PhoneIcon 
          size={10} 
          aria-hidden="true" 
          className="text-muted-foreground"
        />
      )}
    </Badge>
  )
}

export default InputPhoneNumber
export type { InputPhoneNumberProps }
