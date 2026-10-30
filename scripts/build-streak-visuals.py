"""Build responsive SVG teaching diagrams for streaks and answer files."""
from pathlib import Path
from html import escape
import textwrap
ROOT=Path(__file__).resolve().parents[1]/'public'
INK='#173949'; BLUE='#205b76'; MUTED='#536874'
def text(x,y,value,size=18,fill=INK,bold=False,anchor='start',mono=False):
    return f'<text x="{x}" y="{y}" fill="{fill}" font-family="{("Consolas, monospace" if mono else "Arial, sans-serif")}" font-size="{size}" font-weight="{650 if bold else 400}" text-anchor="{anchor}">{escape(str(value))}</text>'
def save(folder,name,title,cards,footer,table=None):
    dest=ROOT/folder;dest.mkdir(exist_ok=True)
    for mobile in (False,True):
        width=360 if mobile else 900; margin=20 if mobile else 32
        chunks=textwrap.wrap(title,26 if mobile else 55)
        title_svg=''.join(text(margin,36+i*29,line,23 if mobile else 27,bold=True) for i,line in enumerate(chunks))
        y=57+(len(chunks)-1)*29;body=''
        if table:
            headers,rows=table;cols=len(headers);cell=(width-2*margin)/cols
            for j,label in enumerate(headers):body+=text(margin+cell*j+cell/2,y+23,label,15,MUTED,True,'middle')
            y+=38
            for row in rows:
                for j,val in enumerate(row):
                    colour='#fff0b6' if j==len(row)-1 else '#eaf2fa'
                    body+=f'<rect x="{margin+j*cell}" y="{y}" width="{cell}" height="42" fill="{colour}" stroke="#b6c9d4"/>'
                    body+=text(margin+cell*j+cell/2,y+28,val,19,BLUE,True,'middle',True)
                y+=42
            y+=20
        cardwidth=width-2*margin if mobile else (width-2*margin-16*(len(cards)-1))/len(cards)
        card_rows=[]
        for label,lines in cards:
            wrapped=[]
            for line in lines:wrapped+=textwrap.wrap(line,max(15,int((cardwidth-28)/9)),break_long_words=False) or ['']
            card_rows.append((label,wrapped))
        h=max(110,70+max(len(lines) for _,lines in card_rows)*24)
        for i,(label,lines) in enumerate(card_rows):
            x=margin if mobile else margin+i*(cardwidth+16);cy=y+i*(h+14) if mobile else y
            body+=f'<rect x="{x}" y="{cy}" width="{cardwidth}" height="{h}" rx="6" fill="#f0f5f8" stroke="#bfd1dc"/>'
            body+=text(x+14,cy+27,label,15,BLUE,True)
            for j,line in enumerate(lines):body+=text(x+14,cy+57+j*24,line,17,INK)
        y+=len(cards)*(h+14) if mobile else h+20
        foot=textwrap.wrap(footer,35 if mobile else 85)
        for line in foot:body+=text(margin,y+20,line,16,MUTED);y+=23
        height=y+28
        svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}"><title>{escape(title)}</title><desc>{escape(footer)}</desc><rect width="{width}" height="{height}" fill="white"/>{title_svg}{body}</svg>'
        (dest/(name+('-mobile' if mobile else '')+'.svg')).write_text(svg)

folder='mcc-streak'
save(folder,'streak-print','An instruction becomes output',[('PYTHON EDITOR',['print("WIN")']),('SHELL',['WIN','The quotes stay in the code.'])],'Typing the instruction and displaying its result are different steps.')
save(folder,'streak-input','Read two lines, keep their order',[('INPUT',['4','1 0 1 1']),('PYTHON',['n = int(input())','results = input().split()']),('REMEMBER',['n is the number 4.','results contains "1", "0", "1", "1".'])],'split() separates the spaced results. It does not sort or convert them.')
save(folder,'streak-index','An index is a place label',[('LOOK UP',['results[1] is "1".']),('ROUND NUMBER',['Index 1 + 1 gives round 2.'])],'The stored result, its Python index and its round number are different.',(['Result','Index','Round'],[['0','0','1'],['1','1','2'],['1','2','3'],['0','3','4']]))
save(folder,'streak-condition','Choose the win or loss branch',[('IF: result == "1"',['This round is a WIN.','current = current + 1']),('ELSE: result is "0"',['This round is a LOSS.','current = 0'])],'Indent each branch. A loss breaks the streak; a later win starts again.')
save(folder,'streak-counter','Current means consecutive wins',[('BEFORE THE ROUNDS',['current = 0','No wins have been counted yet.']),('AT THE LOSS',['Round 3 resets current to 0.','Round 4 begins again at 1.'])],'Count next-door wins. The total number of wins would be 5, not a streak.',(['Round','Result','Current'],[['1','1','1'],['2','1','2'],['3','0','0'],['4','1','1'],['5','1','2'],['6','1','3']]))
save(folder,'streak-longest','Two memories: current and best',[('CURRENT',['The run ending now.','A loss resets this count.']),('BEST LENGTH',['The record so far.','A loss does not erase it.'])],'After the loss, keep the best length 2 even though current is 0.',(['Round','Result','Current','Best'],[['1','1','1','1'],['2','1','2','2'],['3','0','0','2'],['4','1','1','2']]))
save(folder,'streak-ends','Count both endpoints',[('THE ROUNDS',['5, 6, 7','There are THREE rounds.']),('FIND THE LENGTH',['7 - 5 + 1 = 3']),('FIND THE START',['7 - 3 + 1 = 5'])],'Length = end - start + 1. Start = end - length + 1.')
save(folder,'streak-tie','Same length? Take the later start',[('EARLIER RUN',['Rounds 5, 6, 7','Length 3','Start 5']),('LATER RUN: CHOOSE THIS',['Rounds 10, 11, 12','Length 3','Start 10'])],'10 is greater than 5. With a left-to-right scan, >= replaces an equal record.')
save(folder,'streak-scan','One visit to each round',[('1. READ THIS RESULT',['A win: increase current.','A loss: reset current.']),('2. COMPARE WITH BEST',['If current is at least bestLength and is positive, update the record.']),('3. SAVE THE ENDPOINTS',['end = index + 1','start = end - current + 1'])],'Keep the loop in time order. The record check runs after either branch.')
save(folder,'streak-output','Output the endpoints',[('INPUT IDEA',['The chosen run is rounds 10, 11, 12.']),('ANSWER TEXT',['10 12','Just two round numbers, on one line.']),('PYTHON OUTPUT',['print(bestStart, bestEnd)'])],'The required answer is the start and end, rather than the length or Python indices.')
folder='mcc-answer-files'
save(folder,'answer-files','Input, processing, answer file',[('INPUT FILE',['The given case: its size and values.']),('PROCESS',['Work by hand or use Python to apply the rules.']),('OUTPUT FILE',['Only the required result.','For example: 2 3'])],'A .py file contains instructions. An answer .txt file contains the result.')
save(folder,'answer-names','Match the file to its answer',[('SAMPLE INPUT',['sample_in_01.txt','Your answer name:','out_sample_01.txt']),('SCORED INPUT',['in_01.txt','Your answer name:','out_01.txt'])],'Keep the same case number. A different input needs its own answer.')
save(folder,'answer-format','Two questions, two answer formats',[('BINARY SORTING',['2','2 6','4 5','Count first, then that many swap pairs.']),('WINNING STREAK',['10 12','First and last round, on one line.'])],'Answer text contains no prompts, Python instructions, quotation marks or labels.')
save(folder,'answer-check','Work it out, check, download',[('1. MAKE THE ANSWER',['Act it out, calculate it, or run your Python.']),('2. CHECK THE ANSWER',['Check this text against its matching input. Fix errors and retry.']),('3. SAVE THE FILE',['Download the matching out_...txt file. Keep your own copy.'])],'A successful Python run is different from a correct answer. Check the result.')
