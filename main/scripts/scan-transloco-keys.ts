/**
 * Transloco key scanner and diff reporter
 *
 * Purpose:
 * - Extract all translation keys used in templates/TS.
 * - Diff against locale JSON files to detect missing/extra/drift.
 *
 * Usage:
 *   ts-node scripts/i18n/scan-transloco-keys.ts --src=src --i18n=src/assets/i18n --out=reports/i18n-diff.json
 *   OR (compiled):
 *   node scripts/i18n/scan-transloco-keys.js --src=src --i18n=src/assets/i18n --out=reports/i18n-diff.json
 *
 * Notes:
 * - Heuristic regexes for:
 *   - Template pipe: {{ 'key.path' | transloco }}
 *   - Attribute pipe: [placeholder]="'key.path' | transloco"
 *   - TS: translocoService.translate('key.path'), selectTranslate('key.path'), selectTranslateObject('key.path')
 * - Extend as needed.
 */

import { readFileSync, readdirSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, extname, basename } from 'node:path';

type Args = {
    srcDir: string;
    i18nDir: string;
    outFile?: string;
};

function parseArgs(): Args {
    const argv = process.argv.slice(2);
    const get = (name: string, def?: string) => {
        const idx = argv.findIndex(a => a.startsWith(`--${name}=`));
        if (idx >= 0) return argv[idx].split('=')[1];
        const idx2 = argv.findIndex(a => a === `--${name}`);
        if (idx2 >= 0) return argv[idx2 + 1];
        return def;
    };

    const srcDir = get('src', 'src')!;
    const i18nDir = get('i18n', 'src/assets/i18n')!;
    const outFile = get('out', undefined);

    return { srcDir, i18nDir, outFile };
}

function walkFiles(dir: string, exts: string[], list: string[] = []): string[] {
    const entries = readdirSync(dir);
    for (const entry of entries) {
        const p = join(dir, entry);
        const st = statSync(p);
        if (st.isDirectory()) {
            walkFiles(p, exts, list);
        } else if (exts.includes(extname(p))) {
            list.push(p);
        }
    }
    return list;
}

const TEMPLATE_KEY_PATTERNS = [
    // {{ 'key.path' | transloco }}
    /\{\{\s*'([^']+?)'\s*\|\s*transloco(?:[^}]*)\}\}/g,
    /\{\{\s*"([^"]+?)"\s*\|\s*transloco(?:[^}]*)\}\}/g,
    // [placeholder]="'key.path' | transloco"
    /['"]([^'"]+?)['"]\s*\|\s*transloco/g,
];

const TS_KEY_PATTERNS = [
    // translocoService.translate('key')
    /translocoService\.(?:translate|selectTranslate|selectTranslateObject)\(\s*['"]([^'"]+?)['"]/g,
    // TranslocoService methods via injected var names (broader):
    /\.\s*(?:translate|selectTranslate|selectTranslateObject)\(\s*['"]([^'"]+?)['"]/g,
];

function extractKeysFromContent(content: string, patterns: RegExp[]): Set<string> {
    const keys = new Set<string>();
    for (const re of patterns) {
        let match: RegExpExecArray | null;
        // Reset lastIndex to ensure reuse across files
        re.lastIndex = 0;
        while ((match = re.exec(content)) !== null) {
            if (match[1]) keys.add(match[1]);
        }
    }
    return keys;
}

function extractKeys(srcDir: string): Set<string> {
    const files = walkFiles(srcDir, ['.html', '.ts']);
    const keys = new Set<string>();
    for (const file of files) {
        const content = readFileSync(file, 'utf8');
        const patterns = extname(file) === '.html' ? TEMPLATE_KEY_PATTERNS : TS_KEY_PATTERNS;
        const local = extractKeysFromContent(content, patterns);
        local.forEach(k => keys.add(k));
    }
    return keys;
}

function flattenLocale(obj: any, prefix = ''): Record<string, string | any> {
    const out: Record<string, string | any> = {};
    for (const [k, v] of Object.entries(obj)) {
        const p = prefix ? `${prefix}.${k}` : k;
        if (v && typeof v === 'object' && !Array.isArray(v)) {
            Object.assign(out, flattenLocale(v, p));
        } else {
            out[p] = v;
        }
    }
    return out;
}

function loadLocales(i18nDir: string): Record<string, Record<string, any>> {
    const files = walkFiles(i18nDir, ['.json']);
    const locales: Record<string, Record<string, any>> = {};
    for (const file of files) {
        const lang = basename(file, '.json');
        try {
            const json = JSON.parse(readFileSync(file, 'utf8'));
            locales[lang] = flattenLocale(json);
        } catch (e) {
            console.error(`Failed parsing ${file}:`, e);
        }
    }
    return locales;
}

function diffKeys(used: Set<string>, locales: Record<string, Record<string, any>>) {
    const usedArr = Array.from(used).sort();
    const report: any = { used: usedArr, locales: {} as any };

    for (const [lang, map] of Object.entries(locales)) {
        const keys = Object.keys(map).sort();
        const missing = usedArr.filter(k => !(k in map));
        const extra = keys.filter(k => !used.has(k));
        report.locales[lang] = {
            total: keys.length,
            missingCount: missing.length,
            extraCount: extra.length,
            missing,
            extra,
        };
    }

    return report;
}

(function main() {
    const args = parseArgs();
    console.log('[i18n] Scanning keys from:', args.srcDir);
    const usedKeys = extractKeys(args.srcDir);
    console.log('[i18n] Found used keys:', usedKeys.size);

    console.log('[i18n] Loading locales from:', args.i18nDir);
    const locales = loadLocales(args.i18nDir);

    const report = diffKeys(usedKeys, locales);

    if (args.outFile) {
        const outDir = join(args.outFile, '..');
        try { mkdirSync(outDir, { recursive: true }); } catch { }
        writeFileSync(args.outFile, JSON.stringify(report, null, 2), 'utf8');
        console.log('[i18n] Diff written to', args.outFile);
    } else {
        console.log(JSON.stringify(report, null, 2));
    }

    // Non-zero exit if any locale is missing keys.
    const hasMissing = Object.values(report.locales).some((l: any) => l.missingCount > 0);
    process.exit(hasMissing ? 1 : 0);
})();