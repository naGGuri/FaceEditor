// 설명: 업로드된 이미지를 원본 그대로 중앙에 표시하는 컴포넌트

import React from "react";

interface Props {
    imageUrl: string;
}

const Before: React.FC<Props> = ({ imageUrl }) => {
    return (
        <div className="w-full h-full flex justify-center items-center bg-[#242424]">
            {imageUrl && <img src={imageUrl} alt="Uploaded Preview" className="max-w-full max-h-full object-contain" />}
        </div>
    );
};

export default Before;
