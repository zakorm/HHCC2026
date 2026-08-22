import { colors } from '@/constants/design-tokens';
import { useAuth } from '@/contexts/auth-context';
import { ApiError, type Role } from '@/utils/api';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ROLE_ROUTES: Record<Role, string> = {
  teacher: '/teacher/dashboard',
  student: '/student/dashboard',
  parent: '/parent/dashboard',
  admin: '/teacher/dashboard',
};

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Enter your email and password.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      router.replace({ pathname: ROLE_ROUTES[user.role] as any, params: { name: user.full_name } });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="screen-root justify-center px-6 bg-[#ffffff]" edges={['top', 'bottom']}>
      <View className="gap-8">
        <View className="gap-1">
          <Text className="font-display-semibold text-wordmark text-ink">jstucation</Text>
          <Text className="font-body text-body text-muted">Log in to continue</Text>
        </View>

        <View className="gap-3.5">
          <View className="gap-1.5">
            <Text className="font-body-medium text-eyebrow uppercase text-muted">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="you@school.edu"
              placeholderTextColor={colors.muted}
              className="rounded-sm border border-line px-3.5 py-2.5 font-body text-body text-ink"
            />
          </View>

          <View className="gap-1.5">
            <Text className="font-body-medium text-eyebrow uppercase text-muted">Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor={colors.muted}
              className="rounded-sm border border-line px-3.5 py-2.5 font-body text-body text-ink"
              onSubmitEditing={handleLogin}
            />
          </View>

          {error && <Text className="font-body text-small text-orange">{error}</Text>}

          <Pressable
            className="surface-card items-center bg-ink"
            disabled={submitting}
            onPress={handleLogin}>
            {submitting ? (
              <ActivityIndicator color={colors.bg} />
            ) : (
              <Text className="text-center text-[15px] text-bg">Log In</Text>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
