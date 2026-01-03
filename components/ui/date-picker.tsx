"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon, ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: string // YYYY-MM-DD format
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const date = value ? new Date(value) : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          id="date"
          className={cn(
            "w-full justify-between font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <span className="flex items-center">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? date.toLocaleDateString() : placeholder}
          </span>
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            if (selectedDate) {
              const formatted = format(selectedDate, "yyyy-MM-dd")
              onChange(formatted)
              setOpen(false)
            }
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

