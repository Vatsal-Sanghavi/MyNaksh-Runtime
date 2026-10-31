import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ExperienceBoundary } from './ExperienceBoundary';
import { FallbackCard } from './FallbackCard';
import { LifecycleProvider, useExperienceLifecycle } from './lifecycle';
import { resolve } from './registry';
import type { ExperienceDefinition } from './types';

type Props = {
  definition: ExperienceDefinition;
};

type ParseResult =
  | { ok: true; config: unknown }
  | { ok: false; error: unknown };

export function ExperienceRuntime({
  definition,
}: Props): React.JSX.Element | null {
  const [attempt, setAttempt] = useState(0);

  if (!definition.enabled) {
    return null;
  }

  const resolution = resolve(definition.experience, definition.version);
  if (resolution.kind === 'unknown-experience') {
    return <FallbackCard kind="unknown-experience" />;
  }
  if (resolution.kind === 'unsupported-version') {
    return (
      <FallbackCard
        kind="unsupported-version"
        detail={`Requested ${resolution.requested}`}
      />
    );
  }

  return (
    <LifecycleProvider key={`${definition.entryPoint}:${attempt}`}>
      <RuntimeSession
        definition={definition}
        resolvedVersion={resolution.resolvedVersion}
        usedDefault={resolution.usedDefault}
        impl={resolution.impl}
        onRetry={() => setAttempt(current => current + 1)}
      />
    </LifecycleProvider>
  );
}

function RuntimeSession({
  definition,
  resolvedVersion,
  usedDefault,
  impl,
  onRetry,
}: Props & {
  resolvedVersion: string;
  usedDefault: boolean;
  impl: ReturnType<typeof resolve> extends infer _T
    ? Extract<ReturnType<typeof resolve>, { kind: 'found' }>['impl']
    : never;
  onRetry: () => void;
}): React.JSX.Element {
  const lifecycle = useExperienceLifecycle();
  const [parsed] = useState<ParseResult>(() => {
    try {
      return { ok: true, config: impl.parseConfig(definition.config) };
    } catch (error) {
      return { ok: false, error };
    }
  });

  useEffect(() => {
    if (!parsed.ok) {
      if (lifecycle.status !== 'failed') {
        lifecycle.fail(parsed.error);
      }
      return;
    }
    if (lifecycle.status === 'initializing') {
      lifecycle.loading();
    } else if (lifecycle.status === 'loading') {
      lifecycle.ready();
    }
  }, [lifecycle, parsed]);

  if (!parsed.ok || lifecycle.status === 'failed') {
    const error = parsed.ok ? lifecycle.error : parsed.error;
    return (
      <FallbackCard
        kind="failed"
        detail={error instanceof Error ? error.message : String(error)}
        onRetry={onRetry}
      />
    );
  }

  const Component = impl.Component;
  return (
    <View style={styles.experience}>
      <View style={styles.meta}>
        <Text style={styles.name}>{definition.experience}</Text>
        <Text style={styles.version}>
          {usedDefault ? `${definition.version} -> ${resolvedVersion}` : resolvedVersion}
        </Text>
        <Text style={styles.status}>{lifecycle.status}</Text>
      </View>
      <ExperienceBoundary onError={lifecycle.fail} onRetry={onRetry}>
        <Component config={parsed.config} />
      </ExperienceBoundary>
    </View>
  );
}

const styles = StyleSheet.create({
  experience: {
    marginBottom: 10,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 2,
    paddingBottom: 5,
  },
  name: {
    color: '#304B46',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  version: {
    color: '#6E7972',
    fontSize: 12,
  },
  status: {
    marginLeft: 'auto',
    color: '#6E7972',
    fontSize: 11,
    textTransform: 'uppercase',
  },
});