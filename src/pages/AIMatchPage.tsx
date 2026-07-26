import React, { useState, useEffect, useRef } from 'react';
import { Movie, Language } from '../types';
import { generateAIMoodMatch, sendAIChatMessage } from '../services/gemini';
import { MovieCard } from '../components/MovieCard';
import { SkeletonCard } from '../components/SkeletonCard';
import {
  Sparkles,
  Send,
  RefreshCw,
  MessageSquareQuote,
  Bot,
  User,
  Film,
  SlidersHorizontal,
  MessageSquare,
} from 'lucide-react';
import { translations } from '../data/translations';

interface Props {
  language: Language;
  watchlist: Movie[];
  initialMoodPrompt?: string;
  onToggleWatchlist: (movie: Movie, e?: React.MouseEvent) => void;
  onSelectMovie: (movie: Movie) => void;
}

interface ChatMessageItem {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  movies?: Movie[];
  timestamp: string;
}

export const AIMatchPage: React.FC<Props> = ({
  language,
  watchlist,
  initialMoodPrompt = '',
  onToggleWatchlist,
  onSelectMovie,
}) => {
  const t = translations[language];

  // Active Sub Mode: 'generator' | 'chat'
  const [activeSubTab, setActiveSubTab] = useState<'generator' | 'chat'>('generator');

  // Generator State
  const [moodInput, setMoodInput] = useState<string>(initialMoodPrompt);
  const [activeMoodQuery, setActiveMoodQuery] = useState<string>(
    initialMoodPrompt || 'dark and mysterious'
  );
  const [aiSummary, setAiSummary] = useState<string>('');
  const [matchedMovies, setMatchedMovies] = useState<Movie[]>([]);
  const [generatorLoading, setGeneratorLoading] = useState<boolean>(false);

  // Chat State
  const [chatInput, setChatInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessageItem[]>([]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    'My mood is dark and mysterious',
    'I want a scary movie',
    'I need a relaxing comedy',
    'Korean psychological thriller',
    'Romantic but not sad',
    'Epic sci-fi space adventure',
  ];

  const quickChatPrompts = [
    language === 'ur' ? 'I like Shutter Island, mujhe is jaisi aur movies batao' : 'I like Shutter Island, suggest similar movies',
    language === 'ur' ? 'Maine ye sab dekh li hain, aur movies batao' : 'I have seen all of these, give me more recommendations',
    language === 'ur' ? 'Mujhe psychological horror & K-Dramas chahiye' : 'I want psychological horror and top K-Dramas',
    language === 'ur' ? 'Interstellar ki summary aur genre kya hai?' : 'What is the summary and genre of Interstellar?',
  ];

  // Initialize Chat Welcome Message
  useEffect(() => {
    const welcomeText =
      language === 'ur'
        ? 'Assalam-o-Alaikum! Main aap ka MoodFlix AI Cinema Assistant hoon. Aap kisi bhi movie ki summary, rating, genre poochna chahein, ya apni marzi ki movie maangna chahein, bas yahan likhein!'
        : 'Hello! I am your MoodFlix AI Cinema Assistant. You can ask me for movie summaries, ratings, genres, or describe what kind of film you want to watch!';

    setChatMessages([
      {
        id: 'welcome_1',
        sender: 'ai',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [language]);

  // Generator Handler
  const handleMatch = async (queryToRun?: string) => {
    const q = (queryToRun || moodInput || activeMoodQuery).trim();
    if (!q) return;

    setActiveMoodQuery(q);
    setGeneratorLoading(true);

    try {
      const result = await generateAIMoodMatch(q, language);
      setAiSummary(result.aiSummary);
      setMatchedMovies(result.movies);
    } catch (err) {
      console.error('AI match error:', err);
    } finally {
      setGeneratorLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const query = initialMoodPrompt || 'dark and mysterious';
    
    if (initialMoodPrompt) {
      setMoodInput(initialMoodPrompt);
    }

    setActiveMoodQuery(query);
    setGeneratorLoading(true);

    generateAIMoodMatch(query, language)
      .then((result) => {
        if (isMounted) {
          setAiSummary(result.aiSummary);
          setMatchedMovies(result.movies);
        }
      })
      .catch((err) => {
        console.error('AI match initial error:', err);
      })
      .finally(() => {
        if (isMounted) {
          setGeneratorLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [initialMoodPrompt, language]);

  // Auto scroll chat to bottom
  useEffect(() => {
    if (activeSubTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeSubTab, chatLoading]);

  // Chat Submit Handler
  const handleSendChat = async (textToSend?: string) => {
    const msg = (textToSend || chatInput).trim();
    if (!msg || chatLoading) return;

    const userMsgId = 'user_' + Date.now();
    const newMsg: ChatMessageItem = {
      id: userMsgId,
      sender: 'user',
      text: msg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...chatMessages, newMsg];
    setChatMessages(updatedMessages);
    if (!textToSend) setChatInput('');
    setChatLoading(true);

    // Collect all titles previously recommended in chat
    const previouslyRecommended = chatMessages
      .flatMap((m) => m.movies?.map((mov) => mov.title) || [])
      .filter(Boolean);

    const historyForApi = updatedMessages.map((m) => ({
      sender: m.sender,
      text: m.text,
    }));

    try {
      const response = await sendAIChatMessage(msg, language, historyForApi, previouslyRecommended);
      const aiMsg: ChatMessageItem = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        text: response.replyText,
        movies: response.movies,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessageItem = {
        id: 'err_' + Date.now(),
        sender: 'ai',
        text:
          language === 'ur'
            ? 'Maazrat, jawaz process karne mein masla hua. Kripya dobara koshish karein.'
            : 'Sorry, I encountered an issue processing your request. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleGeneratorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleMatch();
  };

  const isMovieInWatchlist = (id: number) => watchlist.some((m) => m.id === id);

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#292a2a] pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-r from-[#f2ca50] to-[#c1121f] text-[#3c2f00] shadow-lg shrink-0">
            <Sparkles size={24} className="fill-[#3c2f00]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Sora']">
              {t.aiTitle}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 font-medium">
              {t.aiSubtitle}
            </p>
          </div>
        </div>

        {/* Sub Tab Switcher: Generator vs Chat */}
        <div className="flex items-center bg-[#1e2020] p-1.5 rounded-2xl border border-[#292a2a] shadow-inner shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab('generator')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer min-h-[44px] ${
              activeSubTab === 'generator'
                ? 'bg-[#f2ca50] text-[#3c2f00] shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-[#292a2a]'
            }`}
          >
            <SlidersHorizontal size={16} />
            <span>{t.aiTabGenerator}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('chat')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer min-h-[44px] ${
              activeSubTab === 'chat'
                ? 'bg-[#c1121f] text-white shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-[#292a2a]'
            }`}
          >
            <MessageSquare size={16} />
            <span>{t.aiTabChat}</span>
          </button>
        </div>
      </div>

      {/* ================= MODE 1: MOOD GENERATOR ================= */}
      {activeSubTab === 'generator' && (
        <div className="space-y-6 sm:space-y-8 animate-fadeIn">
          {/* Input Form & Prompt Chips */}
          <div className="bg-[#1e2020] border border-[#f2ca50]/30 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
            <form onSubmit={handleGeneratorSubmit} className="relative">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={moodInput}
                  onChange={(e) => setMoodInput(e.target.value)}
                  placeholder={t.aiInputPlaceholder}
                  className="flex-1 bg-[#121414] border border-[#292a2a] focus:border-[#f2ca50] rounded-2xl px-4 py-3.5 text-white text-sm sm:text-base placeholder-neutral-500 focus:outline-none font-medium transition-all min-h-[48px]"
                />
                <button
                  type="submit"
                  disabled={generatorLoading}
                  className="bg-gradient-to-r from-[#f2ca50] to-[#d4af37] text-[#3c2f00] hover:scale-105 active:scale-95 disabled:opacity-50 px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl transition-all shrink-0 cursor-pointer min-h-[48px]"
                >
                  {generatorLoading ? (
                    <RefreshCw size={18} className="animate-spin text-[#3c2f00]" />
                  ) : (
                    <Send size={18} className="fill-[#3c2f00]" />
                  )}
                  <span>{t.aiMatchButton}</span>
                </button>
              </div>
            </form>

            {/* Sample Mood Pills */}
            <div className="space-y-2.5">
              <p className="text-xs sm:text-sm text-[#f2ca50] font-bold">
                {t.aiExamplesTitle}
              </p>
              <div className="flex flex-wrap gap-2">
                {samplePrompts.map((promptText, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setMoodInput(promptText);
                      handleMatch(promptText);
                    }}
                    className={`text-xs sm:text-sm px-3.5 py-2 rounded-full font-medium transition-all shadow-sm active:scale-95 border min-h-[38px] ${
                      activeMoodQuery === promptText
                        ? 'bg-[#f2ca50] text-[#3c2f00] font-bold border-[#f2ca50]'
                        : 'bg-[#121414] text-neutral-300 hover:text-[#f2ca50] border-[#292a2a] hover:border-[#f2ca50]/40'
                    }`}
                  >
                    ✨ {promptText}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI Reasoning Banner */}
          {aiSummary && !generatorLoading && (
            <div className="bg-gradient-to-r from-[#f2ca50]/15 via-[#1e2020] to-[#c1121f]/15 border border-[#f2ca50]/40 rounded-2xl p-5 shadow-xl space-y-2">
              <div className="flex items-center gap-2 text-[#f2ca50] font-bold text-sm sm:text-base">
                <MessageSquareQuote size={20} />
                <span>AI Mood Analysis ({language === 'ur' ? 'Roman Urdu' : 'English'}):</span>
              </div>
              <p className="text-white text-sm sm:text-base leading-relaxed font-semibold">
                {aiSummary}
              </p>
            </div>
          )}

          {/* Loading State */}
          {generatorLoading ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-[#f2ca50] text-sm sm:text-base font-bold py-6">
                <RefreshCw size={22} className="animate-spin" />
                <span>{t.aiSearching}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            </div>
          ) : (
            /* Results Grid */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-xl font-extrabold text-white font-['Sora']">
                  Recommended Matches for &ldquo;{activeMoodQuery}&rdquo;
                </h2>
                <span className="text-xs sm:text-sm text-neutral-400 font-medium">
                  {matchedMovies.length} {t.resultsCount}
                </span>
              </div>

              {matchedMovies.length === 0 ? (
                <div className="text-center py-12 bg-[#1e2020] rounded-3xl border border-[#292a2a] p-6">
                  <p className="text-neutral-300 text-sm sm:text-base">{t.aiNoResults}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {matchedMovies.map((movie) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      language={language}
                      isInWatchlist={isMovieInWatchlist(movie.id)}
                      onToggleWatchlist={onToggleWatchlist}
                      onClick={onSelectMovie}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ================= MODE 2: INTERACTIVE AI CHAT ================= */}
      {activeSubTab === 'chat' && (
        <div className="bg-[#1e2020] border border-[#f2ca50]/30 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 animate-fadeIn flex flex-col min-h-[500px]">
          {/* Chat Header Welcome */}
          <div className="bg-[#121414] border border-[#292a2a] rounded-2xl p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#c1121f] text-white shadow-md shrink-0">
              <Bot size={22} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white font-['Sora']">
                {t.chatWelcomeTitle}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400">
                {t.chatWelcomeSubtitle}
              </p>
            </div>
          </div>

          {/* Quick Prompts Chips */}
          <div className="space-y-1.5">
            <span className="text-xs text-[#f2ca50] font-bold">
              {t.chatQuickQueries}
            </span>
            <div className="flex flex-wrap gap-2">
              {quickChatPrompts.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendChat(q)}
                  className="text-xs sm:text-sm bg-[#121414] hover:bg-[#292a2a] border border-[#292a2a] hover:border-[#f2ca50]/50 text-neutral-300 hover:text-[#f2ca50] px-3 py-1.5 rounded-xl font-medium transition-all text-left active:scale-95 cursor-pointer min-h-[36px]"
                >
                  💬 {q}
                </button>
              ))}
            </div>
          </div>

          {/* Chat History Box */}
          <div className="flex-1 bg-[#121414] border border-[#292a2a] rounded-2xl p-4 sm:p-5 overflow-y-auto max-h-[500px] space-y-5">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#f2ca50] text-[#3c2f00] flex items-center justify-center font-bold shrink-0 shadow-md">
                    <Bot size={18} />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 space-y-3 shadow-lg text-sm sm:text-base ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-[#c1121f] to-[#9e0e18] text-white rounded-tr-none'
                      : 'bg-[#1e2020] border border-[#292a2a] text-neutral-100 rounded-tl-none'
                  }`}
                >
                  <p className="leading-relaxed font-medium whitespace-pre-wrap">
                    {msg.text}
                  </p>

                  {/* If message includes recommended movie cards */}
                  {msg.movies && msg.movies.length > 0 && (
                    <div className="pt-2 border-t border-[#292a2a] space-y-3">
                      <div className="flex items-center gap-1.5 text-xs text-[#f2ca50] font-bold">
                        <Film size={14} />
                        <span>Featured Movie Recommendations:</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {msg.movies.map((m) => (
                          <div
                            key={m.id}
                            onClick={() => onSelectMovie(m)}
                            className="bg-[#121414] hover:bg-[#292a2a] border border-[#292a2a] hover:border-[#f2ca50] rounded-xl p-3 flex gap-3 cursor-pointer transition-all group"
                          >
                            <img
                              src={
                                m.poster_path
                                  ? `https://image.tmdb.org/t/p/w200${m.poster_path}`
                                  : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&q=80'
                              }
                              alt={m.title}
                              className="w-14 h-20 object-cover rounded-lg shrink-0 group-hover:scale-105 transition-all"
                            />
                            <div className="flex-1 min-w-0 space-y-1">
                              <h4 className="text-xs sm:text-sm font-bold text-white truncate font-['Sora'] group-hover:text-[#f2ca50]">
                                {m.title}
                              </h4>
                              <p className="text-[11px] sm:text-xs text-[#f2ca50] font-extrabold">
                                ⭐ {m.vote_average ? m.vote_average.toFixed(1) : '8.5'} / 10
                              </p>
                              <p className="text-[11px] sm:text-xs text-neutral-400 line-clamp-2">
                                {m.aiMatchReason || m.overview}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <span className="block text-[10px] text-neutral-400 text-right font-mono">
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#292a2a] text-white flex items-center justify-center font-bold shrink-0">
                    <User size={18} />
                  </div>
                )}
              </div>
            ))}

            {chatLoading && (
              <div className="flex gap-3 items-center text-[#f2ca50] text-xs sm:text-sm font-bold py-2">
                <div className="w-8 h-8 rounded-xl bg-[#f2ca50] text-[#3c2f00] flex items-center justify-center font-bold shrink-0">
                  <Bot size={18} />
                </div>
                <div className="bg-[#1e2020] border border-[#292a2a] rounded-2xl px-4 py-3 flex items-center gap-2">
                  <RefreshCw size={16} className="animate-spin" />
                  <span>AI is typing & thinking...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChat();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={t.chatInputPlaceholder}
              className="flex-1 bg-[#121414] border border-[#292a2a] focus:border-[#f2ca50] rounded-2xl px-4 py-3 text-white text-sm sm:text-base placeholder-neutral-500 focus:outline-none font-medium transition-all min-h-[48px]"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="bg-gradient-to-r from-[#c1121f] to-[#f2ca50] text-white hover:scale-105 active:scale-95 disabled:opacity-50 px-5 sm:px-6 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl transition-all shrink-0 cursor-pointer min-h-[48px]"
            >
              <Send size={18} />
              <span className="hidden sm:inline">{t.chatSend}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
