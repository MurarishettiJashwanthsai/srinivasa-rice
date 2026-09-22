import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCheck, MessageCircle, RefreshCw, Send, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config/api';
import useMeta from '../hooks/useMeta';

const formatMessageTime = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true,
    });
};

const EnquiryConversation = () => {
    const token = typeof window === 'undefined' ? '' : window.location.hash.slice(1);
    const [conversation, setConversation] = useState(null);
    const [draft, setDraft] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const bottomRef = useRef(null);

    useMeta({
        title: 'Secure Enquiry Conversation | Sri Srinivasa Canvassing',
        description: 'Securely continue a submitted wholesale rice enquiry with our sourcing desk.',
        canonical: 'https://www.srinivascanvassing.com/contact',
        robots: 'noindex, nofollow, noarchive',
    });

    const loadConversation = useCallback(async ({ quiet = false } = {}) => {
        if (!token) {
            if (!quiet) {
                setError('This conversation link is incomplete. Please use the full link sent by our sourcing team.');
                setLoading(false);
            }
            return;
        }
        if (!quiet) setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/conversations?t=${Date.now()}`, {
                cache: 'no-store',
                headers: { Authorization: `Bearer ${token}` },
            });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(payload.detail || 'Unable to open this conversation.');
            setConversation(payload);
            setError('');
        } catch (requestError) {
            if (!quiet) setError(requestError.message || 'Unable to open this conversation.');
        } finally {
            if (!quiet) setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        const initialLoad = window.setTimeout(() => void loadConversation(), 0);
        const poll = window.setInterval(() => void loadConversation({ quiet: true }), 15000);
        return () => {
            window.clearTimeout(initialLoad);
            window.clearInterval(poll);
        };
    }, [loadConversation]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [conversation?.messages?.length]);

    const sendMessage = async (event) => {
        event.preventDefault();
        const body = draft.trim();
        if (!body || sending) return;
        setSending(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/conversations/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ body }),
            });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(payload.detail || 'Unable to send your message.');
            setDraft('');
            await loadConversation({ quiet: true });
            toast.success('Message sent to our sourcing desk.');
        } catch (requestError) {
            toast.error(requestError.message || 'Unable to send your message.');
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return <div className="min-h-[65vh] flex items-center justify-center"><RefreshCw className="h-8 w-8 animate-spin text-primary" aria-label="Loading conversation" /></div>;
    }

    if (error || !conversation) {
        return (
            <section className="mx-auto max-w-2xl px-4 py-20 text-center">
                <ShieldCheck className="mx-auto h-12 w-12 text-primary" />
                <h1 className="mt-5 text-3xl font-display font-black">Conversation unavailable</h1>
                <p className="mt-3 text-text-muted">{error || 'This secure conversation could not be found.'}</p>
                <Link to="/contact" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-white"><ArrowLeft className="h-4 w-4" /> Contact our team</Link>
            </section>
        );
    }

    return (
        <section className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
            <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-xl">
                <header className="bg-secondary px-5 py-6 text-white sm:px-8">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary-light">Secure enquiry conversation</p>
                            <h1 className="mt-2 text-2xl font-display font-black sm:text-3xl">{conversation.request_id}</h1>
                            <p className="mt-2 text-sm text-slate-300">Hello {conversation.customer_name}. Messages here are visible only to you and our authorized sourcing team.</p>
                        </div>
                        <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider">{conversation.status || 'Open'}</span>
                    </div>
                </header>

                <div className="max-h-[55vh] min-h-[340px] space-y-4 overflow-y-auto bg-slate-50 p-4 sm:p-7">
                    <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-text-main">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Original requirement</p>
                        <p className="mt-1 whitespace-pre-wrap break-words">{conversation.original_inquiry}</p>
                    </div>
                    {conversation.messages.length === 0 && (
                        <div className="mx-auto max-w-md py-16 text-center">
                            <MessageCircle className="mx-auto h-10 w-10 text-primary" />
                            <h2 className="mt-4 font-display text-xl font-black text-text-main">Continue your enquiry here</h2>
                            <p className="mt-2 text-sm text-text-muted">Ask a question or provide additional quantity, packaging or delivery information.</p>
                        </div>
                    )}
                    {conversation.messages.map((message) => {
                        const fromCustomer = message.sender === 'customer';
                        return (
                            <div key={message.id} className={`flex ${fromCustomer ? 'justify-end' : 'justify-start'}`}>
                                <article className={`max-w-[88%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[75%] ${fromCustomer ? 'rounded-br-md bg-primary text-white' : 'rounded-bl-md border border-border bg-white text-text-main'}`}>
                                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.body}</p>
                                    <div className={`mt-2 flex items-center justify-end gap-1 text-[10px] ${fromCustomer ? 'text-white/75' : 'text-text-muted'}`}>
                                        <span>{formatMessageTime(message.created_at)}</span>
                                        {fromCustomer && message.read_by_admin_at && <CheckCheck className="h-3.5 w-3.5" aria-label="Read by the sourcing desk" />}
                                    </div>
                                </article>
                            </div>
                        );
                    })}
                    <div ref={bottomRef} />
                </div>

                <form onSubmit={sendMessage} className="border-t border-border bg-white p-4 sm:p-6">
                    <label htmlFor="customer-chat-message" className="sr-only">Message to the sourcing desk</label>
                    <textarea
                        id="customer-chat-message"
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        maxLength={2000}
                        rows={3}
                        placeholder="Type your message…"
                        className="w-full resize-none rounded-2xl border border-border bg-surface px-4 py-3 text-text-main outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs text-text-muted">Do not send passwords, payment-card details or identity documents here.</p>
                        <button type="submit" disabled={sending || !draft.trim()} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50">
                            {sending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send message
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default EnquiryConversation;
