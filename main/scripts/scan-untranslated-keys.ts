/* eslint-disable no-console */
/**
 * Heuristic scan for untranslated (hard-coded) text in templates.
 *
 * Purpose:
 * - Detect likely user-visible strings that are not wrapped in Transloco.
 * - Warn on common attributes (placeholder, title, aria-label) without transloco pipe.
 *
 * Usage:
 *   ts-node scripts/i18n/scan-untranslated-text.ts --src=src
 *   OR:
 *   node scripts/i18n/scan-untranslated-text.js --src=src
 *
 * Notes:
 * - Heuristic: look for text between tags that contains letters and is not within {{ ... }}.
 * - Looks at attributes that contain plain text values without transloco pipe.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

type Args = { srcDir: string };
function parseArgs(): Args {
    const argv = process.argv.slice(2);
    const get = (name: string, def?: string) => {
        const idx = argv.findIndex(a => a.startsWith(`--${name}=`));
        if (idx >= 0) return argv[idx].split('=')[1];
        const idx2 = argv.findIndex(a => a === `--${name}`);
        if (idx2 >= 0) return argv[idx2 + 1];
        return def;
    };
    return { srcDir: get('src', 'src')! };
}

function walkFiles(dir: string, list: string[] = []): string[] {
    const entries = readdirSync(dir);
    for (const entry of entries) {
        const p = join(dir, entry);
        const st = statSync(p);
        if (st.isDirectory()) walkFiles(p, list);
        else if (extname(p) === '.html') list.push(p);
    }
    return list;
}

function scanFile(file: string): { file: string; issues: string[] } {
    const src = readFileSync(file, 'utf8');
    const issues: string[] = [];

    // Text nodes between tags. Capture >text< that isn't whitespace and not using {{
    const textBetweenTags = />[^<]+</g;
    let m: RegExpExecArray | null;
    while ((m = textBetweenTags.exec(src)) !== null) {
        const text = m[0].slice(1, -1).trim();
        if (!text) continue;
        // Ignore template syntax and pure punctuation/numbers
        if (text.includes('{{') || /^[\d\s\W]+$/.test(text)) continue;
        issues.push(`Text node: "${text}" @ index ${m.index}`);
    }

    // Attributes that are plain strings without transloco
    // e.g., placeholder="Add title" instead of [placeholder]="'form.title' | transloco"
    const attrNames = ['placeholder', 'title', 'aria-label', 'alt', 'value'];
    for (const attr of attrNames) {
        const re = new RegExp(`${attr}\\s*=\\s*"(.*?)"`, 'g');
        let a: RegExpExecArray | null;
        while ((a = re.exec(src)) !== null) {
            const val = a[1].trim();
            if (!val) continue;
            if (val.includes('{{') || val.includes('| transloco')) continue;
            // Ignore urls and images in alt if it looks like a filename/url
            if (/https?:\/\//.test(val) || /\.(png|jpg|jpeg|gif|svg)$/.test(val)) continue;
            // Likely untranslated attribute
            issues.push(`Attribute ${attr}="${val}" @ index ${a.index}`);
        }
    }

    return { file, issues };
}

(function main() {
    const { srcDir } = parseArgs();
    const files = walkFiles(srcDir);
    let total = 0;
    const all: Array<{ file: string; issues: string[] }> = [];

    for (const f of files) {
        const res = scanFile(f);
        if (res.issues.length) {
            total += res.issues.length;
            all.push(res);
        }
    }

    if (total > 0) {
        console.log('[i18n] Potential untranslated strings found:', total);
        for (const r of all) {
            console.log(`\nFile: ${r.file}`);
            for (const i of r.issues) console.log(' -', i);
        }
        process.exit(1);
    } else {
        console.log('[i18n] No untranslated strings detected (heuristic).');
    }
})();