import { Users, X } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { colors } from '@/constants/design-tokens';
import { useAuth } from '@/contexts/auth-context';
import * as api from '@/utils/api';

// day_of_week: 0=Sunday ... 6=Saturday (matches the backend). School week only -- no weekends.
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS = [1, 2, 3, 4, 5];

function defaultWeekday() {
  const today = new Date().getDay();
  return WEEKDAYS.includes(today) ? today : WEEKDAYS[0];
}

export default function TeacherScheduleTab() {
  const { token } = useAuth();

  const [slots, setSlots] = useState<api.ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(defaultWeekday);

  const [rosterSlot, setRosterSlot] = useState<api.ScheduleSlot | null>(null);
  const [roster, setRoster] = useState<api.RosterEntry[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    api
      .getTeacherSchedule(token)
      .then(setSlots)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const daysWithSlots = useMemo(() => new Set(slots.map((s) => s.day_of_week)), [slots]);

  const slotsForDay = useMemo(
    () =>
      slots
        .filter((s) => s.day_of_week === selectedDay)
        .sort((a, b) => a.start_time.localeCompare(b.start_time)),
    [slots, selectedDay]
  );

  function openRoster(slot: api.ScheduleSlot) {
    if (!token) return;
    setRosterSlot(slot);
    setRosterLoading(true);
    api
      .getClassRoster(slot.class_id, token)
      .then(setRoster)
      .catch(() => setRoster([]))
      .finally(() => setRosterLoading(false));
  }

  return (
    <View className="screen-root">
      <View className="flex-row justify-between gap-2 px-8 pt-4 pb-1">
        {WEEKDAYS.map((day) => {
          const active = day === selectedDay;
          return (
            <Pressable
              key={day}
              onPress={() => setSelectedDay(day)}
              className={`flex-1 items-center rounded-pill py-2 ${active ? 'bg-green' : 'border border-line bg-card'}`}>
              <Text
                className={`font-body-medium text-body ${
                  active ? 'text-card' : daysWithSlots.has(day) ? 'text-ink' : 'text-muted'
                }`}>
                {DAY_LABELS[day]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView contentContainerClassName="screen-scroll-content pt-3" showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={colors.green} />
        ) : (
          <Card
            title={DAY_LABELS[selectedDay]}
            description={`${slotsForDay.length} class${slotsForDay.length === 1 ? '' : 'es'} scheduled`}>
            {slotsForDay.length === 0 ? (
              <Text className="text-muted-sm">No classes scheduled for this day.</Text>
            ) : (
              <FlatList
                data={slotsForDay}
                keyExtractor={(item) => `${item.class_id}-${item.start_time}`}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View className="divider-line" />}
                renderItem={({ item }) => (
                  <Pressable className="list-item-row" onPress={() => openRoster(item)}>
                    <View className="w-14 items-center">
                      <Text className="font-body-semibold text-small text-ink">{item.start_time}</Text>
                      <Text className="text-small text-muted">{item.end_time}</Text>
                    </View>
                    <View className="flex-1 gap-0.5">
                      <Text className="text-body-ink">{item.class_name}</Text>
                      <Text className="text-muted-sm">
                        {item.subject_name}
                        {item.room ? ` · ${item.room}` : ''}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Users size={14} color={colors.muted} />
                      <Text className="text-muted-sm">{item.student_count}</Text>
                    </View>
                  </Pressable>
                )}
              />
            )}
          </Card>
        )}
      </ScrollView>

      <Modal
        visible={rosterSlot !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setRosterSlot(null)}>
        <Pressable className="flex-1 justify-end bg-[rgba(31,58,95,0.35)]" onPress={() => setRosterSlot(null)}>
          <Pressable
            style={{ maxHeight: '75%' }}
            className="gap-3.5 rounded-t-lg bg-card px-4.5 py-4"
            onPress={(e) => e.stopPropagation()}>
            <View className="flex-row items-center justify-between">
              <Text className="font-display text-card-title text-ink">{rosterSlot?.class_name}</Text>
              <Pressable onPress={() => setRosterSlot(null)}>
                <X size={18} color={colors.ink} />
              </Pressable>
            </View>
            {rosterSlot && (
              <Text className="text-muted-sm">
                {DAY_LABELS[rosterSlot.day_of_week]} {rosterSlot.start_time}–{rosterSlot.end_time}
                {rosterSlot.room ? ` · ${rosterSlot.room}` : ''}
              </Text>
            )}

            {rosterLoading ? (
              <ActivityIndicator color={colors.green} />
            ) : (
              <FlatList
                data={roster}
                keyExtractor={(entry) => entry.student.id}
                ItemSeparatorComponent={() => <View className="divider-line" />}
                renderItem={({ item }) => (
                  <View className="list-item-row">
                    <Avatar initials={item.student.avatar_initials} variant="sm" />
                    <View className="flex-1 gap-0.5">
                      <Text className="text-body-ink">{item.student.full_name}</Text>
                      <Text className="text-muted-sm">{item.student.year_level}</Text>
                    </View>
                  </View>
                )}
                ListEmptyComponent={<Text className="text-muted-sm">No students in this class yet.</Text>}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
