// 파일: src/components/ImageUpload.tsx
// 설명: 이미지 업로드 컴포넌트

import React from "react";

type Props = {
    onFileSelect: (file: File) => void;
};

const ImageUpload: React.FC<Props> = ({ onFileSelect }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    return (
        <div className="p-4">
            <input type="file" accept="image/*" onChange={handleChange} />
        </div>
    );
};

export default ImageUpload;
