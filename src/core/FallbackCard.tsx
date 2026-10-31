import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export type FallbackKind =
  | 'unknown-experience'
  | 'unsupported-version'
  | 'failed';

type Props = {
  kind: FallbackKind;
  title?: string;
  detail?: string;
  onRetry?: () => void;
};

const defaultTitles: Record<FallbackKind, string> = {
  'unknown-experience': 'Experience unavailable',
  'unsupported-version': 'Version unavailable',
  failed: 'This experience hit a problem',
};

export function FallbackCard({
  kind,
  title,
  detail,
  onRetry,
}: Props): React.JSX.Element {
  return (
    <View accessibilityRole="alert" style={styles.container}>
      <View style={styles.marker} />
      <View style={styles.content}>
        <Text style={styles.title}>{title ?? defaultTitles[kind]}</Text>
        {detail ? <Text style={styles.detail}>{detail}</Text> : null}
        {onRetry ? (
          <Pressable
            accessibilityRole="button"
            onPress={onRetry}
            style={({ pressed }) => [styles.retry, pressed && styles.pressed]}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFF8F5',
    borderColor: '#E8C9BF',
    borderWidth: 1,
    borderRadius: 6,
    padding: 14,
    marginVertical: 8,
  },
  marker: {
    width: 4,
    backgroundColor: '#C45A43',
    borderRadius: 2,
    marginRight: 12,
  },
  content: {
    flex: 1,
    gap: 6,
  },
  title: {
    color: '#3A2925',
    fontSize: 15,
    fontWeight: '700',
  },
  detail: {
    color: '#705B55',
    fontSize: 13,
    lineHeight: 18,
  },
  retry: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#3E675F',
    borderRadius: 4,
  },
  pressed: {
    opacity: 0.75,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});