import { useState } from 'react';
import { API_BASE_URL } from '../config/api';

const getCloudinaryUrl = (url, width, quality = 'auto') => {
    if (!url || typeof url !== 'string') return url;
    if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
        return url.replace('/upload/', `/upload/f_auto,q_${quality},w_${width}/`);
    }
    return url;
};

export const OptimizedImage = ({
    src,
    alt = '',
    width,
    height,
    sizes = '(max-width: 768px) 100vw, 50vw',
    className = '',
    priority = false,
    aspectRatio = '4/3',
    fallbackSrc = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800',
    ...props
}) => {
    const [hasError, setHasError] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    let rawSrc = src;
    if (rawSrc && typeof rawSrc === 'string' && rawSrc.startsWith('/uploads/')) {
        rawSrc = `${API_BASE_URL}${rawSrc}`;
    }

    const actualSrc = hasError || !rawSrc ? fallbackSrc : rawSrc;

    // Generate responsive Cloudinary srcset if applicable
    let srcSet = undefined;
    if (actualSrc.includes('res.cloudinary.com') && actualSrc.includes('/upload/')) {
        const src400 = getCloudinaryUrl(actualSrc, 400);
        const src800 = getCloudinaryUrl(actualSrc, 800);
        const src1200 = getCloudinaryUrl(actualSrc, 1200);
        srcSet = `${src400} 400w, ${src800} 800w, ${src1200} 1200w`;
    }

    return (
        <div
            className={`relative overflow-hidden bg-surface-hover/30 ${className}`}
            style={{ aspectRatio: width && height ? undefined : aspectRatio }}
        >
            <img
                src={actualSrc}
                srcSet={srcSet}
                sizes={srcSet ? sizes : undefined}
                alt={alt}
                width={width}
                height={height}
                loading={priority ? 'eager' : 'lazy'}
                decoding="async"
                onError={() => {
                    if (!hasError) setHasError(true);
                }}
                onLoad={() => setIsLoaded(true)}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                    isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                {...props}
            />
            {!isLoaded && (
                <div className="absolute inset-0 bg-primary/5 animate-pulse flex items-center justify-center">
                    <span className="sr-only">Loading image...</span>
                </div>
            )}
        </div>
    );
};

export default OptimizedImage;
