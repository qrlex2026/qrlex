const fs = require('fs');
const filePath = 'app/panel/design/page.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// ── 1. Add activeSection state after other useState declarations ──
// Find the last useState line and add after it
content = content.replace(
    "const [headerLogoUploading, setHeaderLogoUploading] = useState(false);",
    "const [headerLogoUploading, setHeaderLogoUploading] = useState(false);\r\n    const [activeSection, setActiveSection] = useState('header');"
);
console.log('1. Added activeSection state');

// ── 2. Replace the outer layout structure ──
// OLD: flex justify-center with hidden left panel
const oldLayout = `            <div className="flex gap-6 flex-1 min-h-0 bg-[#050505] px-4 lg:px-6 py-4 justify-center">\r\n                {/* LEFT: Scrollable sections - HIDDEN */}\r\n                <div className="hidden">`;

const sidebarButtons = `            <div className="flex flex-1 min-h-0 bg-[#050505]">
                {/* LEFT SIDEBAR: Section selector */}
                <div className="w-[220px] border-r border-white/[0.06] overflow-y-auto py-4 px-3 flex-shrink-0 bg-[#080808]">
                    <p className="text-[11px] text-gray-600 uppercase px-2 mb-3">Bileşenler</p>
                    {[
                        { key: 'header', label: 'Başlık Düzenleri', icon: 'LayoutGrid' },
                        { key: 'themes', label: 'Temalar & Renkler', icon: 'Palette' },
                        { key: 'welcome', label: 'Hoşgeldiniz Ekranı', icon: 'ImageIcon' },
                        { key: 'position', label: 'Pozisyon & Düzen', icon: 'LayoutGrid' },
                        { key: 'general', label: 'Genel Ayarlar', icon: 'Settings' },
                        { key: 'font', label: 'Yazı Tipi', icon: 'Type' },
                        { key: 'bottomnav', label: 'Alt Navigasyon', icon: 'Monitor' },
                        { key: 'detail', label: 'Ürün Detay', icon: 'Eye' },
                        { key: 'search', label: 'Arama Sayfası', icon: 'Search' },
                        { key: 'drawer', label: 'Sol Menü', icon: 'Menu' },
                    ].map((section) => (
                        <button
                            key={section.key}
                            onClick={() => setActiveSection(section.key)}
                            className={\`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left text-[13px] transition-all mb-1 \${
                                activeSection === section.key
                                    ? 'bg-white/[0.08] text-white font-medium'
                                    : 'text-gray-500 hover:bg-white/[0.04] hover:text-gray-300'
                            }\`}
                        >
                            <span className="text-[15px] opacity-60">
                                {section.key === 'header' && <LayoutGrid size={16} />}
                                {section.key === 'themes' && <Palette size={16} />}
                                {section.key === 'welcome' && <ImageIcon size={16} />}
                                {section.key === 'position' && <LayoutGrid size={16} />}
                                {section.key === 'general' && <Settings size={16} />}
                                {section.key === 'font' && <Type size={16} />}
                                {section.key === 'bottomnav' && <Monitor size={16} />}
                                {section.key === 'detail' && <Eye size={16} />}
                                {section.key === 'search' && <Search size={16} />}
                                {section.key === 'drawer' && <Menu size={16} />}
                            </span>
                            {section.label}
                        </button>
                    ))}
                </div>

                {/* CENTER: Phone preview */}
                <div className="flex-1 flex justify-center items-start py-4 min-w-0">
                    {slug && (
                        <div className="flex flex-col items-center">
                            <div className="w-[380px] bg-black overflow-hidden relative rounded-[28px] border-[5px] border-black" style={{ height: 'calc(100dvh - 120px)' }}>
                                <iframe
                                    ref={iframeRef}
                                    src={\`/\${slug}\`}
                                    className="w-full h-full border-0"
                                    style={{ background: '#000', clipPath: 'inset(0 round 23px)' }}
                                    onLoad={() => {
                                        setTimeout(() => {
                                            if (iframeRef.current?.contentWindow) {
                                                iframeRef.current.contentWindow.postMessage({ type: 'theme-update', theme }, '*');
                                            }
                                        }, 500);
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT SIDEBAR: Properties */}
                <div className="w-[380px] border-l border-white/[0.06] overflow-y-auto py-4 px-4 flex-shrink-0 bg-[#080808]">
                    {/* Auto-save toast */}
                    {(saving || saved) && (
                        <div className="fixed bottom-[50px] left-[80px] z-50">
                            {saving && <div className="flex items-center gap-2 text-sm text-white bg-gray-800 border border-gray-700 px-4 py-2.5 rounded-xl shadow-2xl"><Loader2 size={14} className="animate-spin" /> Kaydediliyor...</div>}
                            {saved && <div className="flex items-center gap-2 text-sm text-emerald-400 bg-gray-800 border border-emerald-500/30 px-4 py-2.5 rounded-xl shadow-2xl"><Check size={14} /> Kaydedildi</div>}
                        </div>
                    )}`;

if (!content.includes(oldLayout.split('\r\n')[0])) {
    // Try LF
    const oldLayoutLF = oldLayout.replace(/\r\n/g, '\n');
    content = content.replace(oldLayoutLF, sidebarButtons);
} else {
    content = content.replace(oldLayout, sidebarButtons);
}
console.log('2. Replaced outer layout with 3-panel structure');

// ── 3. Add conditional wrappers around section groups ──
// The sections in the right panel need activeSection conditionals

// HEADER section: Başlık Düzenleri card (starts ~line with bg-[#0c0c0c] before Başlık Düzenleri)
content = content.replace(
    '                    {/* Başlık Düzenleri Card',
    '                    {activeSection === \'header\' && (<>\r\n                    {/* Başlık Düzenleri Card'
);

// THEMES section: Temalar & Renkler Card
content = content.replace(
    '                    {/* Temalar & Renkler Card',
    '                    </>)}\r\n                    {activeSection === \'themes\' && (<>\r\n                    {/* Temalar & Renkler Card'
);

// Close themes before welcome. Find "Hoşgeldiniz Ekranı" Section
content = content.replace(
    '                        <Section title="Hoşgeldiniz Ekranı"',
    '                    </>)}\r\n                    {activeSection === \'welcome\' && (<>\r\n                        <Section title="Hoşgeldiniz Ekranı"'
);

// Close welcome before position. Find "Pozisyon" Section
content = content.replace(
    '                        <Section title="Pozisyon (Ürün Düzeni)"',
    '                    </>)}\r\n                    {activeSection === \'position\' && (<>\r\n                        <Section title="Pozisyon (Ürün Düzeni)"'
);

// Close position before general. Find "Genel Ayarlar" Section
content = content.replace(
    '                        <Section title="Genel Ayarlar"',
    '                    </>)}\r\n                    {activeSection === \'general\' && (<>\r\n                        <Section title="Genel Ayarlar"'
);

// Close general before font. Find "Yazı Tipi" Section
content = content.replace(
    '                        <Section title="Yazı Tipi"',
    '                    </>)}\r\n                    {activeSection === \'font\' && (<>\r\n                        <Section title="Yazı Tipi"'
);

// Close font before bottomnav. Find "Alt Navigasyon" Section
content = content.replace(
    '                        <Section title="Alt Navigasyon"',
    '                    </>)}\r\n                    {activeSection === \'bottomnav\' && (<>\r\n                        <Section title="Alt Navigasyon"'
);

// Close bottomnav before detail. Find "Ürün Detay" Section
content = content.replace(
    '                        <Section title="Ürün Detay Sayfası"',
    '                    </>)}\r\n                    {activeSection === \'detail\' && (<>\r\n                        <Section title="Ürün Detay Sayfası"'
);

// Close detail before search. Find "Arama Sayfası" Section
content = content.replace(
    '                        <Section title="Arama Sayfası"',
    '                    </>)}\r\n                    {activeSection === \'search\' && (<>\r\n                        <Section title="Arama Sayfası"'
);

// Close search before drawer. Find "Sol Menü" Section
content = content.replace(
    '                        <Section title="Sol Menü (Drawer)"',
    '                    </>)}\r\n                    {activeSection === \'drawer\' && (<>\r\n                        <Section title="Sol Menü (Drawer)"'
);

console.log('3. Added conditional wrappers');

// ── 4. Close the last section and fix the closing structure ──
// Find the old closing: </div> (close hidden) then phone frame then </div></div>
// We need to: close drawer section, close right sidebar, close main flex

// The old phone frame block needs to be removed (we already added it in center)
const oldPhoneBlock = `                {/* RIGHT: Phone frame - aligned with scrollable area */}
                {
                    slug && (
                        <div className="flex flex-col items-center w-[400px] flex-shrink-0">
                            <div className="w-[380px] bg-black overflow-hidden relative rounded-[28px] border-[5px] border-black" style={{ height: 'calc(100dvh - 120px)' }}>
                                <iframe
                                    ref={iframeRef}
                                    src={\`/\${slug}\`}
                                    className="w-full h-full border-0"
                                    style={{ background: '#000', clipPath: 'inset(0 round 23px)' }}
                                    onLoad={() => {
                                        setTimeout(() => {
                                            if (iframeRef.current?.contentWindow) {
                                                iframeRef.current.contentWindow.postMessage({ type: 'theme-update', theme }, '*');
                                            }
                                        }, 500);
                                    }}
                                />
                            </div>
                        </div>
                    )
                }`;

// Replace the old closing div + phone frame + closing divs
// Find the </div> that closes the old hidden panel, then the phone frame, then the closing divs
// Old end structure:
//   </div>  ← closes hidden
//   {phone frame}
//   </div > ← closes content row
//   </div > ← closes outer

// New end structure:
//   </>)}  ← closes last activeSection
//   </div> ← closes right sidebar
//   </div > ← closes content row
//   </div > ← closes outer

// Let's find and replace the closing section
const lines = content.split('\n');
let closingStart = -1;
let closingEnd = -1;

// Find the last </Section> in the file (this is the Sol Menü Section close)
let lastSectionClose = -1;
for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].trim() === '</Section>') {
        lastSectionClose = i;
        break;
    }
}

if (lastSectionClose === -1) {
    console.error('Could not find last </Section>!');
    process.exit(1);
}

// From lastSectionClose, find the closing structure
// It should be: </Section> then some blank lines then </div> (old hidden close) then phone frame then </div> </div>
// We need to replace everything from after </Section> to the end of the component

let endContent = '';
for (let i = lastSectionClose + 1; i < lines.length; i++) {
    endContent += lines[i] + '\n';
}

// Build the new end
const newEnd = `
                    </>)}
                </div>
            </div >
        </div >
    );
}


`;

// Replace everything after lastSectionClose
const newLines = lines.slice(0, lastSectionClose + 1);
content = newLines.join('\n') + '\n' + newEnd;

console.log('4. Fixed closing structure');

// ── 5. Add Settings import if not present ──
if (!content.includes("Settings,") && !content.includes("Settings }")) {
    content = content.replace(
        "import { ",
        "import { Settings, "
    );
    // Actually let's check if it's already importing Settings
    if (!content.includes("'lucide-react'")) {
        console.log('WARNING: Could not find lucide-react import');
    }
}

// Check if Settings is in the import
if (!content.includes('Settings')) {
    // Add to first lucide import
    content = content.replace(
        'LayoutGrid,',
        'LayoutGrid, Settings,'
    );
    console.log('5. Added Settings import');
} else {
    console.log('5. Settings already imported');
}

// ── 6. Group position sections properly ──
// The 'position' group should include: Pozisyon, Başlık/Slider, Kategori Butonları, Arama Çubuğu
// Currently they'll all show when activeSection === 'position' since they're between
// the position open and general open. That's correct!

// The 'general' group should include: Genel Ayarlar, Ürün Kartları, Fiyat Stilleri, Popüler Etiketi
// These are between general open and font open. Correct!

// The 'font' group should include: Yazı Tipi, Yazı Stilleri
// These are between font open and bottomnav open. Correct!

fs.writeFileSync(filePath, content);

// Verify
const finalLines = content.split('\n');
console.log(`\nDone! Final file: ${finalLines.length} lines`);

// Quick validation
const hasActiveSection = content.includes('activeSection');
const hasSidebar = content.includes('LEFT SIDEBAR');
const hasCenter = content.includes('CENTER: Phone preview');
const hasRightSidebar = content.includes('RIGHT SIDEBAR');
console.log(`activeSection: ${hasActiveSection}, sidebar: ${hasSidebar}, center: ${hasCenter}, right: ${hasRightSidebar}`);
