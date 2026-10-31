import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useExperienceLifecycle } from '../../../core/lifecycle';
import type { ExperienceVersionImpl } from '../../../core/types';
import { drawSpread } from '../api';

type TarotSpreadConfig = {
  deck: string;
  spreadSize: number;
};

function parseConfig(raw: unknown): TarotSpreadConfig {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Tarot v2 config must be an object.');
  }
  const config = raw as Partial<TarotSpreadConfig>;
  if (typeof config.deck !== 'string' || !config.deck.trim()) {
    throw new Error('Tarot v2 config requires a deck name.');
  }
  if (
    typeof config.spreadSize !== 'number' ||
    !Number.isInteger(config.spreadSize) ||
    config.spreadSize < 2 ||
    config.spreadSize > 5
  ) {
    throw new Error('Tarot spreadSize must be a whole number from 2 to 5.');
  }
  return { deck: config.deck, spreadSize: config.spreadSize };
}

function TarotV2({ config }: { config: unknown }): React.JSX.Element {
  const { loading, ready, fail } = useExperienceLifecycle();
  const [cards, setCards] = useState<string[]>([]);
  const tarotConfig = config as TarotSpreadConfig;

  useEffect(() => {
    let active = true;
    loading();
    drawSpread(tarotConfig.spreadSize)
      .then(result => {
        if (active) {
          setCards(result);
          ready();
        }
      })
      .catch(fail);
    return () => {
      active = false;
    };
  }, [fail, loading, ready, tarotConfig.spreadSize]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Perspective spread</Text>
      <Text style={styles.caption}>{tarotConfig.deck} · {cards.length} positions</Text>
      <View style={styles.cards}>
        {cards.map((card, index) => (
          <View key={card} style={styles.card}>
            <Text style={styles.position}>0{index + 1}</Text>
            <Text style={styles.cardName}>{card}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export const tarotV2: ExperienceVersionImpl = {
  parseConfig,
  Component: TarotV2,
};

const styles = StyleSheet.create({
  container: {
    padding: 14,
    backgroundColor: '#F3F0E7',
    borderRadius: 6,
  },
  heading: {
    color: '#4A4A36',
    fontSize: 15,
    fontWeight: '700',
  },
  caption: {
    color: '#77745F',
    fontSize: 12,
    marginTop: 3,
    marginBottom: 10,
  },
  cards: {
    flexDirection: 'row',
    gap: 8,
  },
  card: {
    flex: 1,
    minHeight: 64,
    justifyContent: 'space-between',
    padding: 9,
    borderWidth: 1,
    borderColor: '#DDD8C8',
    borderRadius: 4,
  },
  position: {
    color: '#9B5B47',
    fontSize: 10,
    fontWeight: '700',
  },
  cardName: {
    color: '#3E473D',
    fontSize: 12,
    fontWeight: '600',
  },
});