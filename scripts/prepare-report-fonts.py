"""Prepare locally bundled static report fonts from Google's OFL font repository."""
from pathlib import Path
from urllib.request import urlretrieve
from urllib.parse import quote
import sys
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / 'downloads' / 'pdf-runtime'))
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

root = Path(__file__).resolve().parent.parent
destination = root / 'public' / 'report-fonts'
destination.mkdir(parents=True, exist_ok=True)
fonts = [('cairo', 'Cairo[slnt,wght].ttf', 'Cairo', {'slnt': 0, 'wght': 400}), ('notosans', 'NotoSans[wdth,wght].ttf', 'NotoSans', {'wdth': 100, 'wght': 400}), ('notosanssc', 'NotoSansSC[wght].ttf', 'NotoSansSC', {'wght': 400}), ('notosansjp', 'NotoSansJP[wght].ttf', 'NotoSansJP', {'wght': 400}), ('notosanskr', 'NotoSansKR[wght].ttf', 'NotoSansKR', {'wght': 400})]
for folder, filename, name, axes in fonts:
    target = destination / f'{name}-Regular.ttf'
    if target.exists():
        continue
    source = root / 'downloads' / 'report-fonts' / filename
    source.parent.mkdir(parents=True, exist_ok=True)
    base = f'https://raw.githubusercontent.com/google/fonts/main/ofl/{folder}/'
    urlretrieve(base + quote(filename), source)
    font = instantiateVariableFont(TTFont(source), axes, inplace=True)
    font.save(target)
    urlretrieve(base + 'OFL.txt', destination / f'{name}-OFL.txt')
    print(f'{name}: static font prepared', flush=True)
