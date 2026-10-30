import { StyleSheet, View } from 'react-native'

import { type FlxRnStepperHeaderData } from '@flowx/react-native-sdk'

// Replaces the default stepper band whole. The SDK adds no padding and no a11y
// here — it only wraps the band in the all-steps picker tap. Launch-time only.

const BAND_HEIGHT = 4

// Swap for theme values to follow the process theme.
const TRACK_COLOR = '#e7e0ec'
const PROGRESS_COLOR = '#0000ff'

// Guards a malformed definition painting NaN.
const ratio = (value: number, total: number | undefined): number =>
  total && total > 0 ? Math.min(Math.max(value / total, 0), 1) : 0

export const customStepperHeaderProvider = ({
  step,
  totalSteps,
  stepTitle,
  substep,
  totalSubsteps,
  substepTitle,
}: FlxRnStepperHeaderData) => {
  // 1-based: step N of M fills N/M.
  const mainProgress = ratio(step, totalSteps)

  // A sub-step advances only inside its own step's slice, making the value
  // absolute — so one bar carries both levels.
  const previous = ratio(Math.max(step - 1, 0), totalSteps)
  const slice = Math.max(mainProgress - previous, 0)
  const progress = substep == null ? mainProgress : previous + ratio(substep, totalSubsteps) * slice

  return (
    <View
      style={styles.track}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={[stepTitle, substepTitle].filter(Boolean).join(', ') || undefined}
      accessibilityValue={{ text: `${step} of ${totalSteps}` }}
    >
      <View style={[styles.progress, { width: `${progress * 100}%` }]} />
    </View>
  )
}

const styles = StyleSheet.create({
  track: { width: '100%', height: BAND_HEIGHT, backgroundColor: TRACK_COLOR },
  progress: { height: BAND_HEIGHT, backgroundColor: PROGRESS_COLOR },
})
