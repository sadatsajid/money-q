"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface MonthPickerProps {
  value?: string // YYYY-MM format
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function MonthPicker({
  value,
  onChange,
  placeholder = "Select month",
  className,
  disabled,
}: MonthPickerProps) {
  const [open, setOpen] = React.useState(false)
  
  // Parse YYYY-MM to Date (first day of month)
  const date = value
    ? new Date(parseInt(value.split("-")[0]), parseInt(value.split("-")[1]) - 1, 1)
    : undefined

  const displayValue = date
    ? format(date, "MMMM yyyy")
    : placeholder

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full sm:w-auto sm:min-w-[180px] justify-between font-normal text-sm sm:text-base",
            !date && "text-muted-foreground",
            className
          )}
        >
          <div className="flex items-center min-w-0 flex-1">
            <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="truncate sm:whitespace-nowrap">{displayValue}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            if (selectedDate) {
              const year = selectedDate.getFullYear()
              const month = String(selectedDate.getMonth() + 1).padStart(2, "0")
              const formatted = `${year}-${month}`
              onChange(formatted)
              setOpen(false)
            }
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}



