import { useCallback, useEffect, useState } from 'react';
import { CheckCheck, Copy, ExternalLink, MessageCircle, RefreshCw, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminFetch } from '../utils/adminApi';

const formatMessageTime = (value) => value ? new Date(value).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true,
}) : '';

const InquiryConversation = ({ lead, onLeadUpdate }) => {
    const [conversation, setConversation] = useState(null);
    const [draft, setDraft] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [notifyCustomer, setNotifyCustomer] = useState(true);

    const loadConversation = useCallback(async () => {
        setLoading(true);
        try {
            const response = await adminFetch(`/api/leads/${lead.id}/messages?t=${Date.now()}`);
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(payload.detail || 'Unable to load conversation');
            setConversation(payload);
            onLeadUpdate?.(payload.lead);
        } catch (error) {
            toast.error(error.message || 'Unable to load conversation');
        } finally {
            setLoading(false);
        }
    }, [lead.id, onLeadUpdate]);

    useEffect(() => {
        const initialLoad = window.setTimeout(() => void loadConversation(), 0);
        return () => window.clearTimeout(initialLoad);
    }, [loadConversation, lead.message_count]);

    const sendReply = async () => {
        const body = draft.trim();
        if (!body || sending) return;
        setSending(true);
        try {
            const response = await adminFetch(`/api/leads/${lead.id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ body, notify_customer: notifyCustomer }),
            });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(payload.detail || 'Unable to send reply');
            setDraft('');
            setConversation((current) => ({
                ...current,
                conversation_url: payload.conversation_url,
                lead: payload.lead,
                messages: [...(current?.messages || []), payload.message],
            }));
            onLeadUpdate?.(payload.lead);
            if (payload.message.notification_status === 'delivered') toast.success('Reply sent and customer notification delivered.');
            else if (notifyCustomer) toast.success('Reply saved. Use WhatsApp below if the notification workflow is not configured.');
            else toast.success('Reply saved to the secure conversation.');
        } catch (error) {
            toast.error(error.message || 'Unable to send reply');
        } finally {
            setSending(false);
        }
    };

    const customerLink = conversation?.conversation_url || '';
    const whatsappText = `${draft.trim() || `Hello ${lead.name}, we have an update regarding enquiry ${lead.request_id}.`}\n\nContinue securely: ${customerLink}`;
    const whatsappUrl = `https://wa.me/${lead.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappText)}`;

    return (
        <section className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h4 className="flex items-center gap-2 font-display font-black text-text-main dark:text-white"><MessageCircle className="h-4 w-4 text-primary" /> Customer conversation</h4>
                    <p className="mt-1 text-xs text-text-muted">Custom replies are saved against {lead.request_id}. Customer notifications use the configured webhook.</p>
                </div>
                <button type="button" onClick={() => void loadConversation()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-bold text-text-main dark:text-white">
                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
                </button>
            </div>

            <div className="max-h-72 space-y-3 overflow-y-auto rounded-xl border border-border bg-surface p-3 dark:bg-secondary-light/20">
                {loading && !conversation && <p className="py-8 text-center text-sm text-text-muted">Loading messages…</p>}
                {!loading && (conversation?.messages?.length || 0) === 0 && <p className="py-8 text-center text-sm text-text-muted">No messages yet. Write the first custom reply below.</p>}
                {conversation?.messages?.map((message) => {
                    const fromAdmin = message.sender === 'admin';
                    return (
                        <div key={message.id} className={`flex ${fromAdmin ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-xl px-3 py-2 ${fromAdmin ? 'bg-primary text-white' : 'border border-border bg-white text-text-main'}`}>
                                <p className="whitespace-pre-wrap break-words text-sm">{message.body}</p>
                                <p className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${fromAdmin ? 'text-white/75' : 'text-text-muted'}`}>
                                    {formatMessageTime(message.created_at)}
                                    {fromAdmin && message.read_by_customer_at && <CheckCheck className="h-3 w-3" />}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <label htmlFor={`admin-reply-${lead.id}`} className="mt-4 block text-xs font-black uppercase tracking-widest text-text-muted">Custom response</label>
            <textarea
                id={`admin-reply-${lead.id}`}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                maxLength={2000}
                rows={4}
                placeholder="Write a custom reply to this customer…"
                className="mt-2 w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-main outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-secondary-light/30 dark:text-white"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-xs font-bold text-text-muted">
                    <input type="checkbox" checked={notifyCustomer} onChange={(event) => setNotifyCustomer(event.target.checked)} className="h-4 w-4 accent-primary" />
                    Notify customer through configured email/WhatsApp workflow
                </label>
                <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => { if (customerLink) { navigator.clipboard.writeText(customerLink); toast.success('Secure customer link copied'); } }} disabled={!customerLink} className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-text-main disabled:opacity-50 dark:text-white">
                        <Copy className="h-3.5 w-3.5" /> Copy secure link
                    </button>
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-emerald/30 bg-emerald/10 px-4 py-2.5 text-xs font-bold text-emerald">
                        <ExternalLink className="h-3.5 w-3.5" /> Open WhatsApp
                    </a>
                    <button type="button" onClick={() => void sendReply()} disabled={sending || !draft.trim()} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-black text-white disabled:opacity-50">
                        {sending ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Send reply
                    </button>
                </div>
            </div>
        </section>
    );
};

export default InquiryConversation;
