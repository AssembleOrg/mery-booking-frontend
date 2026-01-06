'use client';

import { motion } from 'framer-motion';
import classes from './ReservaModal.module.css';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className={classes.stepIndicator}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <div key={stepNumber} className={classes.stepIndicatorItem}>
            {/* Círculo */}
            <motion.div
              className={`${classes.stepCircle} ${
                isActive ? classes.stepCircleActive : ''
              } ${isCompleted ? classes.stepCircleCompleted : ''}`}
              initial={false}
              animate={{
                scale: isActive ? 1.1 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              {isCompleted ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M13.3 4.7L6 12L2.7 8.7"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <span className={classes.stepNumber}>{stepNumber}</span>
              )}
            </motion.div>

            {/* Línea conectora */}
            {stepNumber < totalSteps && (
              <div
                className={`${classes.stepLine} ${
                  isCompleted ? classes.stepLineCompleted : ''
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
