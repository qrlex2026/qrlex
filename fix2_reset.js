const fs = require('fs');
const f = 'app/panel/design/page.tsx';
let c = fs.readFileSync(f, 'utf8');

// 1. Add resetting state after miniLoading state
const stateTarget = "    const [showSuggestions, setShowSuggestions] = useState(false);";
const stateAdd = `    const [showSuggestions, setShowSuggestions] = useState(false);
    const [resetting, setResetting] = useState(false);`;
if (c.includes(stateTarget)) {
    c = c.replace(stateTarget, stateAdd);
    console.log('✓ Added resetting state');
} else {
    console.error('✗ resetting state target not found');
}

// 2. Add handleReset function after handleAiGenerate
const handleTarget = "    }, [aiPrompt, aiLoading, restaurantId, theme, doSave]);";
const handleAdd = `    }, [aiPrompt, aiLoading, restaurantId, theme, doSave]);

    const handleReset = async () => {
        if (resetting || !restaurantId) return;
        if (!confirm('Temayı varsayılan değerlere sıfırlamak istediğinizden emin misiniz?')) return;
        setResetting(true);
        try {
            const res = await fetch('/api/admin/reset-theme', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ restaurantId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Hata');
            const resetTheme = { ...DEFAULT_THEME, ...data.theme };
            setTheme(resetTheme);
            setSavedTheme(resetTheme);
        } catch (e: any) {
            alert('Sıfırlama hatası: ' + (e.message || 'Bilinmeyen hata'));
        } finally {
            setResetting(false);
        }
    };`;
if (c.includes(handleTarget)) {
    c = c.replace(handleTarget, handleAdd);
    console.log('✓ Added handleReset function');
} else {
    console.error('✗ handleReset target not found');
}

// 3. Add reset button in UI — after the Telefon/Tablet toggle row
const uiTarget = `                    </div>
                </div>
                    {/* Preview frame */}`;
const uiAdd = `                    </div>
                    {/* Reset button */}
                    <button onClick={handleReset} disabled={resetting} title="Temayı varsayılana sıfırla" className="ml-2 flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/10 border border-white/[0.06] transition-all disabled:opacity-40">
                        {resetting ? '...' : '↺ Sıfırla'}
                    </button>
                </div>
                    {/* Preview frame */}`;
if (c.includes(uiTarget)) {
    c = c.replace(uiTarget, uiAdd);
    console.log('✓ Added reset button UI');
} else {
    console.log('? UI target not found, trying alternative...');
    // Try alternative: look for Tablet button close and add after
    const altTarget = `                        </button>
                        </div>
                </div>`;
    if (c.includes(altTarget)) {
        const altAdd = `                        </button>
                        </div>
                    <button onClick={handleReset} disabled={resetting} title="Temayı varsayılana sıfırla" className="ml-auto flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/10 border border-white/[0.06] transition-all disabled:opacity-40">
                        {resetting ? '...' : '↺ Sıfırla'}
                    </button>
                </div>`;
        c = c.replace(altTarget, altAdd);
        console.log('✓ Added reset button via alt target');
    } else {
        console.error('✗ reset button UI alt target not found either');
    }
}

fs.writeFileSync(f, c, 'utf8');
console.log('Done!');
