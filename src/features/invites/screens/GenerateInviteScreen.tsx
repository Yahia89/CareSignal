import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Copy, Check } from 'lucide-react-native';
import { Screen, Text, Spacer } from '../../../shared/components';
import { useGenerateInvite } from '../../../hooks/useGenerateInvite';
import { NeuButton, NeuCard, useColors, useTokens, spacing, borderRadius } from '../../../shared/design';

export const GenerateInviteScreen = () => {
  const colors = useColors();
  const tokens = useTokens();
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
        <Text variant="title" style={styles.title}>
          Generate Invite
        </Text>

        <Spacer y="md" />

        <Text
          variant="body"
          color={colors.text.secondary}
          style={styles.description}
        >
          Create an invite code to share with family members or caregivers.
        </Text>

        <Spacer y="xl" />

        {!inviteCode ? (
          <>
            {error && (
              <>
                <NeuCard
                  style={{
                    backgroundColor: colors.semantic.error + '20',
                    borderLeftWidth: 4,
                    borderLeftColor: colors.semantic.error,
                  }}
                >
                  <Text color={colors.semantic.error}>{error}</Text>
                </NeuCard>
                <Spacer y="md" />
              </>
            )}

            <NeuButton
              title={loading ? "Generating…" : "Generate Invite Code"}
              onPress={generateInvite}
              disabled={loading}
              loading={loading}
              size="md"
            />
          </>
        ) : (
          <>
            <NeuCard
              style={{
                backgroundColor: colors.semantic.success + '10',
                borderWidth: 2,
                borderColor: colors.semantic.success,
                paddingVertical: spacing[24],
                alignItems: 'center',
              }}
            >
              <Text variant="caption" color={colors.text.secondary}>
                Your Invite Code
              </Text>
              <Spacer y="sm" />
              <Text
                variant="heading"
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
                  paddingHorizontal: spacing[16],
                  paddingVertical: spacing[8],
                  backgroundColor: colors.semantic.success + '20',
                  borderRadius: borderRadius.sm,
                }}
              >
                {copied ? (
                  <>
                    <Check size={16} color={colors.semantic.success} />
                    <Text
                      variant="caption"
                      color={colors.semantic.success}
                      style={{ marginLeft: spacing[6] }}
                    >
                      Copied!
                    </Text>
                  </>
                ) : (
                  <>
                    <Copy size={16} color={colors.semantic.success} />
                    <Text
                      variant="caption"
                      color={colors.semantic.success}
                      style={{ marginLeft: spacing[6] }}
                    >
                      Copy Code
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </NeuCard>

            <Spacer y="lg" />

            <NeuCard
              style={{
                backgroundColor: colors.semantic.info + '10',
                borderLeftWidth: 4,
                borderLeftColor: colors.semantic.info,
              }}
            >
              <Text variant="caption" color={colors.semantic.info} style={{ fontWeight: '600' }}>
                How to Share
              </Text>
              <Spacer y="sm" />
              <Text variant="caption" color={colors.text.secondary}>
                • Share this code with family or caregivers{'\n'}
                • They can enter it during signup to join your household{'\n'}
                • Each code can be used multiple times
              </Text>
            </NeuCard>

            <Spacer y="lg" />

            <NeuButton
              title="Generate Another Code"
              onPress={handleGenerateNew}
              disabled={loading}
              variant="secondary"
              size="md"
            />
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
    paddingHorizontal: spacing[20],
    paddingVertical: spacing[40],
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing[8],
  },
  description: {
    textAlign: 'center',
    lineHeight: 20,
  },
});
