import { AppButton as Button } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import StickyFooter from '@/components/ui/StickyFooter';
import Title from '@/components/ui/Title';
import { useProviderState } from '@/lib/provider/store';
import { TActiveJob } from '@/lib/provider/types';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const statusFlow = {
    assigned: { next: 'enroute', label: 'Start Driving', action: 'Start driving to customer location' },
    enroute: { next: 'working', label: 'Arrived & Start', action: 'Mark as arrived and start service' },
    working: { next: 'complete', label: 'Complete Job', action: 'Mark service as complete' },
} as const;

const statusLabels = {
    assigned: 'Job Assigned',
    enroute: 'On the Way',
    working: 'Working',
    complete: 'Completed',
} as const;

const statusColors = {
    assigned: 'bg-blue-100 text-blue-800 border-blue-200',
    enroute: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    working: 'bg-purple-100 text-purple-800 border-purple-200',
    complete: 'bg-green-100 text-green-800 border-green-200',
} as const;

export default function ActiveJob() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [loading, setLoading] = useState(false);

    const { activeJob, updateJobStatus, refreshJob } = useProviderState();

    // Refresh job data when component mounts
    useEffect(() => {
        refreshJob();
    }, [refreshJob]);

    const handleStatusUpdate = async (newStatus: TActiveJob['status']) => {
        if (!activeJob || loading) return;

        setLoading(true);
        try {
            const updated = updateJobStatus(activeJob.id, newStatus);
            if (updated && newStatus === 'complete') {
                // Navigate to completion screen
                router.replace(`/(provider)/complete/${activeJob.id}`);
            }
        } catch (error) {
            console.error('Failed to update job status:', error);
            Alert.alert('Error', 'Failed to update job status. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenMaps = () => {
        if (!activeJob) return;

        const encodedAddress = encodeURIComponent(activeJob.exactAddress);
        const url = `https://maps.google.com/?q=${encodedAddress}`;

        Linking.openURL(url).catch(() => {
            Alert.alert('Error', 'Unable to open maps application.');
        });
    };

    if (!activeJob || activeJob.id !== id) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="items-center justify-center flex-1 px-4">
                    <Card className="w-full">
                        <View className="items-center py-8">
                            <View className="items-center justify-center w-16 h-16 mb-4 bg-red-100 rounded-full">
                                <Ionicons name="close-circle" size={32} color="#ef4444" />
                            </View>
                            <Text className="mb-2 text-xl font-semibold text-gray-900">
                                No Active Job
                            </Text>
                            <Text className="mb-6 text-center text-gray-600">
                                This job is not active or has been completed.
                            </Text>
                            <Button onPress={() => router.replace('/(provider)/home')} variant="primary">
                                Back to Home
                            </Button>
                        </View>
                    </Card>
                </View>
            </SafeAreaView>
        );
    }

    const currentStep = statusFlow[activeJob.status as keyof typeof statusFlow];

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1 px-4 pt-8">
                <View className="mb-6">
                    <Title className="mb-4 text-center">Active Job</Title>
                </View>

                {/* Customer Info */}
                <Card className="mb-6">
                    <View className="space-y-4">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-2xl font-bold text-gray-900">
                                {activeJob.customerName}
                            </Text>
                            <View className={`px-3 py-1 rounded-full border ${statusColors[activeJob.status]}`}>
                                <Text className="text-sm font-medium">
                                    {statusLabels[activeJob.status]}
                                </Text>
                            </View>
                        </View>

                        <View className="items-center p-4 border border-green-200 bg-green-50 rounded-xl">
                            <Text className="text-3xl font-bold text-green-600">
                                {activeJob.price} MAD
                            </Text>
                            <Text className="font-medium text-green-700">
                                Cash on completion
                            </Text>
                        </View>
                    </View>
                </Card>

                {/* Address */}
                <Card className="mb-6">
                    <View className="space-y-3">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center space-x-2">
                                <Ionicons name="location" size={20} color="#3b82f6" />
                                <Text className="text-lg font-semibold text-gray-900">
                                    Service Location
                                </Text>
                            </View>
                            <Button
                                onPress={handleOpenMaps}
                                variant="ghost"
                                size="md"
                                className="px-3"
                            >
                                <View className="flex-row items-center space-x-1">
                                    <Ionicons name="map" size={16} color="#3b82f6" />
                                    <Text className="font-medium text-blue-600">Open Maps</Text>
                                </View>
                            </Button>
                        </View>

                        <Text className="leading-6 text-gray-900 ml-7">
                            {activeJob.exactAddress}
                        </Text>
                    </View>
                </Card>

                {/* Status Progress */}
                <Card className="mb-6">
                    <View className="space-y-4">
                        <Text className="text-lg font-semibold text-gray-900">
                            Job Progress
                        </Text>

                        <View className="space-y-3">
                            {(['assigned', 'enroute', 'working', 'complete'] as const).map((status, index) => {
                                const isActive = status === activeJob.status;
                                const isCompleted = ['assigned', 'enroute', 'working', 'complete'].indexOf(activeJob.status) > index;

                                return (
                                    <View key={status} className="flex-row items-center space-x-3">
                                        <View className={`w-6 h-6 rounded-full items-center justify-center ${isActive
                                            ? 'bg-blue-500'
                                            : isCompleted
                                                ? 'bg-green-500'
                                                : 'bg-gray-200'
                                            }`}>
                                            {isCompleted ? (
                                                <Ionicons name="checkmark" size={16} color="white" />
                                            ) : isActive ? (
                                                <View className="w-2 h-2 bg-white rounded-full" />
                                            ) : (
                                                <View className="w-2 h-2 bg-gray-400 rounded-full" />
                                            )}
                                        </View>

                                        <Text className={`flex-1 ${isActive
                                            ? 'font-semibold text-gray-900'
                                            : isCompleted
                                                ? 'text-gray-600'
                                                : 'text-gray-400'
                                            }`}>
                                            {statusLabels[status]}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                </Card>

                {/* Instructions */}
                <Card className="border-blue-200 bg-blue-50">
                    <View className="flex-row items-start space-x-3">
                        <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center mt-0.5">
                            <Ionicons name="information" size={14} color="white" />
                        </View>
                        <View className="flex-1">
                            <Text className="mb-1 font-medium text-blue-900">
                                Next Step
                            </Text>
                            <Text className="text-sm text-blue-800">
                                {currentStep ? currentStep.action : 'Job completed! Click "Complete" to finish.'}
                            </Text>
                        </View>
                    </View>
                </Card>
            </ScrollView>

            {/* Action button */}
            {currentStep && (
                <StickyFooter>
                    <Button
                        onPress={() => handleStatusUpdate(currentStep.next)}
                        disabled={loading}
                        variant="primary"
                        testID={
                            currentStep.next === 'enroute' ? 'prov.job.startDrive' :
                                currentStep.next === 'working' ? 'prov.job.startWork' :
                                    'prov.job.complete'
                        }
                    >
                        {loading ? 'Updating...' : currentStep.label}
                    </Button>
                </StickyFooter>
            )}
        </SafeAreaView>
    );
}
