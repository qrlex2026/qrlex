$enc = [System.Text.Encoding]::UTF8
$f = 'c:\Users\gebze\Desktop\qrlex\app\panel\design\page.tsx'
$lines = [IO.File]::ReadAllLines($f, $enc)
Write-Host "Before: $($lines.Length)"

# Insert AI prompt bar after line 802 (0-indexed: 801)
# Line 802 is: "                    </div>" (preview wrapper close)
# Line 803 is: "                </div>" (center panel close) -- this needs to stay at end

$aiBar = @(
'',
'                    {/* AI Prompt Bar */}',
'                    <div className="w-full px-6 pb-4 pt-2 flex-shrink-0">',
'                        {aiError && (<div className="max-w-2xl mx-auto mb-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl"><p className="text-[12px] text-red-400">{aiError}</p></div>)}',
'                        {aiSuccess && (<div className="max-w-2xl mx-auto mb-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2"><Check size={14} className="text-emerald-400" /><p className="text-[12px] text-emerald-400">Tema oluşturuldu!</p></div>)}',
'                        <div className="max-w-2xl mx-auto">',
'                            <div className="flex items-center gap-3 bg-[#1a1a1a] border border-white/[0.08] rounded-2xl px-4 py-3 focus-within:border-violet-500/40 transition-all shadow-lg shadow-black/20">',
'                                <Sparkles size={18} className="text-violet-400 flex-shrink-0" />',
'                                <input',
'                                    type="text"',
'                                    value={aiPrompt}',
'                                    onChange={(e) => setAiPrompt(e.target.value)}',
'                                    onKeyDown={(e) => { if (e.key === '"'"'Enter'"'"' && !e.shiftKey) { e.preventDefault(); handleAiGenerate(); } }}',
'                                    placeholder="Nasıl bir tasarım istiyorsun? Örn: İzmir Ege cafesi, deniz mavisi..."',
'                                    className="flex-1 bg-transparent text-[14px] text-gray-200 placeholder:text-gray-500 focus:outline-none"',
'                                />',
'                                <span className="text-[10px] text-gray-500 flex-shrink-0 whitespace-nowrap">{aiCredits !== null ? aiCredits : '"'"'...'"'"'} kredi</span>',
'                                <button',
'                                    onClick={handleAiGenerate}',
'                                    disabled={aiLoading || !aiPrompt.trim() || (aiCredits !== null && aiCredits < 2)}',
'                                    className="px-4 py-2 rounded-xl text-[12px] font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white flex-shrink-0 flex items-center gap-2"',
'                                >',
'                                    {aiLoading ? <><Loader2 size={14} className="animate-spin" /> Üretiyor...</> : <>Oluştur</>}',
'                                </button>',
'                            </div>',
'                            <div className="flex flex-wrap gap-1.5 mt-2 justify-center">',
'                                {['"'"'Lüks altın ve siyah tema'"'"', '"'"'Ege sahil cafesi'"'"', '"'"'Minimalist beyaz'"'"', '"'"'Modern koyu tema'"'"'].map((chip) => (',
'                                    <button key={chip} onClick={() => setAiPrompt(chip)} className="px-3 py-1 rounded-full text-[11px] bg-white/[0.04] border border-white/[0.06] text-gray-500 hover:text-gray-300 hover:bg-white/[0.08] transition-all">{chip}</button>',
'                                ))}',
'                            </div>',
'                        </div>',
'                    </div>'
)

$insertAfter = 801  # 0-indexed (= line 802 1-indexed)
$result = [System.Collections.Generic.List[string]]::new()
for ($i = 0; $i -lt $lines.Length; $i++) {
    $result.Add($lines[$i])
    if ($i -eq $insertAfter) {
        foreach ($al in $aiBar) { $result.Add($al) }
    }
}

Write-Host "After: $($result.Count)"
[IO.File]::WriteAllLines($f, $result.ToArray(), $enc)
Write-Host "Done!"
