const fs = require('fs');
const f = 'app/panel/design/page.tsx';
let c = fs.readFileSync(f, 'utf8');

// 1. Fix menu icon — equal width lines (3 equal lines = proper hamburger)
const oldIcon = `                                    const menuIcon = (
                                        <div className="flex flex-col items-start gap-[2px]">
                                            <div className="w-[10px] h-[1.5px] rounded-full" style={{ backgroundColor: hIcon }} />
                                            <div className="w-[7px] h-[1.5px] rounded-full" style={{ backgroundColor: hIcon }} />
                                        </div>
                                    );`;
const newIcon = `                                    const menuIcon = (
                                        <div className="flex flex-col items-start gap-[2px]">
                                            <div className="w-[10px] h-[1.5px] rounded-full" style={{ backgroundColor: hIcon }} />
                                            <div className="w-[10px] h-[1.5px] rounded-full" style={{ backgroundColor: hIcon }} />
                                            <div className="w-[10px] h-[1.5px] rounded-full" style={{ backgroundColor: hIcon }} />
                                        </div>
                                    );`;

if (c.includes(oldIcon)) {
    c = c.replace(oldIcon, newIcon);
    console.log('✓ Menu icon equalized (3 equal lines)');
} else {
    console.error('✗ Menu icon target not found');
}

// 2. Fix all variant preview containers to same height — wrap renderPreview in fixed-height flex div
const oldPreviewCall = `                                        <div className="p-2">
                                            {renderPreview()}
                                        </div>`;
const newPreviewCall = `                                        <div className="p-2 h-[52px] flex items-center">
                                            <div className="w-full">{renderPreview()}</div>
                                        </div>`;

if (c.includes(oldPreviewCall)) {
    c = c.replace(oldPreviewCall, newPreviewCall);
    console.log('✓ Preview containers set to fixed h-[52px]');
} else {
    console.error('✗ Preview container target not found');
}

fs.writeFileSync(f, c, 'utf8');
console.log('Done!');
