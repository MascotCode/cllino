import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  readonly?: boolean;
  testIDPrefix?: string;
}

export default function StarRating({ 
  rating, 
  onRatingChange, 
  size = 32, 
  readonly = false,
  testIDPrefix = 'star'
}: StarRatingProps) {
  const handleStarPress = (star: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(star);
    }
  };

  return (
    <View className="flex-row gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable
          key={star}
          onPress={() => handleStarPress(star)}
          className={`min-w-[36px] items-center justify-center ${readonly ? 'py-1' : 'py-2'}`}
          disabled={readonly}
          testID={`${testIDPrefix}-${star}`}
        >
          <Ionicons
            name={star <= rating ? 'star' : 'star-outline'}
            size={size}
            color={star <= rating ? '#fbbf24' : '#d1d5db'}
          />
        </Pressable>
      ))}
    </View>
  );
}
