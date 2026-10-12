import { useLocalSearchParams } from 'expo-router';
import { ImageOff } from 'lucide-react-native';

import { useAuth } from '@/features/auth/auth-provider';
import { useCouple } from '@/features/couple/couple-provider';
import { PhotoViewer } from '@/features/photos/components/photo-viewer';
import { usePhoto } from '@/features/photos/hooks';
import { ReactionBar } from '@/features/reactions/components/reaction-bar';
import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState, LoadingState } from '@/shared/ui/states';

export default function PhotoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const photo = usePhoto(id);
  const { session } = useAuth();
  const { couple, partner } = useCouple();

  if (photo.isPending) {
    return <LoadingState />;
  }

  if (photo.isError) {
    return <ErrorState title="No se pudo cargar la foto" onRetry={() => photo.refetch()} />;
  }

  if (!photo.data) {
    return <EmptyState icon={ImageOff} title="Esta foto ya no existe" />;
  }

  const author = couple?.members.find((member) => member.user_id === photo.data?.uploaded_by);
  const userId = session?.user.id ?? '';

  return (
    <PhotoViewer
      photo={photo.data}
      authorName={author?.profile?.display_name || 'Alguien'}
      canDelete={photo.data.uploaded_by === userId}
      footer={
        <ReactionBar
          target={{ kind: 'photo', id: photo.data.id, coupleId: photo.data.couple_id }}
          userId={userId}
          partnerName={partner?.profile?.display_name || 'Tu pareja'}
        />
      }
    />
  );
}
