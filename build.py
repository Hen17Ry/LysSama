#!/usr/bin/env python3
"""Assemble src/ en une seule page : public/index.html (aucune dépendance)."""
import glob, os
root = os.path.dirname(os.path.abspath(__file__))
read = lambda p: open(os.path.join(root, p), encoding='utf-8').read()
js = '\n'.join(read(os.path.relpath(f, root)) for f in sorted(glob.glob(os.path.join(root, 'src/js/*.js'))))
out = read('src/index.tpl.html').replace('/*__CSS__*/', read('src/style.css')).replace('/*__JS__*/', js)
os.makedirs(os.path.join(root, 'public'), exist_ok=True)
open(os.path.join(root, 'public/index.html'), 'w', encoding='utf-8').write(out)
print('public/index.html', len(out) // 1024, 'Ko')
