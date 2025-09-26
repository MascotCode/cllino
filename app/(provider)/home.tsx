import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Countdown from '@/components/ui/Countdown';
import StarRating from '@/components/ui/StarRating';
import Title from '@/components/ui/Title';
import Toggle from '@/components/ui/Toggle';
import { useProviderState } from '@/lib/provider/store';
import { TInvite } from '@/lib/provider/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProviderHome() {
    const routerInstance = useRouter();
    const {
        profile,
        setOnlineStatus,
        invites,
        getTimeRemaining,
        activeJob
    } = useProviderState();

    const handleToggleOnline = (online: boolean) => {
        try {
            setOnlineStatus(online);
        } catch (error) {
            console.error('Error toggling online status:', error);
        }
    };

    const handleViewInvite = (invite: TInvite) => {
        try {
            routerInstance.push(`/(provider)/invite/${invite.id}`);
        } catch (error) {
            console.error('Navigation error:', error);
        }
    };

    const handleActiveJob = () => {
        if (activeJob) {
            try {
                routerInstance.push(`/(provider)/job/${activeJob.id}`);
            } catch (error) {
                console.error('Navigation error:', error);
            }
        }
    };

    const isOnline = profile?.isOnline || false;

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1 px-4 pt-8">
                {/* Header */}
                <View className="mb-8">
                    <Title className="mb-4 text-center">Provider Dashboard</Title>

                    <Card className="mb-4">
                        <View className="flex-row items-center justify-between">
                            <View>
                                <Text className="text-lg font-semibold text-gray-900">
                                    {profile?.name || 'Provider'}
                                </Text>
                                <Text className="text-sm text-gray-600">
                                    Status: {isOnline ? 'Online' : 'Offline'}
                                </Text>
                            </View>

                            <Toggle
                                value={isOnline}
                                onValueChange={handleToggleOnline}
                                trueLabel="Online"
                                falseLabel="Offline"
                                testID="prov.home.toggle"
                            />
                        </View>
                    </Card>
                </View>

                {/* Active Job Alert */}
                {activeJob && (
                    <Card className="mb-6 border-green-200 bg-green-50">
                        <Pressable onPress={handleActiveJob}>
                            <View className="flex-row items-center space-x-3">
                                <View className="items-center justify-center w-8 h-8 bg-green-500 rounded-full">
                                    <Ionicons name="briefcase" size={16} color="white" />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-semibold text-green-900">
                                        Active Job
                                    </Text>
                                    <Text className="text-sm text-green-800">
                                        {activeJob.customerName} • {activeJob.price} MAD
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#16a34a" />
                            </View>
                        </Pressable>
                    </Card>
                )}

                {/* Content based on status */}
                {!isOnline && (
                    <Card className="mb-6">
                        <View className="items-center py-8">
                            <View className="items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full">
                                <Ionicons name="power" size={32} color="#6b7280" />
                            </View>
                            <Text className="mb-2 text-xl font-semibold text-gray-900">
                                You're Offline
                            </Text>
                            <Text className="text-center text-gray-600">
                                Switch to online to start receiving job invitations from nearby customers
                            </Text>
                        </View>
                    </Card>
                )}

                {isOnline && invites.length === 0 && !activeJob && (
                    <Card className="mb-6">
                        <View className="items-center py-8">
                            <View className="items-center justify-center w-16 h-16 mb-4 bg-blue-100 rounded-full">
                                <Ionicons name="radio" size={32} color="#3b82f6" />
                            </View>
                            <Text className="mb-2 text-xl font-semibold text-gray-900">
                                Listening for requests...
                            </Text>
                            <Text className="text-center text-gray-600">
                                We're searching for nearby customers who need your services
                            </Text>
                        </View>
                    </Card>
                )}

                {/* Invitations List */}
                {isOnline && invites.length > 0 && !activeJob && (
                    <View className="mb-6">
                        <Text className="mb-4 text-xl font-semibold text-gray-900">
                            Job Invitations ({invites.length})
                        </Text>

                        {invites.map((invite) => {
                            const timeRemaining = getTimeRemaining(invite);

                            return (
                                <Card
                                    key={invite.id}
                                    className="mb-4"
                                    testID={`prov.invite.card-${invite.id}`}
                                >
                                    <Pressable
                                        onPress={() => handleViewInvite(invite)}
                                        className="active:opacity-70"
                                    >
                                        <View className="space-y-3">
                                            {/* Header with countdown */}
                                            <View className="flex-row items-center justify-between">
                                                <Text className="text-lg font-semibold text-gray-900">
                                                    {invite.customerName}
                                                </Text>
                                                <Countdown
                                                    initialSeconds={timeRemaining}
                                                    testID={`countdown-${invite.id}`}
                                                />
                                            </View>

                                            {/* Location and ETA */}
                                            <View className="flex-row items-center space-x-2">
                                                <Ionicons name="location-outline" size={16} color="#6b7280" />
                                                <Text className="flex-1 text-gray-600">
                                                    {invite.approxAddress}
                                                </Text>
                                            </View>

                                            {/* Details row */}
                                            <View className="flex-row items-center justify-between">
                                                <View className="flex-row items-center space-x-4">
                                                    <Badge variant="info">
                                                        ETA {invite.etaMinutes}m
                                                    </Badge>
                                                    <Text className="text-lg font-semibold text-green-600">
                                                        {invite.price} MAD
                                                    </Text>
                                                </View>

                                                <View className="flex-row items-center space-x-2">
                                                    <StarRating
                                                        rating={invite.rating}
                                                        size={16}
                                                        readonly
                                                    />
                                                    <Text className="text-sm text-gray-500">
                                                        {invite.rating.toFixed(1)}
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* View button */}
                                            <View className="pt-2">
                                                <View className="items-center p-3 border border-blue-200 bg-blue-50 rounded-xl">
                                                    <Text
                                                        className="font-medium text-blue-700"
                                                        testID={`prov.invite.view-${invite.id}`}
                                                    >
                                                        View Details
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </Pressable>
                                </Card>
                            );
                        })}
                    </View>
                )}

                {/* Cash payment reminder */}
                <Card className="bg-amber-50 border-amber-200">
                    <View className="flex-row items-start space-x-3">
                        <View className="w-6 h-6 bg-amber-500 rounded-full items-center justify-center mt-0.5">
                            <Ionicons name="cash" size={14} color="white" />
                        </View>
                        <View className="flex-1">
                            <Text className="mb-1 font-medium text-amber-900">
                                Cash Payment Required
                            </Text>
                            <Text className="text-sm text-amber-800">
                                All jobs are paid in cash on completion. You can handle one active job at a time.
                            </Text>
                        </View>
                    </View>
                </Card>
            </ScrollView>
        </SafeAreaView>
    );
}
