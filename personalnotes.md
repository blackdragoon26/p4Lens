```
p4Lens git:(main) ✗ cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

Collecting fastapi==0.115.0 (from -r requirements.txt (line 1))
  Downloading fastapi-0.115.0-py3-none-any.whl.metadata (27 kB)
Collecting uvicorn==0.32.0 (from uvicorn[standard]==0.32.0->-r requirements.txt (line 2))
  Downloading uvicorn-0.32.0-py3-none-any.whl.metadata (6.6 kB)
Collecting python-multipart==0.0.12 (from -r requirements.txt (line 3))
  Downloading python_multipart-0.0.12-py3-none-any.whl.metadata (1.9 kB)
Collecting openpyxl==3.1.2 (from -r requirements.txt (line 4))
  Downloading openpyxl-3.1.2-py2.py3-none-any.whl.metadata (2.5 kB)
Collecting starlette<0.39.0,>=0.37.2 (from fastapi==0.115.0->-r requirements.txt (line 1))
  Downloading starlette-0.38.6-py3-none-any.whl.metadata (6.0 kB)
Collecting pydantic!=1.8,!=1.8.1,!=2.0.0,!=2.0.1,!=2.1.0,<3.0.0,>=1.7.4 (from fastapi==0.115.0->-r requirements.txt (line 1))
  Downloading pydantic-2.12.4-py3-none-any.whl.metadata (89 kB)
Collecting typing-extensions>=4.8.0 (from fastapi==0.115.0->-r requirements.txt (line 1))
  Downloading typing_extensions-4.15.0-py3-none-any.whl.metadata (3.3 kB)
Collecting click>=7.0 (from uvicorn==0.32.0->uvicorn[standard]==0.32.0->-r requirements.txt (line 2))
  Downloading click-8.3.1-py3-none-any.whl.metadata (2.6 kB)
Collecting h11>=0.8 (from uvicorn==0.32.0->uvicorn[standard]==0.32.0->-r requirements.txt (line 2))
  Downloading h11-0.16.0-py3-none-any.whl.metadata (8.3 kB)
Collecting et-xmlfile (from openpyxl==3.1.2->-r requirements.txt (line 4))
  Downloading et_xmlfile-2.0.0-py3-none-any.whl.metadata (2.7 kB)
Collecting httptools>=0.5.0 (from uvicorn[standard]==0.32.0->-r requirements.txt (line 2))
  Downloading httptools-0.7.1-cp314-cp314-macosx_11_0_arm64.whl.metadata (3.5 kB)
Collecting python-dotenv>=0.13 (from uvicorn[standard]==0.32.0->-r requirements.txt (line 2))
  Downloading python_dotenv-1.2.1-py3-none-any.whl.metadata (25 kB)
Collecting pyyaml>=5.1 (from uvicorn[standard]==0.32.0->-r requirements.txt (line 2))
  Downloading pyyaml-6.0.3-cp314-cp314-macosx_11_0_arm64.whl.metadata (2.4 kB)
Collecting uvloop!=0.15.0,!=0.15.1,>=0.14.0 (from uvicorn[standard]==0.32.0->-r requirements.txt (line 2))
  Downloading uvloop-0.22.1-cp314-cp314-macosx_10_13_universal2.whl.metadata (4.9 kB)
Collecting watchfiles>=0.13 (from uvicorn[standard]==0.32.0->-r requirements.txt (line 2))
  Downloading watchfiles-1.1.1-cp314-cp314-macosx_11_0_arm64.whl.metadata (4.9 kB)
Collecting websockets>=10.4 (from uvicorn[standard]==0.32.0->-r requirements.txt (line 2))
  Downloading websockets-15.0.1-py3-none-any.whl.metadata (6.8 kB)
Collecting annotated-types>=0.6.0 (from pydantic!=1.8,!=1.8.1,!=2.0.0,!=2.0.1,!=2.1.0,<3.0.0,>=1.7.4->fastapi==0.115.0->-r requirements.txt (line 1))
  Downloading annotated_types-0.7.0-py3-none-any.whl.metadata (15 kB)
Collecting pydantic-core==2.41.5 (from pydantic!=1.8,!=1.8.1,!=2.0.0,!=2.0.1,!=2.1.0,<3.0.0,>=1.7.4->fastapi==0.115.0->-r requirements.txt (line 1))
  Downloading pydantic_core-2.41.5-cp314-cp314-macosx_11_0_arm64.whl.metadata (7.3 kB)
Collecting typing-inspection>=0.4.2 (from pydantic!=1.8,!=1.8.1,!=2.0.0,!=2.0.1,!=2.1.0,<3.0.0,>=1.7.4->fastapi==0.115.0->-r requirements.txt (line 1))
  Downloading typing_inspection-0.4.2-py3-none-any.whl.metadata (2.6 kB)
Collecting anyio<5,>=3.4.0 (from starlette<0.39.0,>=0.37.2->fastapi==0.115.0->-r requirements.txt (line 1))
  Downloading anyio-4.11.0-py3-none-any.whl.metadata (4.1 kB)
Collecting idna>=2.8 (from anyio<5,>=3.4.0->starlette<0.39.0,>=0.37.2->fastapi==0.115.0->-r requirements.txt (line 1))
  Downloading idna-3.11-py3-none-any.whl.metadata (8.4 kB)
Collecting sniffio>=1.1 (from anyio<5,>=3.4.0->starlette<0.39.0,>=0.37.2->fastapi==0.115.0->-r requirements.txt (line 1))
  Downloading sniffio-1.3.1-py3-none-any.whl.metadata (3.9 kB)
Downloading fastapi-0.115.0-py3-none-any.whl (94 kB)
Downloading uvicorn-0.32.0-py3-none-any.whl (63 kB)
Downloading python_multipart-0.0.12-py3-none-any.whl (23 kB)
Downloading openpyxl-3.1.2-py2.py3-none-any.whl (249 kB)
Downloading pydantic-2.12.4-py3-none-any.whl (463 kB)
Downloading pydantic_core-2.41.5-cp314-cp314-macosx_11_0_arm64.whl (1.9 MB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 1.9/1.9 MB 48.8 MB/s  0:00:00
Downloading starlette-0.38.6-py3-none-any.whl (71 kB)
Downloading anyio-4.11.0-py3-none-any.whl (109 kB)
Downloading annotated_types-0.7.0-py3-none-any.whl (13 kB)
Downloading click-8.3.1-py3-none-any.whl (108 kB)
Downloading h11-0.16.0-py3-none-any.whl (37 kB)
Downloading httptools-0.7.1-cp314-cp314-macosx_11_0_arm64.whl (108 kB)
Downloading idna-3.11-py3-none-any.whl (71 kB)
Downloading python_dotenv-1.2.1-py3-none-any.whl (21 kB)
Downloading pyyaml-6.0.3-cp314-cp314-macosx_11_0_arm64.whl (173 kB)
Downloading sniffio-1.3.1-py3-none-any.whl (10 kB)
Downloading typing_extensions-4.15.0-py3-none-any.whl (44 kB)
Downloading typing_inspection-0.4.2-py3-none-any.whl (14 kB)
Downloading uvloop-0.22.1-cp314-cp314-macosx_10_13_universal2.whl (1.4 MB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 1.4/1.4 MB 41.9 MB/s  0:00:00
Downloading watchfiles-1.1.1-cp314-cp314-macosx_11_0_arm64.whl (390 kB)
Downloading websockets-15.0.1-py3-none-any.whl (169 kB)
Downloading et_xmlfile-2.0.0-py3-none-any.whl (18 kB)
Installing collected packages: websockets, uvloop, typing-extensions, sniffio, pyyaml, python-multipart, python-dotenv, idna, httptools, h11, et-xmlfile, click, annotated-types, uvicorn, typing-inspection, pydantic-core, openpyxl, anyio, watchfiles, starlette, pydantic, fastapi
Successfully installed annotated-types-0.7.0 anyio-4.11.0 click-8.3.1 et-xmlfile-2.0.0 fastapi-0.115.0 h11-0.16.0 httptools-0.7.1 idna-3.11 openpyxl-3.1.2 pydantic-2.12.4 pydantic-core-2.41.5 python-dotenv-1.2.1 python-multipart-0.0.12 pyyaml-6.0.3 sniffio-1.3.1 starlette-0.38.6 typing-extensions-4.15.0 typing-inspection-0.4.2 uvicorn-0.32.0 uvloop-0.22.1 watchfiles-1.1.1 websockets-15.0.1
INFO:     Will watch for changes in these directories: ['/Users/shanks/Documents/Projects/p4Lens/backend']
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [65554] using WatchFiles
INFO:     Started server process [65573]
INFO:     Waiting for application startup.
INFO:     Application startup complete.


INFO:main:Processing P4 file: Basic P4 Solution.p4
INFO:main:Successfully parsed Basic P4 Solution.p4
INFO:     127.0.0.1:56525 - "POST /upload HTTP/1.1" 200 OK
INFO:main:Cleaned up file: uploads/temp_65573_Basic P4 Solution.p4

^CINFO:     Shutting down
INFO:     Waiting for application shutdown.
INFO:     Application shutdown complete.
INFO:     Finished server process [65573]
INFO:     Stopping reloader process [65554]
(venv) ➜  backend git:(main) ✗
```


```
(base) ➜  frontend git:(main) ✗ rm -rf node_modules package-lock.json

(base) ➜  frontend git:(main) ✗ npm install

added 223 packages, and audited 224 packages in 16s

42 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
(base) ➜  frontend git:(main) ✗ npm uninstall tailwindcss autoprefixer postcss


added 1 package, removed 5 packages, and audited 220 packages in 664ms

40 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
(base) ➜  frontend git:(main) ✗ npm install -D tailwindcss@^3.4.1 postcss@^8.4.31 autoprefixer@^10.4.16


added 61 packages, and audited 281 packages in 3s

55 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
(base) ➜  frontend git:(main) ✗ npm run dev

> frontend@0.0.0 dev
> vite


  VITE v7.2.2  ready in 547 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
^C
(base) ➜  frontend git:(main) ✗ 


```
