import { useCallback, useRef, useState } from 'react';
import toast from 'react-hot-toast';

const LAST_NOTIFIED_LEAD_KEY = 'crm_last_notified_lead_id';

const getBrowserNotificationPermission = () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return window.Notification.permission;
};

export const useInquiryNotifications = () => {
    const [permission, setPermission] = useState(getBrowserNotificationPermission);
    const [unreadCount, setUnreadCount] = useState(0);
    const initializedRef = useRef(false);
    const lastLeadIdRef = useRef(0);

    const announceNewLeads = useCallback((newLeads) => {
        if (newLeads.length === 0) return;

        const newestLead = newLeads.reduce((latest, lead) => (
            Number(lead.id) > Number(latest.id) ? lead : latest
        ));
        const toastMessage = newLeads.length === 1
            ? `New inquiry from ${newestLead.name} (${newestLead.request_id || 'New lead'})`
            : `${newLeads.length} new inquiries received in CRM`;

        toast.success(toastMessage, { duration: 8000 });
        setUnreadCount((current) => current + newLeads.length);

        if (permission === 'granted') {
            const browserNotification = new window.Notification('New CRM inquiry', {
                body: newLeads.length === 1
                    ? `${newestLead.name} — ${newestLead.product_name || 'General inquiry'}`
                    : `${newLeads.length} new customer inquiries were received.`,
                icon: '/logo-256.png',
                tag: `crm-lead-${newestLead.id}`,
            });
            browserNotification.onclick = () => window.focus();
        }
    }, [permission]);

    const processLeadUpdate = useCallback((incomingLeads) => {
        if (!Array.isArray(incomingLeads) || incomingLeads.length === 0) return;

        const highestLeadId = Math.max(...incomingLeads.map((lead) => Number(lead.id) || 0));
        if (!initializedRef.current) {
            const storedLeadId = Number(localStorage.getItem(LAST_NOTIFIED_LEAD_KEY)) || 0;
            lastLeadIdRef.current = storedLeadId || highestLeadId;
            initializedRef.current = true;

            if (storedLeadId > 0) {
                announceNewLeads(incomingLeads.filter((lead) => Number(lead.id) > storedLeadId));
            }
        } else {
            announceNewLeads(incomingLeads.filter((lead) => Number(lead.id) > lastLeadIdRef.current));
        }

        if (highestLeadId > lastLeadIdRef.current) {
            lastLeadIdRef.current = highestLeadId;
            localStorage.setItem(LAST_NOTIFIED_LEAD_KEY, String(highestLeadId));
        }
    }, [announceNewLeads]);

    const enableBrowserNotifications = useCallback(async () => {
        if (typeof window === 'undefined' || !('Notification' in window)) {
            toast.error('Browser notifications are not supported on this device.');
            setPermission('unsupported');
            return;
        }

        const nextPermission = await window.Notification.requestPermission();
        setPermission(nextPermission);
        if (nextPermission === 'granted') {
            toast.success('Inquiry notifications enabled.');
        } else {
            toast.error('Browser notifications were not enabled.');
        }
    }, []);

    return {
        browserNotificationPermission: permission,
        clearUnreadInquiries: () => setUnreadCount(0),
        enableBrowserNotifications,
        processLeadUpdate,
        unreadInquiryCount: unreadCount,
    };
};

export default useInquiryNotifications;
