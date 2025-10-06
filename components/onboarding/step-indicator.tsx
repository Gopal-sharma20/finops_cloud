"use client"

import React from "react"
import { Check, Circle, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  id: string
  title: string
  description: string
  optional?: boolean
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
  className?: string
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  className
}) => {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isUpcoming = index > currentStep

          return (
            <div key={step.id} className="flex flex-col items-center flex-1">
              {/* Step Circle */}
              <div className="relative">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                    isCompleted &&
                      "bg-financial-profit-600 border-financial-profit-600",
                    isCurrent &&
                      "bg-primary border-primary ring-4 ring-primary/20",
                    isUpcoming && "bg-background border-muted-foreground/30"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5 text-white" />
                  ) : isCurrent ? (
                    <Circle className="h-5 w-5 text-white fill-current" />
                  ) : (
                    <span className="text-sm font-medium text-muted-foreground">
                      {index + 1}
                    </span>
                  )}
                </div>

                {step.optional && (
                  <div className="absolute -top-1 -right-1 bg-financial-warning-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    ?
                  </div>
                )}
              </div>

              {/* Step Content */}
              <div className="text-center mt-3 space-y-1">
                <h3
                  className={cn(
                    "text-sm font-medium",
                    isCompleted && "text-financial-profit-700",
                    isCurrent && "text-foreground",
                    isUpcoming && "text-muted-foreground"
                  )}
                >
                  {step.title}
                </h3>
                <p
                  className={cn(
                    "text-xs",
                    isCompleted && "text-financial-profit-600",
                    isCurrent && "text-muted-foreground",
                    isUpcoming && "text-muted-foreground/60"
                  )}
                >
                  {step.description}
                </p>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute top-5 h-0.5 bg-muted-foreground/30 transition-all duration-200",
                    isCompleted && "bg-financial-profit-600",
                    "left-10 right-0"
                  )}
                  style={{
                    width: `calc(100% - 2.5rem)`,
                    transform: "translateX(2.5rem)"
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { StepIndicator, type Step }