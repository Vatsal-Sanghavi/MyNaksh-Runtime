import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useExperienceLifecycle } from '../../../core/lifecycle';
import type { ExperienceVersionImpl } from '../../../core/types';
import { drawCards } from '../api';

type TarotConfig = {
  deck: string;
  maxCards: number;
};

function parseConfig(raw: unknown): TarotConfig {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Tarot config must be an object.');
  }
  const config = raw as Partial<TarotConfig>;
  if (typeof config.deck !== 'string' || !config.deck.trim()) {
    throw new Error('Tarot config requires a deck name.');
  }
  if (
    typeof config.maxCards !== 'number' ||
    !Number.isInteger(config.maxCards) ||
    config.maxCards < 1 ||
    config.maxCards > 5
  ) {
    throw new Error('Tarot maxCards must be a whole number from 1 to 5.');
  }
  return { deck: config.deck, maxCards: config.maxCards };
}

function TarotV1({ config }: { config: unknown }): React.JSX.Element {
  const { loading, ready, fail } = useExperienceLifecycle();
  const [cards, setCards] = useState<string[]>([]);
  const tarotConfig = config as TarotConfig;

  useEffect(() => {
    let active = true;
    loading();
    drawCards(tarotConfig.maxCards)
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
  }, [fail, loading, ready, tarotConfig.maxCards]);

  return (
    <View style={styles.container}>
      <Text style={styles.caption}>{tarotConfig.deck} · three-card reading</Text>
      <View style={styles.cards}>
        {cards.map((card, index) => (
          <View key={card} style={[styles.card, index > 0 && styles.divider]}>
            <Text style={styles.position}>{index + 1}</Text>
            <Text style={styles.cardName}>{card}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export const tarotV1: ExperienceVersionImpl = {
  parseConfig,
  Component: TarotV1,
};

const styles = StyleSheet.create({
  container: {
    padding: 14,
    backgroundColor: '#F2F5EF',
    borderRadius: 6,
  },
  caption: {
    color: '#52675D',
    fontSize: 13,
    marginBottom: 8,
  },
  cards: {
    flexDirection: 'row',
  },
  card: {
    flex: 1,
    gap: 7,
  },
  divider: {
    borderLeftWidth: 1,
    borderColor: '#D5DED4',
    paddingLeft: 10,
    marginLeft: 10,
  },
  position: {
    color: '#A4513F',
    fontSize: 11,
    fontWeight: '700',
  },
  cardName: {
    color: '#243B34',
    fontSize: 14,
    fontWeight: '600',
  },
});