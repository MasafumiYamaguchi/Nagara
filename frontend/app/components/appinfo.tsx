import { Box, Heading, Modal, useColorMode } from "native-base";

const AppInfo = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void}) => {
    const { colorMode: nativeBaseColorMode } = useColorMode();
  return (
    <Modal isOpen={isOpen} onClose={() => onClose()}>
        <Modal.Content maxWidth="400px">
            <Modal.CloseButton />
                <Modal.Header bg={nativeBaseColorMode === 'dark' ? 'gray.800' : 'white'}>アプリについて</Modal.Header>
                    <Modal.Body bg={nativeBaseColorMode === 'dark' ? 'gray.800' : 'white'}>
                        <Heading size="md" mb="2">バージョン情報</Heading>
                        <Box p="4" bg={nativeBaseColorMode === 'dark' ? 'gray.800' : 'white'} borderRadius="md">
                            <Box mb="4">
                                Ver. 1.0.0
                            </Box>
                            <Box mb="4">
                                © 2026 MKApps All rights reserved.
                            </Box>
                        </Box>
                    </Modal.Body>
        </Modal.Content>
    </Modal>
  )
}

export default AppInfo