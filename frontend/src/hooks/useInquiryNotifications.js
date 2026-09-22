import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

const LAST_NOTIFIED_LEAD_KEY = 'crm_last_notified_lead_id';
const KNOWN_LEAD_STATUSES_KEY = 'crm_known_lead_statuses';
const KNOWN_UNREAD_MESSAGES_KEY = 'crm_known_unread_customer_messages';

let notificationAudioContext;

const getNotificationAudioContext = () => {
    if (typeof window === 'undefined') return null;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!notificationAudioContext) notificationAudioContext = new AudioContextClass();
    return notificationAudioContext;
};

const unlockNotificationAudio = async () => {
    const audioContext = getNotificationAudioContext();
    if (!audioContext) return false;
    if (audioContext.state === 'suspended') {
        try {
            await audioContext.resume();
        } catch {
            return false;
        }
    }
    return audioContext.state === 'running';
};

const playNotificationSound = async (type) => {
    if (!await unlockNotificationAudio()) return;

    const audioContext = getNotificationAudioContext();
    const notes = type === 'contacted'
        ? [
            { frequency: 659.25, offset: 0, duration: 0.1 },
            { frequency: 783.99, offset: 0.12, duration: 0.1 },
            { frequency: 987.77, offset: 0.24, duration: 0.18 },
        ]
        : type === 'reply' ? [
            { frequency: 523.25, offset: 0, duration: 0.12 },
            { frequency: 659.25, offset: 0.14, duration: 0.12 },
            { frequency: 783.99, offset: 0.28, duration: 0.2 },
        ] : [
            { frequency: 880, offset: 0, duration: 0.14 },
            { frequency: 1174.66, offset: 0.18, duration: 0.22 },
        ];

    notes.forEach(({ frequency, offset, duration }) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const startAt = audioContext.currentTime + offset;
        const endAt = startAt + duration;

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, startAt);
        gain.gain.setValueAtTime(0.0001, startAt);
        gain.gain.exponentialRampToValueAtTime(0.16, startAt + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0001, endAt);
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start(startAt);
        oscillator.stop(endAt);
    });
};

const readKnownLeadStatuses = () => {
    if (typeof window === 'undefined') return {};
    try {
        const parsed = JSON.parse(window.localStorage.getItem(KNOWN_LEAD_STATUSES_KEY) || '{}');
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
        return {};
    }
};

const writeKnownLeadStatuses = (statuses) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(KNOWN_LEAD_STATUSES_KEY, JSON.stringify(statuses));
};

const readKnownUnreadMessages = () => {
    if (typeof window === 'undefined') return {};
    try {
        const parsed = JSON.parse(window.localStorage.getItem(KNOWN_UNREAD_MESSAGES_KEY) || '{}');
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
        return {};
    }
};

const writeKnownUnreadMessages = (counts) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(KNOWN_UNREAD_MESSAGES_KEY, JSON.stringify(counts));
};

const getBrowserNotificationPermission = () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return window.Notification.permission;
};

export const useInquiryNotifications = () => {
    const [permission, setPermission] = useState(getBrowserNotificationPermission);
    const [soundReady, setSoundReady] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const initializedRef = useRef(false);
    const lastLeadIdRef = useRef(0);
    const statusesInitializedRef = useRef(false);
    const knownStatusesRef = useRef({});
    const unreadMessagesInitializedRef = useRef(false);
    const knownUnreadMessagesRef = useRef({});

    useEffect(() => {
        const unlockAudio = () => {
            void unlockNotificationAudio().then(setSoundReady);
        };
        window.addEventListener('pointerdown', unlockAudio, { once: true });
        window.addEventListener('keydown', unlockAudio, { once: true });
        return () => {
            window.removeEventListener('pointerdown', unlockAudio);
            window.removeEventListener('keydown', unlockAudio);
        };
    }, []);

    const announceNewLeads = useCallback((newLeads) => {
        if (newLeads.length === 0) return;

        const newestLead = newLeads.reduce((latest, lead) => (
            Number(lead.id) > Number(latest.id) ? lead : latest
        ));
        const toastMessage = newLeads.length === 1
            ? `New inquiry received (${newestLead.request_id || 'Open CRM for details'})`
            : `${newLeads.length} new inquiries received in CRM`;

        toast.success(toastMessage, { duration: 8000 });
        setUnreadCount((current) => current + newLeads.length);
        void playNotificationSound('new');

        if (permission === 'granted') {
            const browserNotification = new window.Notification('New CRM inquiry', {
                body: newLeads.length === 1
                    ? 'Open the protected admin CRM to review it.'
                    : `${newLeads.length} new customer inquiries were received.`,
                icon: '/logo-256.png',
                tag: `crm-lead-${newestLead.id}`,
            });
            browserNotification.onclick = () => window.focus();
        }
    }, [permission]);

    const announceContactedLead = useCallback((lead, showToast = false) => {
        if (!lead) return;

        const customerLabel = lead.name || lead.company || lead.request_id || 'Customer inquiry';
        if (showToast) toast.success(`${customerLabel} was marked as contacted.`, { duration: 6000 });
        void playNotificationSound('contacted');

        if (permission === 'granted') {
            const browserNotification = new window.Notification('Inquiry contacted', {
                body: `${customerLabel} is now marked as contacted in the CRM.`,
                icon: '/logo-256.png',
                tag: `crm-contacted-${lead.id}`,
            });
            browserNotification.onclick = () => window.focus();
        }
    }, [permission]);

    const announceCustomerReplies = useCallback((lead, count) => {
        const customerLabel = lead.name || lead.company || lead.request_id || 'Customer';
        toast.success(`${count === 1 ? 'New message' : `${count} new messages`} from ${customerLabel}`, { duration: 8000 });
        setUnreadCount((current) => current + count);
        void playNotificationSound('reply');
        if (permission === 'granted') {
            const browserNotification = new window.Notification('New customer reply', {
                body: `${customerLabel} replied to enquiry ${lead.request_id || ''}. Open the protected CRM to respond.`,
                icon: '/logo-256.png',
                tag: `crm-reply-${lead.id}`,
            });
            browserNotification.onclick = () => window.focus();
        }
    }, [permission]);

    const rememberUnreadMessages = useCallback((incomingLeads, announceChanges) => {
        const nextCounts = { ...knownUnreadMessagesRef.current };
        incomingLeads.forEach((lead) => {
            const leadKey = String(lead.id);
            const previousCount = Number(knownUnreadMessagesRef.current[leadKey]) || 0;
            const nextCount = Number(lead.unread_customer_messages) || 0;
            if (announceChanges && nextCount > previousCount) {
                announceCustomerReplies(lead, nextCount - previousCount);
            }
            nextCounts[leadKey] = nextCount;
        });
        knownUnreadMessagesRef.current = nextCounts;
        writeKnownUnreadMessages(nextCounts);
    }, [announceCustomerReplies]);

    const rememberLeadStatuses = useCallback((incomingLeads, announceChanges) => {
        if (!Array.isArray(incomingLeads)) return;

        const nextStatuses = { ...knownStatusesRef.current };
        incomingLeads.forEach((lead) => {
            const leadKey = String(lead.id);
            const previousStatus = knownStatusesRef.current[leadKey];
            const nextStatus = (lead.status || 'new').toLowerCase();
            if (announceChanges && previousStatus && previousStatus !== 'contacted' && nextStatus === 'contacted') {
                announceContactedLead(lead, true);
            }
            nextStatuses[leadKey] = nextStatus;
        });

        knownStatusesRef.current = nextStatuses;
        writeKnownLeadStatuses(nextStatuses);
    }, [announceContactedLead]);

    const processLeadUpdate = useCallback((incomingLeads) => {
        if (!Array.isArray(incomingLeads) || incomingLeads.length === 0) return;

        if (!statusesInitializedRef.current) {
            knownStatusesRef.current = readKnownLeadStatuses();
            const hasStoredStatuses = Object.keys(knownStatusesRef.current).length > 0;
            rememberLeadStatuses(incomingLeads, hasStoredStatuses);
            statusesInitializedRef.current = true;
        } else {
            rememberLeadStatuses(incomingLeads, true);
        }

        if (!unreadMessagesInitializedRef.current) {
            knownUnreadMessagesRef.current = readKnownUnreadMessages();
            const hasStoredCounts = Object.keys(knownUnreadMessagesRef.current).length > 0;
            rememberUnreadMessages(incomingLeads, hasStoredCounts);
            unreadMessagesInitializedRef.current = true;
        } else {
            rememberUnreadMessages(incomingLeads, true);
        }

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
    }, [announceNewLeads, rememberLeadStatuses, rememberUnreadMessages]);

    const confirmLeadContacted = useCallback((lead) => {
        if (!lead) return;
        const leadKey = String(lead.id);
        const previousStatus = knownStatusesRef.current[leadKey];
        knownStatusesRef.current = {
            ...knownStatusesRef.current,
            [leadKey]: (lead.status || 'contacted').toLowerCase(),
        };
        writeKnownLeadStatuses(knownStatusesRef.current);
        if (previousStatus !== 'contacted') announceContactedLead(lead);
    }, [announceContactedLead]);

    const enableBrowserNotifications = useCallback(async () => {
        const soundEnabled = await unlockNotificationAudio();
        setSoundReady(soundEnabled);
        if (soundEnabled) void playNotificationSound('new');

        if (typeof window === 'undefined' || !('Notification' in window)) {
            if (soundEnabled) toast.success('Inquiry notification sound enabled.');
            else toast.error('Browser notifications and sound are not supported on this device.');
            setPermission('unsupported');
            return;
        }

        const nextPermission = await window.Notification.requestPermission();
        setPermission(nextPermission);
        if (nextPermission === 'granted') {
            toast.success('Inquiry sound and browser notifications enabled.');
        } else if (soundEnabled) {
            toast.success('Inquiry sound enabled. Browser pop-ups were not enabled.');
        } else {
            toast.error('Browser notifications were not enabled.');
        }
    }, []);

    return {
        browserNotificationPermission: permission,
        clearUnreadInquiries: () => setUnreadCount(0),
        confirmLeadContacted,
        enableBrowserNotifications,
        notificationSoundReady: soundReady,
        processLeadUpdate,
        unreadInquiryCount: unreadCount,
    };
};

export default useInquiryNotifications;
