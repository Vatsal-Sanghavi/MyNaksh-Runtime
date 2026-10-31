import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExperienceRuntime } from '../core/ExperienceRuntime';
import type { ExperienceDefinition } from '../core/types';
import { fetchExperiences } from '../mock/experienceConfig';

export function HomeScreen(): React.JSX.Element {
  const [definitions, setDefinitions] = useState<ExperienceDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gemstoneFails, setGemstoneFails] = useState(true);
  const [invalidTarotConfig, setInvalidTarotConfig] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetchExperiences({ gemstoneFails, invalidTarotConfig })
      .then(result => {
        if (active) {
          setDefinitions(result);
          setLoading(false);
        }
      })
      .catch(cause => {
        if (active) {
          setError(cause instanceof Error ? cause.message : String(cause));
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [gemstoneFails, invalidTarotConfig, reloadKey]);

  const enabled = definitions.filter(definition => definition.enabled);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.mark}><Text style={styles.markText}>N</Text></View>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>MYNAKSH · EXPERIENCE PLATFORM</Text>
            <Text style={styles.title}>Experience host</Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <View style={styles.liveDot} />
          <Text style={styles.statusText}>Runtime active</Text>
          <Text style={styles.countText}>
            {loading ? 'Loading definitions' : `${enabled.length} enabled`}
          </Text>
        </View>

        <View style={styles.controls}>
          <Text style={styles.sectionLabel}>DEMO CONTROLS</Text>
          <DemoSwitch label="Simulate gemstone API failure" value={gemstoneFails} onChange={setGemstoneFails} />
          <DemoSwitch label="Send invalid Tarot config" value={invalidTarotConfig} onChange={setInvalidTarotConfig} />
          <Pressable onPress={() => setReloadKey(value => value + 1)} style={styles.reload}>
            <Text style={styles.reloadText}>Reload definitions</Text>
          </Pressable>
        </View>

        <View style={styles.listHeading}>
          <Text style={styles.sectionLabel}>REGISTERED EXPERIENCES</Text>
          <Text style={styles.note}>Isolated runtime instances</Text>
        </View>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color="#3E675F" />
            <Text style={styles.note}>Fetching experience definitions</Text>
          </View>
        ) : error ? (
          <View style={styles.fetchError}>
            <Text style={styles.errorTitle}>Could not load definitions</Text>
            <Text style={styles.note}>{error}</Text>
            <Pressable onPress={() => setReloadKey(value => value + 1)} style={styles.reload}>
              <Text style={styles.reloadText}>Try again</Text>
            </Pressable>
          </View>
        ) : (
          enabled.map((definition, index) => (
            <View
              key={`${definition.entryPoint}:${index}:${reloadKey}:${gemstoneFails}:${invalidTarotConfig}`}>
              {index > 0 ? <View style={styles.separator} /> : null}
              <ExperienceRuntime definition={definition} />
            </View>
          ))
        )}

        <View style={styles.footer}>
          <Text style={styles.sectionLabel}>CORE RUNTIME</Text>
          <Text style={styles.note}>
            Config stays opaque here. Each experience owns its parser, API, and state.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DemoSwitch({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}): React.JSX.Element {
  return (
    <View style={styles.switchRow}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#D5D8D1', true: '#8BA79E' }}
        thumbColor={value ? '#3E675F' : '#F6F6F2'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F6F1' },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 36 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mark: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', backgroundColor: '#3E675F', borderRadius: 6 },
  markText: { color: '#FFFFFF', fontSize: 21, fontWeight: '700' },
  headerCopy: { flex: 1 },
  eyebrow: { color: '#8A6A54', fontSize: 10, fontWeight: '700' },
  title: { color: '#273C35', fontSize: 22, fontWeight: '700', marginTop: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 22, marginBottom: 18 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#5F947D' },
  statusText: { color: '#42564E', fontSize: 13, fontWeight: '600' },
  countText: { marginLeft: 'auto', color: '#7C8077', fontSize: 12 },
  controls: { padding: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E4DB', borderRadius: 6 },
  sectionLabel: { color: '#82694F', fontSize: 10, fontWeight: '700', marginBottom: 7 },
  switchRow: { minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#F0F0E9' },
  switchLabel: { flex: 1, color: '#384A43', fontSize: 13, paddingRight: 8 },
  reload: { alignSelf: 'flex-start', marginTop: 10, paddingVertical: 7, paddingHorizontal: 10, backgroundColor: '#3E675F', borderRadius: 4 },
  reloadText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  listHeading: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 25, marginBottom: 8 },
  note: { color: '#777D75', fontSize: 12, lineHeight: 18 },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 24 },
  fetchError: { padding: 14, borderWidth: 1, borderColor: '#E8C9BF', borderRadius: 6, backgroundColor: '#FFF8F5' },
  errorTitle: { color: '#533B35', fontSize: 15, fontWeight: '700', marginBottom: 5 },
  separator: { height: 1, backgroundColor: '#E5E4DB', marginVertical: 10 },
  footer: { marginTop: 18, paddingTop: 13, borderTopWidth: 1, borderTopColor: '#E2E2D9' },
});