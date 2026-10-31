import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useExperienceLifecycle } from '../../../core/lifecycle';
import type { ExperienceVersionImpl } from '../../../core/types';
import { getAstrologers } from '../api';
import type { Astrologer } from '../api';

type ConsultationConfig = {
  mode: 'natal' | 'transit';
};

function parseConfig(raw: unknown): ConsultationConfig {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Consultation config must be an object.');
  }
  const config = raw as Partial<ConsultationConfig>;
  if (config.mode !== 'natal' && config.mode !== 'transit') {
    throw new Error('Consultation mode must be natal or transit.');
  }
  return { mode: config.mode };
}

function Consultation({ config }: { config: unknown }): React.JSX.Element {
  const { loading, ready, complete, fail } = useExperienceLifecycle();
  const [astrologer, setAstrologer] = useState<Astrologer | null>(null);
  const consultationConfig = config as ConsultationConfig;

  useEffect(() => {
    let active = true;
    loading();
    getAstrologers()
      .then(astrologers => {
        if (active) {
          setAstrologer(astrologers[0]);
          ready();
        }
      })
      .catch(fail);
    return () => {
      active = false;
    };
  }, [fail, loading, ready]);

  return (
    <View style={styles.container}>
      <View style={styles.copy}>
        <Text style={styles.name}>{astrologer?.name ?? 'Finding a guide…'}</Text>
        <Text style={styles.specialty}>
          {astrologer?.specialty ?? `${consultationConfig.mode} consultation`}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        disabled={!astrologer}
        onPress={() => complete({ astrologer: astrologer?.id })}
        style={({ pressed }) => [
          styles.button,
          (!astrologer || pressed) && styles.buttonMuted,
        ]}>
        <Text style={styles.buttonText}>Connect</Text>
      </Pressable>
    </View>
  );
}

export const consultationV1: ExperienceVersionImpl = {
  parseConfig,
  Component: Consultation,
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#F3F0E7',
    borderRadius: 6,
  },
  copy: {
    flex: 1,
  },
  name: {
    color: '#3F473A',
    fontSize: 15,
    fontWeight: '700',
  },
  specialty: {
    color: '#77745F',
    fontSize: 12,
    marginTop: 3,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 13,
    backgroundColor: '#3E675F',
    borderRadius: 4,
  },
  buttonMuted: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});