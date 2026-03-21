const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app/panel/design/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add showSuggestions state after aiCredits state line
content = content.replace(
  "    const [miniLoading, setMiniLoading] = useState(false);",
  "    const [miniLoading, setMiniLoading] = useState(false);\n    const [showSuggestions, setShowSuggestions] = useState(false);"
);

// 2. Replace the whole AI bar inner content (from the flex items div to end of chips div)
const oldBar = `                            <div className="flex items-center gap-3 bg-[#1a1a1a] border border-white/[0.08] rounded-2xl px-4 py-3 focus-within:border-violet-500/40 transition-all shadow-lg shadow-black/20">
                                <Sparkles size={18} className="text-violet-400 flex-shrink-0" />
                                <input type="text" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAiGenerate(); } }} placeholder="Nasıl bir tasarım istiyorsun? Örn: İzmir Ege cafesi, deniz mavisi..." className="flex-1 bg-transparent text-[14px] text-gray-200 placeholder:text-gray-500 focus:outline-none" />
                                <span className="text-[10px] text-gray-500 flex-shrink-0 whitespace-nowrap">{aiCredits !== null ? aiCredits : '...'} kredi</span>
                                <button onClick={handleAiGenerate} disabled={aiLoading || !aiPrompt.trim() || (aiCredits !== null && aiCredits < 2)} className="px-4 py-2 rounded-xl text-[12px] font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white flex-shrink-0 flex items-center gap-2">
                                    {aiLoading ? <><Loader2 size={14} className="animate-spin" /> Üretiyor...</> : <>Oluştur</>}
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-2 justify-center">
                                {['Lüks altın ve siyah tema', 'Ege sahil cafesi', 'Minimalist beyaz', 'Modern koyu tema'].map((chip) => (<button key={chip} onClick={() => setAiPrompt(chip)} className="px-3 py-1 rounded-full text-[11px] bg-white/[0.04] border border-white/[0.06] text-gray-500 hover:text-gray-300 hover:bg-white/[0.08] transition-all">{chip}</button>))}
                            </div>`;

const newBar = `                            {/* Suggestions popup */}
                            {showSuggestions && (
                                <div className="absolute bottom-[calc(100%+8px)] left-0 right-0 z-50 bg-[#111] border border-white/[0.1] rounded-2xl shadow-2xl shadow-black/40 p-3 max-h-[380px] overflow-y-auto">
                                    <p className="text-[10px] text-gray-500 uppercase font-semibold px-2 mb-2">Hazır Öneriler</p>
                                    <div className="grid grid-cols-1 gap-1">
                                        {[
                                            'Lüks altın ve mat siyah tema, derin gölgeler, altın vurgu rengi',
                                            'Akdeniz sahil cafesi, turkuaz ve kum beji tonları, yumuşak gölgeler',
                                            'Minimalist İskandinav, saf beyaz, açık gri, siyah tipografi',
                                            'Koyu gece modu, deep navy ve mor tonları, neon vurgu',
                                            'Bahar pasteli, soft pembe ve mint yeşili, hafif drop shadow',
                                            'Endüstriyel çelik grisi, cam efekti, turuncu aksanlar',
                                            'Japon minimalizmi, beyaz arka plan, siyah Zen vurgu, sıfır gölge',
                                            'Vintage kahvaltı, sıcak kahverengi ve krem, eski kağıt dokusu hissi',
                                            'Neon gece kulübü, siyah zemin, elektrik mavisi ve pürpür gölgeler',
                                            'Doğa teması, yaprak yeşili ve toprak tonu, yumuşak iç gölge',
                                            'Lüks otel bar, bordo ve altın, ince kenar gölgeleri',
                                            'Modern şehirli kafe, slate gri ve beyaz, keskin drop shadow',
                                            'Pastellerin prensesi, lavanta ve gül pembesi, yumuşak parlama',
                                            'Japon ramen dükkanı, kırmızı ve siyah, yatay çizgi aksanlar',
                                            'Art Deco restoran, altın geometrik, koyu bordo arka plan',
                                            'Okyanus mavisi dalga, derin safir ve yüzeysel beyaz köpük',
                                            'Toskana mutfağı, zeytin yeşili ve terra cotta, doğal gölgeler',
                                            'Siyah beyaz klasik bistro, striped desenler, kırmızı detay',
                                            'Miami beach vibe, neon pembe ve cyan, parlak ışık gölgeleri',
                                            'Farm to table, açık yeşil ve ahşap tonu, yumuşak iç gölge',
                                            'Ultra modern dark, saf siyah, minimal beyaz çizgiler, glow efekt',
                                            'Meksika tavernası, turuncu ve sarı, canlı arka plan gölgeleri',
                                            'Kore street food, neşeli kırmızı ve beyaz, yuvarlak köşeler',
                                            'Fransız patisserie, krem ve gül altını, zarif drop shadow',
                                            'Tech startup kafe, gradient mor-mavi, glassmorphism efekti',
                                            'Bohem yaratıcı, terracotta ve koyu yeşil, organik gölgeler',
                                            'Steakhouse prime, koyu meşe ve derin kırmızı, güçlü gölge',
                                            'Sushi minimal, beyaz ve siyah, ince kırmızı aksanlar',
                                            'Tropikal ada barı, sarı ve palmiye yeşili, gün batımı gölgeleri',
                                            'Akşam fine dining, koyu navy, gümüş ve altın, zarif ışık efekti',
                                        ].map((s) => (
                                            <button key={s} onClick={() => { setAiPrompt(s); setShowSuggestions(false); }}
                                                className="text-left px-3 py-2.5 rounded-xl text-[12px] text-gray-300 hover:bg-white/[0.06] hover:text-white transition-all leading-relaxed">
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-3 bg-[#1a1a1a] border border-white/[0.08] rounded-2xl px-4 py-3 focus-within:border-violet-500/40 transition-all shadow-lg shadow-black/20">
                                <Sparkles size={18} className="text-violet-400 flex-shrink-0" />
                                <input type="text" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAiGenerate(); } }} placeholder="Nasıl bir tasarım istiyorsun?" className="flex-1 bg-transparent text-[14px] text-gray-200 placeholder:text-gray-500 focus:outline-none" />
                                <span className="text-[10px] text-gray-500 flex-shrink-0 whitespace-nowrap">{aiCredits !== null ? aiCredits : '...'} kredi</span>
                                <button onClick={handleAiGenerate} disabled={aiLoading || !aiPrompt.trim() || (aiCredits !== null && aiCredits < 2)} className="px-4 py-2 rounded-xl text-[12px] font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white flex-shrink-0 flex items-center gap-2">
                                    {aiLoading ? <><Loader2 size={14} className="animate-spin" /> Üretiyor...</> : <>Oluştur</>}
                                </button>
                                <button onClick={() => setShowSuggestions((v) => !v)} className="flex-shrink-0 px-3 py-2 rounded-xl text-[12px] font-medium border border-white/[0.1] text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all flex items-center gap-1.5">
                                    <Sparkles size={13} className="text-violet-400" /> Öneri
                                </button>
                            </div>`;

if (!content.includes(oldBar)) {
  console.error('OLD BAR NOT FOUND! Checking partial match...');
  const partial = 'Lüks altın ve siyah tema';
  console.log('Partial match:', content.includes(partial));
  process.exit(1);
}

content = content.replace(oldBar, newBar);

// 3. Wrap the inner div with relative positioning for popup
content = content.replace(
  '                        <div className="max-w-2xl mx-auto">',
  '                        <div className="max-w-2xl mx-auto relative">'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done! File updated successfully.');
