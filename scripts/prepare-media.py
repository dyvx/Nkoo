"""Create optimized thumbnails and safe, silent demo films from original generated art."""
from pathlib import Path
from PIL import Image
from concurrent.futures import ThreadPoolExecutor
import subprocess
import imageio_ffmpeg
root = Path(__file__).resolve().parent.parent
images = root / 'public/images'
media = root / 'public/media'
media.mkdir(exist_ok=True)
ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
def prepare(path):
    im = Image.open(path).convert('RGB')
    for width, suffix in [(640,'thumb'),(1280,'poster')]:
        copy=im.copy();copy.thumbnail((width, int(width*9/16)))
        copy.save(images / f'{path.stem}-{suffix}.webp', quality=85, method=6)
    cmd = [ffmpeg,'-hide_banner','-loglevel','error','-y','-loop','1','-i',str(images / f'{path.stem}-poster.webp'),'-vf',"scale=1280:720,zoompan=z='min(zoom+0.0003,1.15)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1280x720:fps=24",'-t','20','-c:v','libx264','-preset','fast','-crf','25','-pix_fmt','yuv420p','-an','-movflags','+faststart',str(media / f'{path.stem}.mp4')]
    subprocess.run(cmd,check=True)
    print(path.stem, flush=True)
with ThreadPoolExecutor(max_workers=3) as pool:
    list(pool.map(prepare, images.glob('*.jpg')))
