import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Countdown from '@/components/ui/Countdown';
import StarRating from '@/components/ui/StarRating';
import { TInvite } from '@/lib/provider/types';
import { tid } from '@/lib/testing/testIDs';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

type InviteCardProps = {
  invite: TInvite;
  timeRemaining: number;
  onPress: (invite: TInvite) => void;
};

export default function InviteCard({ invite, timeRemaining, onPress }: InviteCardProps) {
  const handlePress = () => onPress(invite);

  return (
    <Card className="gap-component" testID={tid.provider.invite.card(invite.id)}>
      <Pressable
        onPress={handlePress}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        accessibilityRole="button"
        accessibilityLabel={`Job invite from ${invite.customerName}`}
        className="active:opacity-80"
      >
        <View className="gap-4">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1 pr-3">
              <Text
                className="text-base font-semibold text-gray-900"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {invite.customerName}
              </Text>

              <View className="mt-1 flex-row items-center gap-[2px]">
                <StarRating rating={invite.rating} size={13} readonly />
                <Text className="ml-1 text-[11px] leading-4 text-gray-500">
                  {invite.rating.toFixed(1)}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-2 shrink-0">
              <View className="px-2.5 py-1 rounded-full border border-blue-200 bg-blue-50">
                <Countdown initialSeconds={timeRemaining} testID={`countdown-${invite.id}`} />
              </View>

              <Badge variant="neutral" testID={tid.provider.invite.eta(invite.id)}>
                {invite.etaMinutes} min ETA
              </Badge>
            </View>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={14} color="#6B7280" />
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              className="ml-2 text-sm text-gray-600"
            >
              {invite.approxAddress}
            </Text>
          </View>




          <View className="flex-row-reverse items-center justify-between" >

            <View>
              <Text className="text-[11px] tracking-[0.14em] text-gray-400 uppercase">Offered fare</Text>
              <Text
                className="mt-1 text-2xl font-extrabold text-green-600"
                testID={tid.provider.invite.price(invite.id)}
                accessibilityLabel={`Price ${invite.price} MAD`}
              >
                {invite.price}{' '}
                <Text className="text-lg font-bold text-green-600">MAD</Text>
              </Text>
            </View>

            <View
              className="flex-row items-center justify-between px-4 mt-2 h-14 rounded-2xl bg-primary"
              testID={tid.provider.invite.view(invite.id)}
              accessibilityLabel="View job details"
            >
              <View className="flex-row items-center gap-2">
                <Ionicons name="briefcase-outline" size={18} color="#FFFFFF" />
                <Text className="text-base font-semibold text-text-inverse">View job details</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
            </View>
          </View>
        </View>
      </Pressable>
    </Card>
  );
}
