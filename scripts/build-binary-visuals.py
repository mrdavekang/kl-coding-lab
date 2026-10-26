"""Rebuild responsive, text-accessible SVG reference strips for Binary Sorting."""
from html import escape
from pathlib import Path

DEST = Path(__file__).resolve().parents[1] / "public" / "mcc-binary-sorting"
INK, MUTED, BLUE, GOLD = "#173949", "#536674", "#245a8d", "#fff0b6"


def text(x, y, value, size=20, mono=False, anchor="start", colour=INK, weight=400):
    family = "Consolas, monospace" if mono else "Arial, sans-serif"
    return f'<text x="{x}" y="{y}" font-family="{family}" font-size="{size}" font-weight="{weight}" fill="{colour}" text-anchor="{anchor}" xml:space="preserve">{escape(str(value))}</text>'


def panel(x, y, width, height, label, value, small=False):
    return (f'<rect x="{x}" y="{y}" width="{width}" height="{height}" rx="7" fill="#f0f5f8" stroke="#ccdbe3"/>'
            + text(x+16, y+25, label, 16, colour=MUTED)
            + text(x+16, y+height-19, value, 21 if small else 27, True, colour=BLUE))


def arrow(x1, y1, x2, y2):
    return f'<path d="M{x1} {y1}L{x2} {y2}" fill="none" stroke="{BLUE}" stroke-width="2.5" marker-end="url(#tip)"/>'


def row(bits, x, y, cell=52, active=(), wrong=(), labels=None):
    out=""
    for i, bit in enumerate(bits):
        fill = GOLD if i in wrong else "#e5eff9" if i in active else "#f8fafb"
        if labels:
            out += text(x+i*cell+cell/2, y-13, labels[i], 16, True, "middle", MUTED)
        out += f'<rect x="{x+i*cell}" y="{y}" width="{cell}" height="48" fill="{fill}" stroke="#9aadb8"/>'
        out += text(x+i*cell+cell/2, y+33, bit, 27, True, "middle")
    return out


def save(name, title, body, footer, mobile=False, height=300):
    width=360 if mobile else 900
    suffix="-mobile" if mobile else ""
    svg=(f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">'
         f'<title>{escape(title)}</title><desc>{escape(footer)}</desc>'
         '<defs><marker id="tip" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8" fill="#245a8d"/></marker></defs>'
         f'<rect width="{width}" height="{height}" fill="#fff"/>'
         +text(24 if mobile else 34, 38 if mobile else 42, title, 21 if mobile else 27, weight=600)
         +body+text(24 if mobile else 34,height-20,footer,16 if mobile else 18,colour=MUTED)+'</svg>')
    (DEST/f'{name}{suffix}.svg').write_text(svg)


for mobile in (False, True):
    w=360 if mobile else 900
    x=50 if mobile else 140
    cell=52 if mobile else 64
    labels=list(range(5))
    # Families 1 and 2: output and input, with separate two-line variants.
    for two in (False,True):
        if mobile:
            body=panel(24,70,312,90,'EDITOR','print("0")',True)
            if two:body+=text(40,144,'print("1")',21,True,colour=BLUE)
            body+=arrow(180,170,180,198)+panel(24,210,312,110 if two else 90,'SHELL','0',True)
            if two:body+=text(40,300,'1',21,True,colour=BLUE)
            height=365 if two else 345
        else:
            body=panel(45,90,360,130,'EDITOR','print("0")')
            if two:body+=text(61,202,'print("1")',27,True,colour=BLUE)
            body+=arrow(430,155,480,155)+panel(510,90,340,130,'SHELL','0')
            if two:body+=text(526,202,'1',27,True,colour=BLUE)
            height=300
        # Use explicit rows instead of overprinting the panel value in two-line views.
        if two:
            if mobile:
                body=panel(24,70,312,105,'EDITOR','',True)+text(40,126,'print("0")',21,True,colour=BLUE)+text(40,157,'print("1")',21,True,colour=BLUE)+arrow(180,185,180,204)+panel(24,215,312,105,'SHELL','',True)+text(40,271,'0',21,True,colour=BLUE)+text(40,302,'1',21,True,colour=BLUE)
            else:
                body=panel(45,90,360,130,'EDITOR','')+text(61,155,'print("0")',27,True,colour=BLUE)+text(61,199,'print("1")',27,True,colour=BLUE)+arrow(430,155,480,155)+panel(510,90,340,130,'SHELL','')+text(526,155,'0',27,True,colour=BLUE)+text(526,199,'1',27,True,colour=BLUE)
        save('01-lines' if two else '01-print','Two print lines' if two else 'Code to Shell',body,'Each print starts a new line.' if two else 'Quotes stay in the code.',mobile,height)
    if mobile:
        body=panel(24,75,312,85,'TYPE IN THE SHELL','01010')+arrow(180,172,180,204)+panel(24,217,312,85,'REMEMBER AS bits','"01010"')
    else:
        body=panel(45,95,350,125,'TYPE IN THE SHELL','01010')+arrow(420,155,480,155)+panel(510,95,345,125,'bits = input()','"01010"')
    save('02-input','Keep the whole input',body,'The first zero is kept.',mobile,350 if mobile else 300)
    if mobile:
        body=panel(24,72,312,85,'FIRST LINE: 5','n = 5',True)+panel(24,178,312,85,'SECOND LINE: 01010','bits = "01010"',True)
    else:
        body=panel(45,95,370,125,'FIRST LINE: 5','n = 5')+panel(470,95,385,125,'SECOND LINE: 01010','bits = "01010"')
    save('02-two-inputs','Read two separate lines',body,'n is a number. bits stays as text.',mobile,320 if mobile else 300)
    # Family 3: character access and conversion to question positions.
    body=text(24 if mobile else 90,84,'Python indices',17,colour=MUTED)+row('01010',x,119,cell,active=(1,),labels=labels)
    body+=text(w/2,218,'bits[1]  →  "1"',23,True,'middle',BLUE)
    save('03-index','Read one character',body,'Index 1 is the second character.',mobile,285 if mobile else 300)
    body=text(24 if mobile else 70,83,'Question positions',17,colour=MUTED)
    for i in range(5):body+=text(x+i*cell+cell/2,112,i+1,18,True,'middle')
    body+=row('01010',x,134,cell,active=(1,))
    for i in range(5):body+=text(x+i*cell+cell/2,210,i,18,True,'middle',MUTED)
    body+=text(24 if mobile else 70,243,'Python indices',17,colour=MUTED)+text(w/2,284,'index 1 + 1 = position 2',19,True,'middle',BLUE)
    save('03-positions','Two number systems',body,'Store question positions once.',mobile,340)
    # Families 4–6: loop, condition and counter.
    body=text(24 if mobile else 65,82,'bits = "01010"',20,True)+row('01010',x if mobile else 65,119,cell,active=(1,))
    if mobile:
        body+=panel(24,200,312,83,'CURRENT CHARACTER','bit = "1"',True)+text(24,319,'Output so far: 0, then 1',18)
    else:
        body+=panel(520,106,325,102,'CURRENT CHARACTER','bit = "1"')+text(65,240,'for bit in bits:',22,True)+text(345,240,'visits one character each turn',19)
    save('04-loop','One character per turn',body,'Print bit, the current character.',mobile,370 if mobile else 300)
    body=text(24 if mobile else 55,91,'if bit == "0":',20 if mobile else 23,True)+text(24 if mobile else 55,123,'    print(bit)',20 if mobile else 23,True)
    if mobile:
        body+=text(35,190,'"0"',24,True)+arrow(92,182,138,182)+text(161,190,'match: print 0',18)+text(35,257,'"1"',24,True)+arrow(92,249,138,249)+text(161,257,'no match: skip',18)
    else:
        body+=text(465,124,'"0"',27,True)+arrow(530,115,590,115)+text(620,124,'match: print 0',23)+text(465,205,'"1"',27,True)+arrow(530,196,590,196)+text(620,205,'no match: skip',23)
    save('05-filter','Choose only zeros',body,'The indented line runs for a match.',mobile,320 if mobile else 300)
    body=text(24 if mobile else 65,84,'Start: zeroCount = 0',20,True)+row('01010',x,123,cell,active=(2,))
    body+=text(24 if mobile else 65,210,'Count after each visit',17,colour=MUTED)
    for i,n in enumerate([1,1,2,2,3]):body+=text(x+i*cell+cell/2,247,n,24,True,'middle',BLUE)
    save('06-counter','Add one for a zero',body,'A one leaves the count unchanged.',mobile,300)
    # Family 7: append and list length.
    if mobile:
        body=panel(24,72,312,75,'START EMPTY','[]',True)+panel(24,167,312,75,'APPEND POSITION 2','[2]',True)+panel(24,262,312,75,'APPEND POSITION 4','[2, 4]',True)+text(180,376,'len(positions) = 2',20,True,'middle',BLUE)
    else:
        body=panel(35,90,230,125,'START EMPTY','[]')+arrow(280,150,310,150)+panel(330,90,230,125,'APPEND POSITION 2','[2]')+arrow(575,150,605,150)+panel(625,90,240,125,'APPEND POSITION 4','[2, 4]')+text(450,254,'len(positions) = 2',22,True,'middle',BLUE)
    save('07-list','Keep positions in a list',body,'These are question positions.',mobile,420 if mobile else 300)
    # Family 8: the boundary follows the zero count, not the midpoint.
    for side in ('left','right'):
        rx=50 if mobile else 255;cs=52 if mobile else 65
        wrong_indices=(1,) if side=='left' else (4,)
        body=text(24 if mobile else 40,80,'3 zeros → 3 zero places',18 if mobile else 22,colour=BLUE)
        body+=text(24 if mobile else 55,113,'Current',17,colour=MUTED)+row('01010',rx,143,cs,wrong=wrong_indices,labels=list(range(1,6)))
        body+=text(24 if mobile else 55,218,'Required',17,colour=MUTED)+row('00011',rx,242,cs)
        bx=rx+3*cs
        body+=f'<path d="M{bx} 127V290" stroke="{BLUE}" stroke-width="3"/>'
        body+=text(w/2,333,'Wrong 1: position 2' if side=='left' else 'Wrong 0: position 5',20,True,'middle',BLUE)
        save('08-'+side,'The zero section ends here',body,'Position numbers start at 1.',mobile,375)
    # Family 9: matching list items, followed by the physical swap.
    if mobile:
        body=panel(24,88,148,105,'leftWrong','[2]',True)+panel(188,88,148,105,'rightWrong','[5]',True)
        body+=arrow(98,211,180,247)+arrow(262,211,180,247)+text(180,287,'Swap 2 5',25,True,'middle',BLUE)
    else:
        body=panel(65,85,290,120,'leftWrong','[2]')+panel(545,85,290,120,'rightWrong','[5]')+arrow(380,146,520,146)+text(450,246,'Swap 2 5',27,True,'middle',BLUE)
    save('09-pairs','One from each list',body,'Each pair fixes two wrong places.',mobile,340 if mobile else 300)
    rx=50 if mobile else 260;cs=52 if mobile else 65
    body=text(24 if mobile else 45,83,'Swap positions 2 and 5',20,colour=BLUE)+row('01010',rx,119,cs,active=(1,4),labels=list(range(1,6)))
    a=rx+1.5*cs;b=rx+4.5*cs
    body+=f'<path d="M{a} 174 Q{(a+b)/2} 220 {b} 174" fill="none" stroke="{BLUE}" stroke-width="2" marker-end="url(#tip)"/>'
    body+=row('00011',rx,236,cs,active=(1,4),labels=list(range(1,6)))
    save('09-swap','Move digits, keep place labels',body,'Only the selected digits move.',mobile,340)
    # Family 10: answer format, a two-pair variant and the empty-plan case.
    for two in (False,True):
        values=['2','2 5','4 6'] if two else ['1','2 5']
        labels=['swap count','first pair','second pair'] if two else ['swap count','positions']
        body=panel(24 if mobile else 65,77,312 if mobile else 360,165 if two else 130,'ONE VALID OUTPUT','')
        for i,(value,label) in enumerate(zip(values,labels)):
            yy=133+i*43
            body+=text(48 if mobile else 90,yy,value,26,True,colour=BLUE)
            body+=text(155 if mobile else 485,yy,label,18 if mobile else 22)
        save('10-two-pairs' if two else '10-output','Two swaps for 010100' if two else 'Count first, then pairs',body,'Different minimum plans can be valid.',mobile,300)
    body=row('00111',x,104,cell,labels=list(range(1,6)))
    if mobile:body+=text(24,211,'leftWrong = []',19,True)+text(24,245,'rightWrong = []',19,True)+text(24,303,'Output: 0',24,True,colour=BLUE)
    else:body+=text(540,110,'leftWrong = []',23,True)+text(540,153,'rightWrong = []',23,True)+text(540,213,'Output: 0',29,True,colour=BLUE)
    save('10-zero','Already sorted',body,'No pair lines are needed.',mobile,350 if mobile else 300)

print('Built 17 reference strips in desktop and mobile layouts.')
