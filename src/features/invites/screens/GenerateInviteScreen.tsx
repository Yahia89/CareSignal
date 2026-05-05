import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Copy, Check } from 'lucide-react-native';
import { Screen, Text, Button, Spacer, Card } from '../../../shared/components';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { useGenerateInvite } from '../../../hooks/useGenerateInvite';

export const GenerateInviteScreen = () => {
  const theme = useTheme();
  const { loading, error, inviteCode, generateInvite, copyToClipboard, reset } = useGenerateInvite();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await copyToClipboard();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateNew = () => {
    reset();
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.content}>
        <Text variant="h1" style={styles.title}>
          Generate Invite
        </Text>

        <Spacer y="md" />

        <Text
          variant="body"
          color={theme.colors.textSecondary}
          style={styles.description}
        >
          Create an invite code to share with family members or caregivers.
        </Text>

        <Spacer y="xl" />

        {!inviteCode ? (
          <>
            {error && (
              <>
                <Card
                  style={{
                    backgroundColor: theme.colors.error + '20',
                    borderLeftWidth: 4,
                    borderLeftColor: theme.colors.error,
                  }}
                >
                  <Text color={theme.colors.error}>{error}</Text>
                </Card>
                <Spacer y="md" />
              </>
            )}

            <Button
              onPress={generateInvite}
              disabled={loading}
              loading={loading}
              size="lg"
            >
              Generate Invite Code
            </Button>
          </>
        ) : (
          <>
            <Card
              style={{
                backgroundColor: theme.colors.success + '10',
                borderWidth: 2,
                borderColor: theme.colors.success,
                paddingVertical: 24,
                alignItems: 'center',
              }}
            >
              <Text variant="caption" color={theme.colors.textSecondary}>
                Your Invite Code
              </Text>
              <Spacer y="sm" />
              <Text
                variant="h2"
                style={{
                  fontFamily: 'monospace',
                  letterSpacing: 4,
                  fontWeight: '700',
                }}
              >
                {inviteCode}
              </Text>
              <Spacer y="md" />
              <TouchableOpacity
                onPress={handleCopy}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  backgroundColor: theme.colors.success + '20',
                  borderRadius: 8,
                }}
              >
                {copied ? (
                  <>
                    <Check size={16} color={theme.colors.success} />
                    <Text
                      variant="caption"
                      color={theme.colors.success}
                      style={{ marginLeft: 6 }}
                    >
                      Copied!
                    </Text>
                  </>
                ) : (
                  <>
                    <Copy size={16} color={theme.colors.success} />
                    <Text
                      variant="caption"
                      color={theme.colors.success}
                      style={{ marginLeft: 6 }}
                    >
                      Copy Code
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </Card>

            <Spacer y="lg" />

            <Card
              style={{
                backgroundColor: theme.colors.info + '10',
                borderLeftWidth: 4,
                borderLeftColor: theme.colors.info,
              }}
            >
              <Text variant="caption" color={theme.colors.info} style={{ fontWeight: '600' }}>
                How to Share
              </Text>
              <Spacer y="sm" />
              <Text variant="caption" color={theme.colors.textSecondary}>
                • Share this code with family or caregivers{'\n'}
                • They can enter it during signup to join your household{'\n'}
                • Each code can be used multiple times
              </Text>
            </Card>

            <Spacer y="lg" />

            <Button
              onPress={handleGenerateNew}
              disabled={loading}
              variant="secondary"
            >
              Generate Another Code
            </Button>
          </>
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    textAlign: 'center',
    lineHeight: 20,
  },
});
