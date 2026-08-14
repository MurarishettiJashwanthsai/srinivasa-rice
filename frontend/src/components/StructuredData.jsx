import { useLocation } from 'react-router-dom';
import useMeta from '../hooks/useMeta';
import { buildStructuredData, getRouteMetadata } from '../seo/siteSeo';

export const StructuredData = () => {
    const location = useLocation();
    const metadata = getRouteMetadata(location.pathname);
    const structuredData = buildStructuredData(location.pathname);

    useMeta(metadata);

    if (!structuredData) return null;

    return (
        <script
            id="ss-route-structured-data"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
        />
    );
};

export default StructuredData;
