"""Build static locale assets offline. No keys or customer data are accessed."""
import json
import os
import re
import sys
import urllib.request
import zipfile
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root / 'downloads' / 'i18n-runtime'))
import ctranslate2
import sentencepiece

source = json.loads((root / 'downloads/i18n/source.json').read_text(encoding='utf-8'))
index = json.loads(urllib.request.urlopen('https://raw.githubusercontent.com/argosopentech/argospm-index/main/index.json', timeout=30).read())
targets = ['it', 'pt', 'pl', 'uk', 'ru', 'zh', 'ja', 'ko']

def translate_language(code):
    destination = root / f'lib/i18n/locales-extra/{code}.json'
    existing = json.loads(destination.read_text(encoding='utf-8')) if destination.exists() else {}
    pending = [text for text in source if text not in existing or ('|' in text and existing[text].count('|') != text.count('|'))]
    if not pending:
        print(f'{code}: existing asset retained', flush=True)
        return
    package = next(item for item in reversed(index) if item['from_code'] == 'en' and item['to_code'] == code)
    archive = root / f'downloads/i18n/{code}.argosmodel'
    if not archive.exists():
        print(f'{code}: downloading official model', flush=True)
        filename = next(link for link in package['links'] if link.startswith('https://')).rsplit('/', 1)[-1]
        urllib.request.urlretrieve('https://data.argosopentech.com/argospm/v1/' + filename, archive)
    model_dir = root / f'downloads/i18n/{code}'
    with zipfile.ZipFile(archive) as bundle:
        # Official archives only; reject paths escaping this model directory.
        for info in bundle.infolist():
            target = (model_dir / info.filename).resolve()
            if not target.is_relative_to(model_dir.resolve()):
                raise ValueError('Unsafe archive path')
        bundle.extractall(model_dir)
    tokenizer_path = next(model_dir.rglob('sentencepiece.model'), None)
    if tokenizer_path:
        tokenizer = sentencepiece.SentencePieceProcessor(model_file=str(tokenizer_path))
        encode = lambda text: tokenizer.encode(text, out_type=str)
        decode = lambda tokens: tokenizer.decode(tokens).replace('▁', ' ').strip()
    else:
        from sacremoses import MosesTokenizer, MosesDetokenizer, MosesPunctNormalizer
        from subword_nmt.apply_bpe import BPE
        tokenizer_path = next(model_dir.rglob('bpe.model'))
        bpe = BPE(tokenizer_path.open(encoding='utf-8'))
        normalizer, tokenizer, detokenizer = MosesPunctNormalizer('en'), MosesTokenizer('en'), MosesDetokenizer(code)
        encode = lambda text: bpe.process_line(' '.join(tokenizer.tokenize(normalizer.normalize(text)))).split()
        decode = lambda tokens: detokenizer.detokenize(' '.join(tokens).replace('@@ ', '').split())
    translator = ctranslate2.Translator(str(tokenizer_path.parent / 'model'), device='cpu', compute_type='int8', inter_threads=1, intra_threads=2)
    # Translate around placeholders, preserving interpolation identifiers exactly.
    split = lambda text: re.split(r'(\{[^{}]+\}|\|)', text)
    protected = lambda part: part == '|' or (part.startswith('{') and part.endswith('}'))
    pieces = sorted({part for text in pending for part in split(text) if part and not protected(part)})
    lookup = {}
    print(f'{code}: translating {len(pieces)} segments', flush=True)
    for start in range(0, len(pieces), 32):
        batch = pieces[start:start+32]
        tokens = [encode(text) for text in batch]
        results = translator.translate_batch(tokens, beam_size=3, max_decoding_length=512)
        for original, result in zip(batch, results):
            result_text = decode(result.hypotheses[0])
            lookup[original] = (' ' if original[:1].isspace() else '') + result_text + (' ' if original[-1:].isspace() else '')
    translated = {**existing, **{text: ''.join(part if protected(part) else lookup[part] for part in split(text) if part) for text in pending}}
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(translated, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'{code}: completed {len(translated)} phrases', flush=True)

with ThreadPoolExecutor(max_workers=2) as pool:
    list(pool.map(translate_language, targets))
