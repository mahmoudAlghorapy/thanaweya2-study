#!/usr/bin/env python3
"""Regenerate the downloadable exam PDFs in files/exams/.

Usage (from the repo root):  python3 tools/make_exam_pdfs.py
Needs google-chrome (or chromium) on PATH. For every exam page it writes:
  files/exams/<slug>-exam.pdf     exam only (no answers)  — for students
  files/exams/<slug>-answers.pdf  exam + answer key        — for checking
Run it again whenever an exam page changes.
"""
import os, shutil, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'files', 'exams')

# page -> (slug, kind). kind "unit": pages built on assets/study.css (answers in <details class="ans">)
#                      kind "sheet": the printable 1+2 exam (answer keys in .key-sheet blocks)
EXAMS = {
    'امتحان_الوحدة_الأولى_والثانية.html': ('units1-2', 'sheet'),
    'امتحان_الوحدة_1.html': ('unit1', 'unit'),
    'امتحان_الوحدة_3.html': ('unit3', 'unit'),
    'امتحان_الوحدة_4.html': ('unit4', 'unit'),
    'امتحان_الوحدة_5.html': ('unit5', 'unit'),
    'امتحان_الوحدة_6.html': ('unit6', 'unit'),
    'امتحان_الوحدة_7.html': ('unit7', 'unit'),
}

COMMON = '@media print{header,.sitehead,.exam-note,.bar,.noprint,.dl-bar{display:none!important}}' \
         '@page{size:A4;margin:12mm}'
MODE_CSS = {
    ('unit', 'exam'): '',
    ('unit', 'answers'): '@media print{details.ans{display:block!important;break-inside:avoid}}',
    ('sheet', 'exam'): '@media print{.key-sheet{display:none!important}}',
    ('sheet', 'answers'): '',
}
OPEN_JS = "<script>document.querySelectorAll('details').forEach(function(d){d.open=true});</script>"


def chrome():
    for name in ('google-chrome', 'chromium', 'chromium-browser'):
        p = shutil.which(name)
        if p:
            return p
    sys.exit('google-chrome/chromium not found')


def main():
    os.makedirs(OUT, exist_ok=True)
    tmp = tempfile.mkdtemp(prefix='exam-pdf-')
    shutil.copytree(os.path.join(ROOT, 'assets'), os.path.join(tmp, 'assets'))
    browser = chrome()
    for page, (slug, kind) in EXAMS.items():
        src = open(os.path.join(ROOT, page), encoding='utf-8').read()
        for mode in ('exam', 'answers'):
            html = src.replace('</head>', '<style>' + COMMON + MODE_CSS[(kind, mode)] + '</style></head>', 1)
            if mode == 'answers':
                html = html.replace('</body>', OPEN_JS + '</body>', 1)
            page_path = os.path.join(tmp, f'{slug}-{mode}.html')
            open(page_path, 'w', encoding='utf-8').write(html)
            pdf = os.path.join(OUT, f'{slug}-{mode}.pdf')
            subprocess.run([browser, '--headless=new', '--disable-gpu', '--no-pdf-header-footer',
                            '--virtual-time-budget=8000', f'--print-to-pdf={pdf}', 'file://' + page_path],
                           check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=120)
            print(f'{os.path.getsize(pdf) // 1024:5d} KB  files/exams/{slug}-{mode}.pdf')
    shutil.rmtree(tmp)


if __name__ == '__main__':
    main()
