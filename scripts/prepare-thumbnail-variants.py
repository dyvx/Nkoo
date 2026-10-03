"""Original art, reframed as distinct editorial thumbnails for each fictional episode."""
import re
from pathlib import Path
from PIL import Image,ImageEnhance
root=Path(__file__).resolve().parent.parent
text=(root/'src/data/mockVideos.ts').read_text()
entries=re.findall(r"video\(\s*'(v\d+)',\s*'(?:[^'\\]|\\.)*',\s*'[^']+',\s*'[^']+',\s*'([^']+)'",text,re.S)
for id,key in entries:
    n=int(id[1:])
    if n<=10:continue
    im=Image.open(root/f'public/images/{key}.jpg').convert('RGB')
    w,h=im.size
    scale=[.72,.8,.88,.67,.76][n%5]
    cw,ch=int(w*scale),int(h*scale)
    px=[.0,.5,1.0,.35,.7][n%5]
    py=[.15,.5,.75,.0,.4][n%5]
    x,y=int((w-cw)*px),int((h-ch)*py)
    im=im.crop((x,y,x+cw,y+ch))
    im=ImageEnhance.Color(im).enhance([.91,1.04,.94,1.01,1][n%5])
    for width,suffix in [(640,'thumb'),(1280,'poster')]:
        copy=im.copy();copy.thumbnail((width,int(width*9/16)))
        copy.save(root/f'public/images/{key}-{id}-{suffix}.webp',quality=85,method=6)
print(f'{len([id for id,_ in entries if int(id[1:])>10])} sets of episode artwork created')
