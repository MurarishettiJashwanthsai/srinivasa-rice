/**
 * Generates an optimized Cloudinary delivery URL with transformation parameters.
 * Preserves the original asset while injecting width, quality, and format parameters.
 */
export const getOptimizedImageUrl = (url, width = 600, height = 450) => {
    if (!url || typeof url !== 'string') return '';
    
    // Check if URL is a Cloudinary URL
    if (url.includes('cloudinary.com') && url.includes('/upload/')) {
        const transform = `f_auto,q_auto,w_${width},h_${height},c_fill,ar_4:3`;
        return url.replace('/upload/', `/upload/${transform}/`);
    }
    
    return url;
};

export const DEFAULT_PRODUCT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600';
