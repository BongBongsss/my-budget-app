import { CategoryItem } from '../api';

/**
 * 카테고리 이름을 기반으로 상위 그룹 이름을 반환합니다.
 * @param categoryName 카테고리 이름
 * @param categories 카테고리 목록 데이터
 * @returns 상위 그룹 이름 (없을 경우 '기타' 반환)
 */
export const getGroupName = (categoryName: string, categories: CategoryItem[]): string => {
  if (!categoryName) return '기타';
  
  const matchedCategory = categories.find(cat => cat.name === categoryName);
  if (matchedCategory && matchedCategory.groupName) {
    return matchedCategory.groupName;
  }
  
  // 그룹 설정이 없는 경우, 관례적으로 '>' 기호 앞부분을 사용하거나 '기타' 반환
  const splitName = categoryName.split('>')[0].trim();
  return splitName || '기타';
};

/**
 * 카테고리 목록을 기반으로 카테고리명-그룹명 매핑 맵을 생성합니다. (성능 최적화용)
 */
export const getCategoryToGroupMap = (categories: CategoryItem[]): Record<string, string> => {
  const map: Record<string, string> = {};
  categories.forEach(cat => {
    map[cat.name] = cat.groupName || cat.name.split('>')[0].trim() || '기타';
  });
  return map;
};
