import { Box, Heading, Modal, Text, useColorMode, VStack } from "native-base";
import { Avatar } from "native-base";

interface Participant {
  id: string;
  name: string;
  isMuted: boolean;
  avatarUrl?: string;
  speakingVolume?: number;
  profileField?: string;
}

const Profmodal = ({
  isOpen,
  onClose,
  participant,
}: {
  isOpen: boolean;
  onClose: () => void;
  participant: Participant;
}) => {
  const { colorMode: nativeBaseColorMode } = useColorMode();
  const bg = nativeBaseColorMode === "dark" ? "gray.800" : "white";

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Content maxWidth="400px">
        <Modal.CloseButton />
        <Modal.Header bg={bg}>プロフィール</Modal.Header>

        <Modal.Body bg={bg}>
          <VStack space={4} alignItems="center">
            {/* 1. Avatar */}
            <Avatar
              source={participant.avatarUrl ? { uri: participant.avatarUrl } : undefined}
              size="2xl"
              bg="gray.300"
            >
              {participant.name?.[0] ?? "?"}
            </Avatar>

            {/* 2. Name */}
            <Heading size="md" textAlign="center">
              {participant.name}
            </Heading>

            {/* 3. Profile */}
            <Box w="100%" p="4" borderRadius="md" bg={bg}>
              <Text textAlign="center">
                {participant.profileField || "プロフィール情報がありません。"}
              </Text>
            </Box>
          </VStack>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
};

export default Profmodal;