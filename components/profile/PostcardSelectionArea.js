import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import PostcardOverlay from './PostcardOverlay';
import { postcardTemplates, getPostcardOverlayStyle } from '../../utils/PostcardTemplates';

const PostcardSelectionArea = ({
    selectedPostcard,
    onAreaPress,
    onPostcardSelect,
    isEditMode,
    isSaved,
    isOverlayVisible,
    onOverlayClose,
    onWritePress,
    onDrawPress,
    postcardContent,
    onContentChange,
    isTextEditing,
    textInputRef
}) => {
    const templateNumber = selectedPostcard?.code;

    const textLayout = getPostcardOverlayStyle(templateNumber);

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[
                    styles.postcardArea,
                    selectedPostcard && styles.postcardAreaSelected
                ]}
                onPress={onAreaPress}
                disabled={!isEditMode}
            >
                {selectedPostcard ? (
                    <View style={styles.postcardContainer}>
                        <Image
                            source={postcardTemplates[templateNumber]}
                            style={styles.postcardImage}
                        />
                        {isTextEditing ? (
                            <TextInput
                                ref={textInputRef}
                                style={[styles.postcardTextInput, textLayout]}
                                multiline
                                value={postcardContent}
                                onChangeText={onContentChange}
                                autoFocus={true}
                                placeholder="엽서에 글을 써주세요..."
                                placeholderTextColor="#000"
                            />
                        ) : (
                            <Text style={[styles.postcardTextDisplay, textLayout]}>
                                {postcardContent}
                            </Text>
                        )}
                        <PostcardOverlay
                            isVisible={isOverlayVisible}
                            onClose={onOverlayClose}
                            onPostcardSelect={onPostcardSelect}
                            onWritePress={onWritePress}
                            onDrawPress={onDrawPress}
                        />
                    </View>
                ) : (
                    <View style={styles.postcardPlaceholder}>
                        <Feather
                            name="file-text"
                            size={32}
                            color="#999"
                        />
                        <Text style={styles.postcardText}>
                            엽서 선택
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    postcardArea: {
        width: 148 * 2.4,
        height: 100 * 2.4,
        borderWidth: 2,
        borderColor: '#ddd',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fafafa',
        position: 'relative',
    },
    postcardAreaSelected: {
        borderStyle: 'solid',
        borderColor: 'transparent',
        backgroundColor: 'transparent',
    },
    postcardContainer: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    postcardImage: {
        width: '100%',
        height: '100%',
    },
    postcardPlaceholder: {
        alignItems: 'center',
        gap: 8,
    },
    postcardText: {
        fontSize: 16,
        color: '#999',
        fontWeight: '500',
    },
    postcardTextInput: {
        fontSize: 16,
        color: '#000',
        textAlign: 'center',
        textAlignVertical: 'center',
        paddingHorizontal: 16,
        backgroundColor: 'transparent',
        position: 'absolute',
    },
    postcardTextDisplay: {
        fontSize: 16,
        color: '#000',
        textAlign: 'center',
        textAlignVertical: 'center',
        paddingHorizontal: 16,
        position: 'absolute',
    },
});

export default PostcardSelectionArea;