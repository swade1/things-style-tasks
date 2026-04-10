import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Task } from '@/types'
import { WelcomeScreen } from './WelcomeScreen'
import { GoalQuestionScreen } from './GoalQuestionScreen'
import { PainPointsScreen } from './PainPointsScreen'
import { PersonalizedSolutionScreen } from './PersonalizedSolutionScreen'
import { PreferenceConfigScreen } from './PreferenceConfigScreen'
import { ProcessingMomentScreen } from './ProcessingMomentScreen'
import { AppDemoScreen } from './AppDemoScreen'
import { ValueDeliveryScreen } from './ValueDeliveryScreen'
import { AccountCreationScreen } from './AccountCreationScreen'
import { PaywallScreen } from './PaywallScreen'

interface OnboardingFlowProps {
  userId: string
  userEmail: string
  onComplete: () => void
}

type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export function OnboardingFlow({ userId, userEmail, onComplete: _onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1)
  const [_selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [selectedPains, setSelectedPains] = useState<string[]>([])
  const [_selectedPreferences, setSelectedPreferences] = useState<string[]>([])
  const [createdTasks, setCreatedTasks] = useState<Task[]>([])

  const handleGoalsContinue = (goals: string[]) => {
    setSelectedGoals(goals)
    setCurrentStep(3)
  }

  const handlePainsContinue = (pains: string[]) => {
    setSelectedPains(pains)
    setCurrentStep(4)
  }

  const handlePreferencesContinue = (preferences: string[]) => {
    setSelectedPreferences(preferences)
    setCurrentStep(6)
  }

  const handleDemoComplete = (tasks: Task[]) => {
    setCreatedTasks(tasks)
    setCurrentStep(8)
  }

  const handleSkipAccount = () => {
    // Skip directly to paywall
    setCurrentStep(10)
  }

  const getProgress = (): number => {
    return (currentStep / 10) * 100
  }

  // Slide transition variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0
    })
  }

  return (
    <div className="h-screen overflow-hidden">
      <AnimatePresence mode="wait" custom={1}>
        <motion.div
          key={currentStep}
          custom={1}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'tween', ease: 'easeInOut', duration: 0.3 },
            opacity: { duration: 0.2 }
          }}
          className="h-full"
        >
          {currentStep === 1 && (
            <WelcomeScreen onContinue={() => setCurrentStep(2)} />
          )}

          {currentStep === 2 && (
            <GoalQuestionScreen
              onContinue={handleGoalsContinue}
              progress={getProgress()}
            />
          )}

          {currentStep === 3 && (
            <PainPointsScreen
              onContinue={handlePainsContinue}
              progress={getProgress()}
            />
          )}

          {currentStep === 4 && (
            <PersonalizedSolutionScreen
              selectedPains={selectedPains}
              onContinue={() => setCurrentStep(5)}
              progress={getProgress()}
            />
          )}

          {currentStep === 5 && (
            <PreferenceConfigScreen
              onContinue={handlePreferencesContinue}
              progress={getProgress()}
            />
          )}

          {currentStep === 6 && (
            <ProcessingMomentScreen
              onComplete={() => setCurrentStep(7)}
              progress={getProgress()}
            />
          )}

          {currentStep === 7 && (
            <AppDemoScreen
              onComplete={handleDemoComplete}
              progress={getProgress()}
              userId={userId}
            />
          )}

          {currentStep === 8 && (
            <ValueDeliveryScreen
              createdTasks={createdTasks}
              onContinue={() => setCurrentStep(9)}
              progress={getProgress()}
            />
          )}

          {currentStep === 9 && (
            <AccountCreationScreen
              createdTasks={createdTasks}
              onContinue={() => setCurrentStep(10)}
              onSkip={handleSkipAccount}
              progress={getProgress()}
            />
          )}

          {currentStep === 10 && (
            <PaywallScreen
              userId={userId}
              email={userEmail}
              progress={getProgress()}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
