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
        body=panel(24,75,312,85,'TYPE AND PRESS ENTER','Alex')+arrow(180,170,180,193)+panel(24,205,312,85,'name = input()','"Alex"')
        body+=arrow(180,300,180,323)+panel(24,335,312,85,'print(name)','Alex')
    else:
        body=panel(30,100,240,120,'TYPE AND PRESS ENTER','Alex')+arrow(282,160,315,160)+panel(330,100,240,120,'name = input()','"Alex"')
        body+=arrow(582,160,615,160)+panel(630,100,240,120,'print(name)','Alex')
    save('02-name-input','Read → Remember → Print',body,'Try Maya next. Keep the same code.',mobile,470 if mobile else 285)
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
    # Index practice separates a place label from the character stored there.
    body=text(24 if mobile else 65,82,'bits = "10010"',21,True)
    body+=text(24 if mobile else 65,112,'Python indices',17,colour=MUTED)
    body+=row('10010',x,151,cell,active=(2,),labels=list(range(5)))
    if mobile:
        body+=text(24,240,'index = 2',22,True,colour=BLUE)
        body+=text(24,281,'bits[index] → bits[2]',20,True)
        body+=text(24,324,'Output: 0',25,True,colour=BLUE)
    else:
        body+=panel(530,106,310,100,'CHOSEN PLACE','index = 2')
        body+=text(65,264,'bits[index]  →  bits[2]  →  "0"',26,True,colour=BLUE)
    save('03-index-variable','Index chooses a character',body,'2 is the index; 0 is the character.',mobile,375 if mobile else 325)
    body=text(24 if mobile else 65,82,'bits = "10010"',21,True)+row('10010',x,126,cell,labels=list(range(5)))
    if mobile:
        body+=text(50,218,'index',18,True,colour=MUTED)+text(170,218,'bits[index]',18,True,colour=MUTED)
        for turn,(index,bit) in enumerate([(0,'1'),(1,'0'),(4,'0')]):
            yy=259+turn*40
            body+=text(75,yy,index,24,True,'middle',BLUE)+arrow(111,yy-8,145,yy-8)+text(236,yy,f'"{bit}"',24,True,'middle',BLUE)
    else:
        for i,(index,bit) in enumerate([(0,'1'),(1,'0'),(4,'0')]):
            body+=panel(42+i*288,214,264,90,f'index = {index}',f'bits[{index}] → "{bit}"',True)
    save('03-index-choice','Change the place you read',body,'Five characters use indices 0 to 4.',mobile,390 if mobile else 350)
    body=text(24 if mobile else 55,82,'bits = "10010"',21,True)+row('10010',x if mobile else 55,126,cell,active=(2,),labels=list(range(5)))
    if mobile:
        body+=text(24,216,'Loop index',17,colour=MUTED)+text(177,216,'bits[index]',17,True,colour=MUTED)
        for index,bit in enumerate('10010'):
            yy=254+index*34
            body+=text(83,yy,index,23,True,'middle',BLUE)+arrow(123,yy-7,155,yy-7)+text(241,yy,f'"{bit}"',23,True,'middle',BLUE)
        body+=text(24,428,'print(bits[index])',21,True,colour=BLUE)
    else:
        body+=text(55,226,'for index in range(n):',22,True)+text(55,263,'    print(bits[index])',22,True)
        body+=text(560,85,'Loop index',18,colour=MUTED)+text(710,85,'bits[index]',18,True,colour=MUTED)
        for index,bit in enumerate('10010'):
            yy=123+index*35
            body+=text(610,yy,index,23,True,'middle',BLUE)+arrow(651,yy-7,683,yy-7)+text(770,yy,f'"{bit}"',23,True,'middle',BLUE)
    save('03-index-loop','Read a character each turn',body,'Print the character on each turn.',mobile,480 if mobile else 330)
    body=text(24 if mobile else 65,82,'bits = "10010"',21,True)+row('10010',x if mobile else 65,131,cell,active=(3,),labels=list(range(5)))
    if mobile:
        body+=text(24,224,'index = 3',22,True,colour=BLUE)
        body+=panel(24,245,148,85,'index + 1','4',True)+panel(188,245,148,85,'bits[index]','"1"',True)
        body+=text(180,371,'print(4, "1") → 4 1',20,True,'middle',BLUE)
    else:
        body+=text(520,83,'index = 3',22,True,colour=BLUE)
        body+=panel(495,110,165,100,'index + 1','4')+panel(685,110,170,100,'bits[index]','"1"')
        body+=text(65,272,'print(index + 1, bits[index])',25,True)+arrow(595,264,635,264)+text(685,272,'4 1',29,True,colour=BLUE)
    save('03-index-labels','Print both values',body,'Look up with index. Label with index + 1.',mobile,420 if mobile else 330)
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
    if mobile:
        body=panel(24,75,312,92,'BEFORE ANY VISIT','zeroCount = 0',True)
        body+=text(24,207,'Then visit the characters:',18)+row('01010',50,232,52)
    else:
        body=panel(45,95,390,125,'BEFORE ANY VISIT','zeroCount = 0')
        body+=text(510,100,'Then visit each character',20)+row('01010',510,140,64)
    save('06-counter-start','Start before the loop',body,'No characters visited: no zeros counted.',mobile,330 if mobile else 285)
    body=''
    if mobile:
        body=text(24,88,'Start once, before the loop',18,colour=BLUE)
        lines=['zeroCount = 0','for bit in bits:','    if bit == "0":','        zeroCount = zeroCount + 1','print(zeroCount)']
        for i,line in enumerate(lines):body+=text(18,127+i*35,line,16,True,colour=BLUE if i in (0,4) else INK)
        body+=text(24,323,'For 01010, final count: 3.',18,colour=BLUE)
    else:
        lines=['zeroCount = 0','for bit in bits:','    if bit == "0":','        zeroCount = zeroCount + 1','print(zeroCount)']
        for i,line in enumerate(lines):body+=text(45,99+i*37,line,21,True,colour=BLUE if i in (0,4) else INK)
        body+=panel(530,95,320,105,'INPUT STRING','01010')+text(545,247,'Finished count: 3',23,True,colour=BLUE)
    save('06-counter-build','Build the counting block',body,'Start before. Print after.',mobile,370 if mobile else 315)
    # Family 7: append and list length.
    if mobile:
        body=panel(24,72,312,75,'START EMPTY','[]',True)+panel(24,167,312,75,'APPEND POSITION 2','[2]',True)+panel(24,262,312,75,'APPEND POSITION 4','[2, 4]',True)+text(180,376,'len(positions) = 2',20,True,'middle',BLUE)
    else:
        body=panel(35,90,230,125,'START EMPTY','[]')+arrow(280,150,310,150)+panel(330,90,230,125,'APPEND POSITION 2','[2]')+arrow(575,150,605,150)+panel(625,90,240,125,'APPEND POSITION 4','[2, 4]')+text(450,254,'len(positions) = 2',22,True,'middle',BLUE)
    save('07-list','Keep positions in a list',body,'These are question positions.',mobile,420 if mobile else 300)
    # Family 8: the boundary follows the zero count, not the midpoint.
    rx=50 if mobile else 230;cs=52 if mobile else 65
    body=text(24 if mobile else 45,83,'Count zeros in the whole input.',18 if mobile else 22)
    body+=text(24 if mobile else 45,112,'Current',17,colour=MUTED)+row('01010',rx,143,cs,wrong=(0,2,4),labels=list(range(1,6)))
    body+=text(24 if mobile else 45,225,'Sorted target',17,colour=MUTED)+row('00011',rx,250,cs,active=(0,1,2))
    bx=rx+3*cs
    body+=f'<path d="M{bx} 235V306" stroke="{BLUE}" stroke-width="3"/>'
    if mobile:body+=text(24,354,'3 zeros → first 3 places',21,True,colour=BLUE)
    else:body+=panel(620,120,230,88,'ZERO COUNT','3')+text(595,272,'First 3 places are zeros',19,colour=BLUE)
    save('08-zero-purpose','Why count the zeros?',body,'Swaps keep the same zero count.',mobile,415 if mobile else 345)
    body=text(24 if mobile else 45,83,'zeroCount = 3',20,True,colour=BLUE)
    body+=row('01010',50 if mobile else 255,130,52 if mobile else 65,active=(0,2),wrong=(1,),labels=list(range(5)))
    bx=(50+3*52) if mobile else (255+3*65)
    body+=f'<path d="M{bx} 112V183" stroke="{BLUE}" stroke-width="3"/>'
    if mobile:
        body+=text(34,222,'Index',17)+text(137,222,'Character',17)+text(271,222,'Print',17)
        for i,(bit,output) in enumerate([('0','skip'),('1','2'),('0','skip')]):
            yy=265+i*36
            body+=text(57,yy,i,22,True,'middle')+text(183,yy,f'"{bit}"',22,True,'middle')+text(291,yy,output,21,True,'middle',BLUE)
    else:
        body+=text(125,222,'Index',18)+text(370,222,'bits[index]',18,True)+text(675,222,'Print',18)
        for i,(bit,output) in enumerate([('0','skip'),('1','2'),('0','skip')]):
            yy=262+i*35
            body+=text(150,yy,i,23,True,'middle')+text(430,yy,f'"{bit}"',23,True,'middle')+text(700,yy,output,22,True,'middle',BLUE)
    save('08-zero-visit','Choose wrong ones',body,'A 1 is wrong in the zero section.',mobile,395 if mobile else 385)
    if mobile:
        body=panel(24,75,312,100,'INPUT','',True)+text(40,128,'n = 5',21,True)+text(40,158,'bits = "01010"',21,True)
        body+=arrow(180,180,180,199)+panel(24,210,312,90,'COUNT THE WHOLE STRING','zeroCount = 3',True)
        body+=arrow(180,305,180,324)+panel(24,335,312,110,'INSPECT FIRST 3 PLACES','',True)+text(40,389,'Positions: 1, 2, 3',20,True)+text(40,425,'Output: 2',21,True,colour=BLUE)
    else:
        body=panel(35,95,240,165,'INPUT','',True)+text(51,159,'n = 5',23,True)+text(51,203,'bits = "01010"',21,True)
        body+=arrow(286,177,313,177)+panel(325,95,250,165,'COUNT WHOLE STRING','',True)+text(341,165,'zeroCount = 3',21,True,colour=BLUE)+text(341,210,'First loop',18,colour=MUTED)
        body+=arrow(586,177,613,177)+panel(625,95,240,165,'INSPECT ZERO PLACES','',True)+text(641,165,'1, 2, 3',23,True,colour=BLUE)+text(641,210,'Output: 2',23,True,colour=BLUE)
    save('08-zero-build','Input → Count → Inspect',body,'Count first. Inspect afterwards.',mobile,490 if mobile else 315)
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

print('Built 27 reference strips in desktop and mobile layouts.')
