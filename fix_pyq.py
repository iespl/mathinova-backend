import sys

path = r"c:\Users\invt\.gemini\antigravity\scratch\mathinova-platform-frontend\src\pages\CourseDetailPage.tsx"
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

start_comment = "{/* 2. PYQ Practice - list individual PYQs */}"
end_comment = "{/* 3. Lesson Quiz */}"

start_idx = content.find(start_comment)
end_idx = content.find(end_comment)

if start_idx == -1 or end_idx == -1:
    print(f"Markers not found! start={start_idx}, end={end_idx}")
    sys.exit(1)

# Get indentation of the start marker
line_start = content.rfind('\n', 0, start_idx) + 1
indent = ' ' * (start_idx - line_start)

new_section = """{/* 2. PYQ Practice - only show FREE sample PYQs */}
""" + indent + """{(lesson.pyqs || []).filter((p: any) => p.isSample).map((pyq: any, pyqIdx: number) => (
""" + indent + """    <div
""" + indent + """        key={pyq.id}
""" + indent + """        onClick={() => { setActivePyq(pyq); setIsPyqModalOpen(true); }}
""" + indent + """        className="flex items-center gap-4 transition-colors cursor-pointer group hover:bg-white/[0.06]"
""" + indent + """        style={{ paddingTop: '10px', paddingBottom: '10px', paddingLeft: '42px', paddingRight: '42px' }}
""" + indent + """    >
""" + indent + """        <FileText size={15} className="text-primary" />
""" + indent + """        <div className="flex-1 min-w-0">
""" + indent + """            <div className="text-sm font-medium truncate text-text-secondary group-hover:text-text-primary">
""" + indent + """                PYQ {pyqIdx + 1}
""" + indent + """            </div>
""" + indent + """        </div>
""" + indent + """        <div className="flex items-center gap-2 shrink-0">
""" + indent + """            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-black uppercase">Free</span>
""" + indent + """        </div>
""" + indent + """    </div>
""" + indent + """))}

""" + indent

old_section = content[start_idx:end_idx]
print(f"Found section of {len(old_section)} chars, replacing...")

new_content = content[:start_idx] + new_section + content[end_idx:]
with open(path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Done!")
