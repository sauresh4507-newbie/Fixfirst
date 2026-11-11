import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Send, BrainCircuit, Wrench, CheckCircle, AlertCircle } from 'lucide-react';
import { repairAPI, aiAPI } from '../../services/api';
import { Spinner } from '../../components/ui/Loading';
import { useToast } from '../../components/ui/Toast';

const Troubleshoot = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const messagesEndRef = useRef(null);

  const [request, setRequest] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    fetchRequest();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchRequest = async () => {
    try {
      const { data } = await repairAPI.getById(id);
      setRequest(data.request);

      // Start the conversation with AI context
      const ai = data.request.aiAnalysis;
      const initialMessage = ai?.summary
        ? `I can see you have an issue with your ${data.request.deviceBrand} ${data.request.deviceModel}. ${ai.summary} Let me help you troubleshoot this step by step. Can you describe exactly what you are experiencing right now?`
        : `Hello! I will help you troubleshoot your ${data.request.deviceBrand} ${data.request.deviceModel}. Can you describe exactly what is happening?`;

      setMessages([{ role: 'assistant', content: initialMessage }]);
    } catch {
      toast.error('Repair request not found');
      navigate('/repairs');
    } finally {
      setInitialLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const { data } = await aiAPI.troubleshoot({
        messages: newMessages.map(({ role, content }) => ({ role, content })),
        deviceContext: {
          brand: request.deviceBrand,
          model: request.deviceModel,
          category: request.deviceCategory,
          issueCategory: request.issueCategory,
          issueDescription: request.issueDescription,
        },
        repairRequestId: id,
      });

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.response.message },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I apologize, I had trouble connecting. Please try again or seek professional repair assistance.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleEscalate = async () => {
    try {
      await repairAPI.escalate(id);
      toast.success('Request sent to vendors!');
      navigate(`/repairs/${id}/quotations`);
    } catch (err) {
      toast.error('Failed to escalate');
    }
  };

  const handleResolve = async () => {
    try {
      await repairAPI.close(id);
      setResolved(true);
      toast.success('Great! Glad your issue is resolved.');
    } catch {
      toast.error('Failed to close request');
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Spinner size="xl" />
          <p className="text-sm text-[#737373] mt-4">Loading AI assistant...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to={`/repairs/${id}`} className="inline-flex items-center gap-2 text-sm text-[#737373] hover:text-[#111111] mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Repair
      </Link>

      {/* Header */}
      <div className="card p-4 mb-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#111111] flex items-center justify-center">
          <BrainCircuit className="w-5 h-5 text-white" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#111111]">AI Troubleshoot Assistant</p>
          <p className="text-xs text-[#737373]">
            {request?.deviceBrand} {request?.deviceModel} · {request?.issueCategory}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-[#737373]">Online</span>
        </div>
      </div>

      {/* Resolved state */}
      {resolved && (
        <div className="card p-6 mb-4 text-center">
          <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-[#111111] mb-2">Issue Resolved!</h3>
          <p className="text-sm text-[#737373] mb-4">
            Your request has been closed. If the issue returns, create a new repair request.
          </p>
          <Link to="/dashboard" className="btn-primary inline-flex">
            Back to Dashboard
          </Link>
        </div>
      )}

      {/* Chat window */}
      <div className="card overflow-hidden">
        <div className="h-[400px] overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-[#111111] flex items-center justify-center shrink-0 mr-2 mt-0.5">
                  <BrainCircuit className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#111111] text-white rounded-br-sm'
                    : 'bg-[#F5F5F5] text-[#111111] rounded-bl-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full bg-[#111111] flex items-center justify-center shrink-0 mr-2 mt-0.5">
                <BrainCircuit className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-[#F5F5F5] px-4 py-3 rounded-2xl rounded-bl-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-[#A3A3A3] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-[#A3A3A3] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-[#A3A3A3] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {!resolved && (
          <div className="border-t border-[#E5E5E5] p-4">
            <form onSubmit={sendMessage} className="flex gap-3">
              <input
                type="text"
                className="input-field flex-1"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="btn-primary flex items-center gap-2 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Resolution actions */}
      {messages.length > 3 && !resolved && (
        <div className="mt-4 p-4 bg-[#F5F5F5] rounded-xl">
          <p className="text-sm font-semibold text-[#111111] mb-3">Did this help?</p>
          <div className="flex gap-3">
            <button onClick={handleResolve} className="btn-secondary flex items-center gap-2 flex-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Yes, it's fixed
            </button>
            <button onClick={handleEscalate} className="btn-primary flex items-center gap-2 flex-1">
              <Wrench className="w-4 h-4" />
              Find a Vendor
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-start gap-2 text-xs text-[#737373]">
        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <p>AI troubleshooting is for guidance only. For hardware issues, always consult a professional repair vendor.</p>
      </div>
    </div>
  );
};

export default Troubleshoot;
