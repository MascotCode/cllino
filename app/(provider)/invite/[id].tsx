import { AppButton as Button } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Countdown from '@/components/ui/Countdown';
import StarRating from '@/components/ui/StarRating';
import StickyFooter from '@/components/ui/StickyFooter';
import Title from '@/components/ui/Title';
import { useProviderState } from '@/lib/provider/store';
import { TInvite } from '@/lib/provider/types';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, Text, View } from 'react-native';

export default function InviteDetails() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [currentInvite, setCurrentInvite] = useState<TInvite | null>(null);
    const [loading, setLoading] = useState(false);

    const {
        invites,
        acceptInvite,
        declineInvite,
        getTimeRemaining,
        activeJob,
        refreshJob
    } = useProviderState();

    // Find the current invite
    useEffect(() => {
        const invite = invites.find(inv => inv.id === id);
        setCurrentInvite(invite || null);
    }, [invites, id]);

    const handleAccept = async () => {
        if (!currentInvite || loading) return;

        // Check if already have active job
        if (activeJob) {
            Alert.alert(
                'Active Job',
                'You already have an active job. Complete it before accepting new invitations.',
                [{ text: 'OK' }]
            );
            return;
        }

        const timeRemaining = getTimeRemaining(currentInvite);
        if (timeRemaining <= 0) {
            Alert.alert(
                'Invitation Expired',
                'This invitation has expired and can no longer be accepted.',
                [{ text: 'OK', onPress: () => router.back() }]
            );
            return;
        }

        setLoading(true);
        try {
            const job = acceptInvite(currentInvite.id);
            if (job) {
                refreshJob(); // Refresh job state
                router.replace(`/(provider)/job/${job.id}`);
            } else {
                Alert.alert(
                    'Unable to Accept',
                    'This invitation is no longer available or you already have an active job.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Failed to accept invite:', error);
            Alert.alert('Error', 'Failed to accept invitation. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDecline = () => {
        if (!currentInvite || loading) return;

        Alert.alert(
            'Decline Invitation',
            'Are you sure you want to decline this job invitation?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Decline',
                    style: 'destructive',
                    onPress: () => {
                        declineInvite(currentInvite.id);
                        router.back();
                    }
                }
            ]
        );
    };

    if (!currentInvite) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 items-center justify-center px-4">
                    <Card className="w-full">
                        <View className="items-center py-8">
                            <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-4">
                                <Ionicons name="close-circle" size={32} color="#ef4444" />
                            </View>
                            <Text className="text-xl font-semibold text-gray-900 mb-2">
                                Invitation Not Found
                            </Text>
                            <Text className="text-gray-600 text-center mb-6">
                                This invitation may have expired or been withdrawn.
                            </Text>
                            <Button onPress={() => router.back()} variant="primary">
                                Back to Home
                            </Button>
                        </View>
                    </Card>
                </View>
            </SafeAreaView>
        );
    }

    const timeRemaining = getTimeRemaining(currentInvite);
    const isExpired = timeRemaining <= 0;

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1 px-4 pt-8">
                <View className="mb-6">
                    <Title className="text-center mb-4">Job Invitation</Title>
                </View>

                <Card className="mb-6">
                    <View className="space-y-4">
                        {/* Header with countdown */}
                        <View className="flex-row items-center justify-between">
                            <Text className="text-2xl font-bold text-gray-900">
                                {currentInvite.customerName}
                            </Text>
                            <Countdown
                                initialSeconds={timeRemaining}
                                testID="invite-countdown"
                            />
                        </View>

                        {/* Customer rating */}
                        <View className="flex-row items-center space-x-2">
                            <StarRating
                                rating={currentInvite.rating}
                                size={20}
                                readonly
                            />
                            <Text className="text-sm text-gray-600 ml-2">
                                {currentInvite.rating.toFixed(1)} customer rating
                            </Text>
                        </View>
                    </View>
                </Card>

                {/* Location */}
                <Card className="mb-6">
                    <View className="space-y-3">
                        <View className="flex-row items-center space-x-2">
                            <Ionicons name="location" size={20} color="#3b82f6" />
                            <Text className="text-lg font-semibold text-gray-900">
                                Service Location
                            </Text>
                        </View>

                        <Text className="text-gray-600 ml-7">
                            {currentInvite.approxAddress}
                        </Text>

                        <View className="bg-amber-50 border border-amber-200 rounded-xl p-3 ml-7">
                            <Text className="text-amber-800 text-sm">
                                💡 Exact address will be revealed after accepting the job
                            </Text>
                        </View>
                    </View>
                </Card>

                {/* Job Details */}
                <Card className="mb-6">
                    <View className="space-y-4">
                        <Text className="text-lg font-semibold text-gray-900">
                            Job Details
                        </Text>

                        <View className="grid grid-cols-2 gap-4">
                            <View className="bg-green-50 border border-green-200 rounded-xl p-4 items-center">
                                <Text className="text-2xl font-bold text-green-600">
                                    {currentInvite.price} MAD
                                </Text>
                                <Text className="text-green-700 text-sm font-medium">
                                    Cash Payment
                                </Text>
                            </View>

                            <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 items-center">
                                <Text className="text-2xl font-bold text-blue-600">
                                    {currentInvite.etaMinutes}m
                                </Text>
                                <Text className="text-blue-700 text-sm font-medium">
                                    Estimated ETA
                                </Text>
                            </View>
                        </View>
                    </View>
                </Card>

                {/* Status message for expired or already have job */}
                {(isExpired || activeJob) && (
                    <Card className="mb-6 bg-red-50 border-red-200">
                        <View className="flex-row items-start space-x-3">
                            <View className="w-6 h-6 bg-red-500 rounded-full items-center justify-center mt-0.5">
                                <Ionicons name="warning" size={14} color="white" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-red-900 font-semibold mb-1">
                                    {isExpired ? 'Offer Expired' : 'Active Job in Progress'}
                                </Text>
                                <Text className="text-red-800 text-sm" testID="prov.invite.expired">
                                    {isExpired
                                        ? 'This invitation has expired and can no longer be accepted.'
                                        : 'You already have an active job. Complete it before accepting new invitations.'
                                    }
                                </Text>
                            </View>
                        </View>
                    </Card>
                )}

                {/* Cash payment reminder */}
                <Card className="bg-amber-50 border-amber-200">
                    <View className="flex-row items-start space-x-3">
                        <View className="w-6 h-6 bg-amber-500 rounded-full items-center justify-center mt-0.5">
                            <Ionicons name="cash" size={14} color="white" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-amber-900 font-medium mb-1">
                                Cash Payment Required
                            </Text>
                            <Text className="text-amber-800 text-sm">
                                Customer will pay in cash upon job completion. No digital payment is required.
                            </Text>
                        </View>
                    </View>
                </Card>
            </ScrollView>

            {/* Action buttons */}
            <StickyFooter>
                <View className="flex-row space-x-3">
                    <View className="flex-1">
                        <Button
                            onPress={handleDecline}
                            variant="subtle"
                            disabled={loading}
                            testID="prov.invite.decline"
                        >
                            Decline
                        </Button>
                    </View>
                    <View className="flex-1">
                        <Button
                            onPress={handleAccept}
                            variant="primary"
                            disabled={isExpired || loading || !!activeJob}
                            testID="prov.invite.accept"
                        >
                            {loading ? 'Accepting...' : 'Accept Job'}
                        </Button>
                    </View>
                </View>
            </StickyFooter>
        </SafeAreaView>
    );
}
