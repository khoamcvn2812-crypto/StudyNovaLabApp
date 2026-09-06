const NO_STORE = { 'Cache-Control': 'no-store, no-cache, must-revalidate', Pragma: 'no-cache' };
const MAX_BODY_BYTES = 64 * 1024;
const MAX_MESSAGES = 12;
const MAX_MESSAGE_CHARS = 6000;
const MAX_HISTORY_CHARS = 18000;

const INSTRUCTIONS = `You are StudyNova AI Coach, an AI learning assistant for IELTS learners, including school-age learners.
- Reply in the interface language supplied by the server, unless the learner explicitly asks for another explanation language. Keep the explanation language distinct from the language being learned.
- Help explain vocabulary, grammar and collocations; correct sentences and explain errors; give useful Writing feedback; and practise Speaking through text conversation. Use clear examples and invite the learner to try.
- Any IELTS band score is only an informal estimate, never an official result. Do not assess pronunciation from text alone; say that audio would be required.
- Use only learning context explicitly included in the request. If information is missing, say so instead of inventing progress or personal data. Never claim to update vocabulary, streaks, review schedules or progress.
- Be supportive, age-appropriate, and transparent that you are an AI assistant. Do not browse the web, generate images, or claim to use unavailable tools.`;

function envInt(name, fallback, min, max) {
  const value = Number.parseInt(process.env[name] || '', 10);
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}

function send(res, status, code, language = 'vi', details = {}) {
  const messages = {
    disabled: ['AI Coach chưa được bật.', 'AI Coach is not enabled.'],
    not_configured: ['AI Coach chưa được cấu hình đầy đủ.', 'AI Coach is not fully configured.'],
    unauthorized: ['Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'Your session has expired. Please sign in again.'],
    quota_exceeded: ['Bạn đã hết lượt AI trong khoảng thời gian này. Vui lòng thử lại sau.', 'You have reached the AI usage limit. Please try again later.'],
    invalid_request: ['Nội dung gửi lên không hợp lệ hoặc quá dài.', 'The request is invalid or too large.'],
    rate_limited: ['OpenAI đang giới hạn tốc độ. Vui lòng thử lại sau.', 'OpenAI is rate limiting requests. Please try again later.'],
    billing_error: ['Tài khoản OpenAI đã hết quota hoặc có vấn đề thanh toán.', 'The OpenAI account has no remaining quota or has a billing issue.'],
    model_unavailable: ['Model được cấu hình không khả dụng hoặc không hỗ trợ yêu cầu này.', 'The configured model is unavailable or does not support this request.'],
    timeout: ['AI Coach phản hồi quá lâu. Vui lòng thử lại.', 'AI Coach took too long to respond. Please try again.'],
    empty_response: ['AI Coach không trả về nội dung. Vui lòng thử lại.', 'AI Coach returned no content. Please try again.'],
    server_error: ['AI Coach tạm thời gặp lỗi. Vui lòng thử lại sau.', 'AI Coach is temporarily unavailable. Please try again later.']
  };
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  Object.entries(NO_STORE).forEach(([key, value]) => res.setHeader(key, value));
  res.end(JSON.stringify({ error: { code, message: (messages[code] || messages.server_error)[language === 'en' ? 1 : 0], ...details } }));
}

function validateBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  if (body.model !== undefined || body.instructions !== undefined || body.max_output_tokens !== undefined || body.apiUrl !== undefined || body.userId !== undefined) return null;
  const language = body.language === 'en' ? 'en' : body.language === 'vi' ? 'vi' : null;
  if (!language || !Array.isArray(body.messages) || body.messages.length < 1 || body.messages.length > MAX_MESSAGES) return null;
  let total = 0;
  const messages = [];
  for (const item of body.messages) {
    if (!item || !['user', 'assistant'].includes(item.role) || typeof item.content !== 'string') return null;
    const content = item.content.trim();
    if (!content || content.length > MAX_MESSAGE_CHARS) return null;
    total += content.length;
    if (total > MAX_HISTORY_CHARS) return null;
    messages.push({ role: item.role, content });
  }
  if (messages.at(-1).role !== 'user') return null;
  return { language, messages };
}

function classifyOpenAIError(error) {
  const status = Number(error?.status || 0);
  const code = String(error?.code || error?.error?.code || '').toLowerCase();
  if (error?.name === 'AbortError') return [504, 'timeout'];
  if (status === 429 && (code.includes('quota') || code.includes('billing'))) return [402, 'billing_error'];
  if (status === 429) return [429, 'rate_limited'];
  if (status === 404 || code.includes('model')) return [400, 'model_unavailable'];
  return [502, 'server_error'];
}

export function createHandler(deps = {}) {
  return async function handler(req, res) {
    Object.entries(NO_STORE).forEach(([key, value]) => res.setHeader(key, value));
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return send(res, 405, 'invalid_request'); }
    const length = Number(req.headers['content-length'] || 0);
    if (length > MAX_BODY_BYTES) return send(res, 413, 'invalid_request');
    if (process.env.AI_COACH_ENABLED !== 'true') return send(res, 503, 'disabled');
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    if (!apiKey || !model || !supabaseUrl || !supabaseKey) return send(res, 503, 'not_configured');
    const body = validateBody(req.body);
    const language = body?.language || 'vi';
    if (!body) return send(res, 400, 'invalid_request', language);
    const token = String(req.headers.authorization || '').match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) return send(res, 401, 'unauthorized', language);

    try {
      const createClient = deps.supabase ? null : (deps.createClient || (await import('@supabase/supabase-js')).createClient);
      const supabase = deps.supabase || createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false, autoRefreshToken: false }, global: { headers: { Authorization: `Bearer ${token}` } } });
      const auth = await supabase.auth.getUser(token);
      if (auth.error || !auth.data?.user) return send(res, 401, 'unauthorized', language);
      const limits = {
        p_minute_limit: envInt('AI_RATE_LIMIT_PER_MINUTE', 5, 1, 100),
        p_daily_limit: envInt('AI_RATE_LIMIT_PER_DAY', 30, 1, 10000),
        p_app_daily_limit: envInt('AI_APP_LIMIT_PER_DAY', 1000, 1, 1000000)
      };
      const quota = await supabase.rpc('consume_ai_coach_quota', limits);
      if (quota.error) return send(res, 503, 'not_configured', language);
      const allowed = Array.isArray(quota.data) ? quota.data[0]?.allowed : quota.data?.allowed;
      if (!allowed) return send(res, 429, 'quota_exceeded', language, { retryAfterSeconds: 60 });

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), envInt('AI_REQUEST_TIMEOUT_MS', 25000, 3000, 60000));
      if (req.on) req.on('aborted', () => controller.abort());
      try {
        const OpenAI = deps.openai ? null : (deps.OpenAI || (await import('openai')).default);
        const openai = deps.openai || new OpenAI({ apiKey, maxRetries: 0 });
        const response = await openai.responses.create({
          model,
          instructions: `${INSTRUCTIONS}\nThe current interface language is ${language === 'en' ? 'English' : 'Vietnamese'}.`,
          input: body.messages,
          max_output_tokens: envInt('AI_MAX_OUTPUT_TOKENS', 800, 100, 2000),
          store: false
        }, { signal: controller.signal });
        const text = String(response.output_text || '').trim();
        if (!text) return send(res, 502, 'empty_response', language);
        res.status(200).setHeader('Content-Type', 'application/json; charset=utf-8');
        return res.end(JSON.stringify({ text }));
      } catch (error) {
        const [status, code] = classifyOpenAIError(error);
        return send(res, status, code, language);
      } finally { clearTimeout(timer); }
    } catch { return send(res, 500, 'server_error', language); }
  };
}

export const handler = createHandler();
export default handler;
export { validateBody, classifyOpenAIError, MAX_BODY_BYTES };
