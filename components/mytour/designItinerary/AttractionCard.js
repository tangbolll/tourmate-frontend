import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AttractionCard = ({
  attraction,
  isSelected,
  isExpanded,
  onToggle,
  onExpand,
  onAddToSchedule,
  isAIGenerating = false, // 기본값 설정
}) => {
  const [isTextExpanded, setIsTextExpanded] = useState(false);

  if (!attraction) {
    return null;
  }

  // 글자 수 기준 미리보기 제한
  const MAX_CHAR_COUNT = 100;

  // 텍스트가 길 때 미리 보여줄 부분
  const previewText =
    attraction.detailInfo?.overview?.length > MAX_CHAR_COUNT
      ? attraction.detailInfo.overview.slice(0, MAX_CHAR_COUNT)
      : attraction.detailInfo?.overview || '';

  // 전체 텍스트가 MAX_CHAR_COUNT 초과인지 판단
  const isTruncated =
    attraction.detailInfo?.overview?.length > MAX_CHAR_COUNT;

  return (
    <View style={styles.attractionContainer}>
      <View style={styles.attractionCard}>
        {/* 제목 + 펼치기 버튼 */}
        <View style={[
          styles.attractionHeader,
          isAIGenerating && isSelected && styles.selectedHeader
        ]}>
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => onExpand(attraction.id)}
          >
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#666"
            />
          </TouchableOpacity>
          <View style={styles.attractionInfo}>
            <Text
              style={styles.attractionName}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {attraction?.name || '이름 없음'}
            </Text>
          </View>
          {!isAIGenerating && (
            // 일반 모드에서는 기존 버튼
            <TouchableOpacity
              style={styles.addToScheduleButton}
              onPress={() => {
                const locationValue = attraction.detailInfo?.addr || attraction.name || '';
                onAddToSchedule(
                  1,           // dayIndex
                  null,        // timeSlot
                  null,        // index
                  attraction,  // attraction
                  locationValue // location
                );
              }}
            >
              <Text style={styles.addToScheduleButtonText}>시간표에 추가</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 펼침 상태 */}
        {isExpanded && attraction?.detailInfo && (
          <View style={styles.attractionDetails}>
            <View style={styles.detailsContent}>
              <View style={styles.textContent}>
                {attraction.detailInfo.overview ? (
                <Text style={styles.attractionDescription}>
                {isTextExpanded ? attraction.detailInfo.overview : previewText}
                {isTruncated && !isTextExpanded && (
                    <>
                    <Text>... </Text>
                    <Text style={styles.readMoreText} onPress={() => setIsTextExpanded(true)}>
                        더보기
                    </Text>
                    </>
                )}
                {isTruncated && isTextExpanded && (
                    <Text style={styles.readMoreText} onPress={() => setIsTextExpanded(false)}>
                     접기
                    </Text>
                )}
                </Text>
                ) : null}

                {/* 주소 및 기타 정보 */}
                {attraction.detailInfo.addr && (
                  <View style={styles.infoRow}>
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color="#666"
                      style={{ marginTop: 1 }}
                    />
                    <Text style={styles.infoText}>{attraction.detailInfo.addr}</Text>
                  </View>
                )}
                {/* 다른 infoRow 추가 가능 */}
              </View>

              {/* 오른쪽 이미지 */}
              <View style={styles.imageContainer}>
                <Image
                  source={{
                    uri:
                      attraction.detailInfo.firstimage ||
                      attraction.image ||
                      'https://via.placeholder.com/120x80/E0E0E0/666666?text=이미지',
                  }}
                  style={styles.attractionImage}
                  resizeMode="cover"
                />
              </View>
            </View>
          </View>
        )}
      </View>
      
      {/* AI 모드에서는 + 버튼을 박스 밖으로 */}
      {isAIGenerating && (
        <TouchableOpacity
          style={[
            styles.addButton,
            isSelected && styles.selectedAddButton
          ]}
          onPress={() => {
            console.log('🎯 클릭된 관광지:', attraction?.name);
            console.log('✅ 현재 선택 상태:', isSelected);
            console.log('🔄 동작 예상:', isSelected ? '선택 해제' : '선택 추가');
            console.log('📊 전체 관광지 정보:', attraction);
            onAddToSchedule(attraction);
          }}
        >
          <Ionicons 
            name={isSelected ? "checkmark" : "add"} 
            size={20} 
            color={isSelected ? "#000" : "#fff"} 
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  attractionContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  selectedAddButton: {
    backgroundColor: '#f0f0f0',
  },
  attractionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  attractionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    height: 48,
  },
  attractionInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 8,
  },
  attractionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  expandButton: {
    padding: 2,
    marginRight: 8,
  },
  attractionDetails: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  detailsContent: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
  },
  textContent: {
    flex: 1,
  },
  attractionDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 20,
    marginBottom: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
    marginLeft: 6,
  },
  imageContainer: {
    width: 120,
    height: 80,
  },
  attractionImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  readMoreText: {
    color: '#6B7280',
    fontWeight: '500',
    fontSize: 12,
    marginLeft: 4,
    textDecorationLine: 'underline',
  },
  addToScheduleButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  addToScheduleButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default AttractionCard;