import React from 'react';

const Accompany = ({ date, title, tags, location, current, total, image }) => {
    return (
        <div className="flex justify-between items-start p-4 rounded-lg bg-white">
            {/* 왼쪽 영역 */}
            <div className="flex-1">
                {/* 날짜 */}
                <p className="text-gray-400 text-sm mb-1">{date}</p>

                {/* 제목 */}
                <h2 className="text-lg font-bold text-black mb-2">{title}</h2>

                {/* 태그들 */}
                <div className="flex flex-wrap gap-2 mb-2">
                    {tags.slice(0, 5).map((tag, index) => (
                        <span
                            key={index}
                            className="px-2 py-1 text-sm bg-gray-100 rounded-full text-gray-800"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {/* 위치 및 인원 */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>📍 {location}</span>
                    <span>👤 {current}명/{total}명</span>
                </div>
            </div>

            {/* 오른쪽 이미지 */}
            {image && (
                <div className="w-20 h-20 rounded-xl overflow-hidden ml-4 relative">
                    <img
                        src={image}
                        alt="thumbnail"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1 right-1">
                        <span className="text-black text-xl">🖤</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Accompany;
