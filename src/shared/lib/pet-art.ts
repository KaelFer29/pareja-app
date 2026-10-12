import type { ImageRequireSource } from 'react-native';

import type { PetMood, PetStage } from '@/shared/utils/pet';

export const PET_ART: Record<PetStage, Record<PetMood, ImageRequireSource>> = {
  baby: {
    happy: require('../../../assets/pet/baby-happy.webp'),
    calm: require('../../../assets/pet/baby-calm.webp'),
    hungry: require('../../../assets/pet/baby-hungry.webp'),
    lonely: require('../../../assets/pet/baby-lonely.webp'),
    sleepy: require('../../../assets/pet/baby-sleepy.webp'),
  },
  puppy: {
    happy: require('../../../assets/pet/puppy-happy.webp'),
    calm: require('../../../assets/pet/puppy-calm.webp'),
    hungry: require('../../../assets/pet/puppy-hungry.webp'),
    lonely: require('../../../assets/pet/puppy-lonely.webp'),
    sleepy: require('../../../assets/pet/puppy-sleepy.webp'),
  },
  adult: {
    happy: require('../../../assets/pet/adult-happy.webp'),
    calm: require('../../../assets/pet/adult-calm.webp'),
    hungry: require('../../../assets/pet/adult-hungry.webp'),
    lonely: require('../../../assets/pet/adult-lonely.webp'),
    sleepy: require('../../../assets/pet/adult-sleepy.webp'),
  },
};

export const PET_SCALE: Record<PetStage, number> = {
  baby: 0.82,
  puppy: 0.92,
  adult: 1,
};
