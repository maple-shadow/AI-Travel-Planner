// 头像组件
import React, { useState, useRef } from 'react';
import { useProfile } from '../hooks';

interface ProfileAvatarProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    editable?: boolean;
    className?: string;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
    size = 'md',
    editable = false,
    className = ''
}) => {
    const { userProfile, isUploading, handleAvatarSelect } = useProfile();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const sizeClasses = {
        sm: 'h-8 w-8 text-sm',
        md: 'h-16 w-16 text-xl',
        lg: 'h-24 w-24 text-2xl',
        xl: 'h-32 w-32 text-3xl',
    };

    const handleAvatarClick = () => {
        if (editable && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        handleAvatarSelect(event);
        // 重置input值，允许选择同一文件
        if (event.target) {
            event.target.value = '';
        }
    };

    return (
        <div className={`relative inline-block ${className}`}>
            <div
                className={`
          ${sizeClasses[size]} 
          rounded-full bg-gray-300 flex items-center justify-center
          relative overflow-hidden cursor-pointer
          transition-all duration-200
          ${editable ? 'hover:opacity-80' : ''}
          ${isHovered && editable ? 'ring-2 ring-blue-500' : ''}
        `}
                onClick={handleAvatarClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {userProfile?.avatar ? (
                    <img
                        src={userProfile.avatar}
                        alt="头像"
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <span className="font-bold text-gray-600">
                        {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                )}

                {/* 上传遮罩 */}
                {editable && isHovered && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                            {isUploading ? '上传中...' : '更换头像'}
                        </span>
                    </div>
                )}

                {/* 上传指示器 */}
                {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                )}
            </div>

            {/* 文件输入 */}
            {editable && (
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
            )}

            {/* 编辑图标 */}
            {editable && !isHovered && (
                <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1">
                    <svg
                        className="h-3 w-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                    </svg>
                </div>
            )}
        </div>
    );
};

export default ProfileAvatar;