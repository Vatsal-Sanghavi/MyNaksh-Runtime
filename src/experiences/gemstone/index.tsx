import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useExperienceLifecycle } from '../../core/lifecycle';
import type { ExperienceModule, ExperienceVersionImpl } from '../../core/types';
import { recommendGemstone } from './api';

type GemstoneConfig = {
  recommendationMode: 'calm' | 'focus';
  simulateFailure: boolean;
};

function parseConfig(raw: unknown): GemstoneConfig {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Gemstone config must be an object.');
  }
  const config = raw as Partial<GemstoneConfig>;
  if (config.recommendationMode !== 'calm' && config.recommendationMode !== 'focus') {
    throw new Error('recommendationMode must be calm or focus.');
  }
  if (typeof config.simulateFailure !== 'boolean') {
    throw new Error('simulateFailure must be a boolean.');
  }
  return {
    recommendationMode: config.recommendationMode,
    simulateFailure: config.simulateFailure,
  };
}

function GemstoneExperience({ config }: { config: unknown }): React.JSX.Element {
  const { loading, ready, fail } = useExperienceLifecycle();
  const [gemstone, setGemstone] = useState('');
  const gemstoneConfig = config as GemstoneConfig;

  useEffect(() => {
    let active = true;
    loading();
    recommendGemstone(
      gemstoneConfig.recommendationMode,
      gemstoneConfig.simulateFailure,
    )
      .then(result => {
        if (active) {
          setGemstone(result);
          ready();
        }
      })
      .catch(fail);
    return () => {
      active = false;
    };
  }, [
    fail,
    gemstoneConfig.recommendationMode,
    gemstoneConfig.simulateFailure,
    loading,
    ready,
  ]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Recommended stone</Text>
      <Text style={styles.name}>{gemstone || 'Finding a match…'}</Text>
      <Text style={styles.mode}>Mode: {gemstoneConfig.recommendationMode}</Text>
    </View>
  );
}

const gemstoneV1: ExperienceVersionImpl = {
  parseConfig,
  Component: GemstoneExperience,
};

export const gemstoneModule: ExperienceModule = {
  id: 'gemstone',
  versions: { v1: gemstoneV1 },
  defaultVersion: 'v1',
};

const styles = StyleSheet.create({
  container: {
    padding: 14,
    backgroundColor: '#EEF4F3',
    borderRadius: 6,
  },
  label: {
    color: '#58726B',
    fontSize: 12,
  },
  name: {
    color: '#27443D',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  mode: {
    color: '#6B7E77',
    fontSize: 12,
    marginTop: 6,
  },
});