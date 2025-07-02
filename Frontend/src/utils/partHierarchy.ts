// 파일: src/utils/partHierarchy.ts
// 설명: 세그멘테이션 부위의 대분류 및 하위 ID 목록 정의

export const partHierarchy: Record<string, (string | Record<string, string[]>)[]> = {
    피부: ["피부"],
    눈썹: [{ 눈썹: ["왼쪽눈썹", "오른쪽눈썹"] }],
    눈: [{ 눈: ["왼쪽눈", "오른쪽눈"] }],
    귀: [{ 귀: ["왼쪽귀", "오른쪽귀"] }],
    코: ["코"],
    입술: [{ 입술: ["윗입술", "아랫입술"] }],
    머리카락: ["머리카락"],
};

export const getPartIdFromLabel = (label: string): number => {
    const mapping: Record<string, number> = {
        배경: 0,
        피부: 1,
        왼쪽눈썹: 2,
        오른쪽눈썹: 3,
        왼쪽눈: 4,
        오른쪽눈: 5,
        왼쪽귀: 7,
        오른쪽귀: 8,
        코: 10,
        윗입술: 12,
        아랫입술: 13,
        목: 14,
        머리카락: 17,
    };
    return mapping[label] || -1; // -1은 잘못된 ID를 나타냄
};
