import { ActivityIndicator, StyleSheet, View, useWindowDimensions } from 'react-native'

import { type FlxCustomLoader } from '@flowx/react-native-sdk'
import { FlxText } from '@flowx/react-native-ui-toolkit'

// Host loaders per kind, rendered with no SDK scrim and no card — the host owns
// every pixel, so HostLoader paints its own scrim and card. A kind left out
// falls back to the SDK loader. Registered at launch, so changes need a restart.

// Matches the SDK default loader's card width (232/402).
const CARD_WIDTH_FRACTION = 0.5771

type HostLoaderProps = {
  label: string
  color: string
}

const HostLoader = ({ label, color }: HostLoaderProps) => {
  const { width } = useWindowDimensions()
  return (
    <View style={styles.scrim}>
      <View
        style={[
          styles.card,
          { backgroundColor: color, width: Math.round(width * CARD_WIDTH_FRACTION) },
        ]}
      >
        <ActivityIndicator size="large" color="#ffffff" />
        <FlxText variant="p1" color="#ffffff">
          {label}
        </FlxText>
      </View>
    </View>
  )
}

export const customLoader: FlxCustomLoader = {
  startProcess: <HostLoader label="Starting process…" color="#1b1b3a" />,
  reloadProcess: <HostLoader label="Reloading process…" color="#7a4a00" />,
  // Covers any blocksUi action loader.
  defaultAction: <HostLoader label="Working…" color="#0b6b4f" />,
  defaultUpload: <HostLoader label="Uploading…" color="#12507a" />,
  // Keyed by action name; wins over defaultAction. Use a real blocksUi action.
  actions: {
    submitForm: <HostLoader label="Submitting your form…" color="#8a2b6b" />,
  },
}

const styles = StyleSheet.create({
  // Absolute fill, not flex: 1 — the SDK centers custom content, so a flex child
  // collapses to its content width instead of covering the screen.
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  card: {
    minHeight: 100,
    padding: 24,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
})
