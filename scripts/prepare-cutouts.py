"""Offline alpha-only product cutouts. Originals are never overwritten.
Install optional requirements-cutouts.txt in a venv; keep model verification enabled.
"""
import os, json, hashlib, pathlib, time, warnings, subprocess, gc
from concurrent.futures import ProcessPoolExecutor, as_completed
os.environ.setdefault('OMP_NUM_THREADS','2')
os.environ.setdefault('U2NET_HOME','/tmp/hafssa-models')
os.environ.setdefault('REQUESTS_CA_BUNDLE',os.environ.get('SSL_CERT_FILE','/etc/ssl/certs/ca-certificates.crt'))
ROOT=pathlib.Path(__file__).resolve().parent.parent
SESSIONS={}
def correction_hash(item):
 mask=ROOT/'scripts/cutout-masks'/f"{item['id']}.png"
 return hashlib.sha256(mask.read_bytes()+mask.with_suffix('.json').read_bytes()).hexdigest() if mask.exists() else None

def process(item):
 from PIL import Image,ImageOps
 import numpy as np
 from rembg import new_session,remove
 source=ROOT/item['image'].removeprefix('./');raw=source.read_bytes();digest=hashlib.sha256(raw).hexdigest()
 original=ImageOps.exif_transpose(Image.open(source)).convert('RGB')
 model='birefnet-general' if original.width>=900 else 'birefnet-general-lite'
 reviewed=ROOT/'scripts/cutout-masks'/f"{item['id']}.png"
 if reviewed.exists():
  metadata=json.loads(reviewed.with_suffix('.json').read_text())
  if metadata['sourceSha256']!=digest:raise RuntimeError('Reviewed mask source changed: '+item['id'])
  mask=Image.open(reviewed).convert('L')
  model='reviewed-alpha-mask'
 else:
  if model not in SESSIONS:
   SESSIONS.clear();gc.collect()
   SESSIONS[model]=new_session(model,providers=['CPUExecutionProvider'])
  with warnings.catch_warnings():
   warnings.simplefilter('ignore',RuntimeWarning)
   mask=remove(original,session=SESSIONS[model],only_mask=True)
 result=original.convert('RGBA');result.putalpha(mask)
 # The model supplies opacity only; all RGB values come directly from the source.
 if not np.array_equal(np.asarray(result)[:,:,:3],np.asarray(original)):raise RuntimeError('Unexpected RGB change: '+item['id'])
 alpha=result.getchannel('A');bounds=alpha.point(lambda v:255 if v>=8 else 0).getbbox()
 if not bounds:raise RuntimeError('Empty silhouette: '+item['id'])
 x0,y0,x1,y1=bounds;box=[max(0,x0-8),max(0,y0-8),min(result.width,x1+8),min(result.height,y1+8)]
 result=result.crop(box)
 output=ROOT/'assets/cutouts'/f"{item['id']}.webp"
 result.save(output,'WEBP',lossless=True,quality=100,method=4,exact=True)
 decoded=Image.open(output).convert('RGBA')
 if not np.array_equal(np.asarray(decoded),np.asarray(result)):raise RuntimeError('Lossy output: '+item['id'])
 coverage=float((np.asarray(result)[:,:,3]>127).mean())
 return item['image'],{'image':'./assets/cutouts/'+output.name,'productId':item['id'],'sourceSha256':digest,'sha256':hashlib.sha256(output.read_bytes()).hexdigest(),'model':model,'sourceSize':list(original.size),'crop':box,'size':list(result.size),'opaqueCoverage':round(coverage,4),'alphaOnly':True,'correctionSha256':correction_hash(item)}
if __name__=='__main__':
 items=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {products} from './catalogue.js';process.stdout.write(JSON.stringify(products.map(p=>({id:p.id,name:p.name,image:p.image}))));"],cwd=ROOT,text=True))
 previous=ROOT/'assets/cutouts/manifest.json'
 manifest=json.loads(previous.read_text()) if previous.exists() else {}
 manifest={p['image']:manifest[p['image']] for p in items if p['image'] in manifest and (ROOT/manifest[p['image']]['image'].removeprefix('./')).exists() and manifest[p['image']].get('correctionSha256')==correction_hash(p) and manifest[p['image']]['sourceSha256']==hashlib.sha256((ROOT/p['image'].removeprefix('./')).read_bytes()).hexdigest()}
 pending=[p for p in items if p['image'] not in manifest]
 start=time.time();print(f'Resuming {len(manifest)} verified cutouts; {len(pending)} remaining',flush=True)
 with ProcessPoolExecutor(max_workers=2) as pool:
  futures={pool.submit(process,p):p for p in pending}
  for f in as_completed(futures):
   try: path,data=f.result();manifest[path]=data
   except Exception:
    for pending in futures: pending.cancel()
    raise
   print(f"{len(manifest)}/{len(items)} {data['productId']} {round(time.time()-start)}s",flush=True)
   temporary=ROOT/'assets/cutouts/manifest.tmp'
   temporary.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n');temporary.replace(ROOT/'assets/cutouts/manifest.json')
 (ROOT/'cutouts.js').write_text('// Alpha-only cutouts; source photographs are retained.\nexport const cutouts = '+json.dumps(manifest,ensure_ascii=False,indent=2)+';\n')
 print('Completed all cutouts; source RGB and lossless output verified.',flush=True)
