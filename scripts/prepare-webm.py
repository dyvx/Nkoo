"""WebM fallback for browsers without bundled H.264 support."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import subprocess,imageio_ffmpeg
root=Path(__file__).resolve().parent.parent
ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
def convert(path):
    subprocess.run([ffmpeg,'-hide_banner','-loglevel','error','-y','-i',str(path),'-c:v','libvpx-vp9','-b:v','0','-crf','36','-cpu-used','6','-row-mt','1','-threads','2','-an',str(path.with_suffix('.webm'))],check=True)
    print(path.stem,flush=True)
with ThreadPoolExecutor(max_workers=3) as pool:list(pool.map(convert,(root/'public/media').glob('*.mp4')))
