"""Rebuild the small-board diagrams used in the Block Bishop course."""
from pathlib import Path
from html import escape
from textwrap import wrap
ROOT = Path(__file__).resolve().parents[1] / 'public/mcc-bishop'
ROOT.mkdir(exist_ok=True)
INK, BLUE, MUTED = '#173949', '#205b76', '#536874'


def text(x, y, value, size=17, colour=INK, bold=False, anchor='start', mono=False):
    return f'<text x="{x}" y="{y}" fill="{colour}" font-family="{("Consolas, monospace" if mono else "Arial, sans-serif")}" font-size="{size}" font-weight="{700 if bold else 400}" text-anchor="{anchor}">{escape(str(value))}</text>'


def reachable(n, x, y, blocked):
    seen = {(x, y)}
    queue = [(x, y)]
    for r, c in queue:
        for dest in [(3-r, c-1), (3-r, c+1)]:
            if 1 <= dest[1] <= n and dest != blocked and dest not in seen:
                seen.add(dest)
                queue.append(dest)
    return seen


def make(name, title, notes, footer, board=None):
    for mobile in [False, True]:
        width, margin = (360, 19) if mobile else (900, 32)
        title_lines = wrap(title, 27 if mobile else 57)
        body = ''.join(text(margin, 35+i*28, line, 22 if mobile else 26, bold=True) for i, line in enumerate(title_lines))
        y = 60 + (len(title_lines)-1)*28
        if board:
            n, x, start, block = board
            cell = min(65, (width-2*margin-45)/n)
            left = (width - n*cell)/2 + 12
            seen = reachable(n, x, start, block)
            for row in [2, 1]:
                top = y + (2-row)*cell
                body += text(left-9, top+cell*.57, f'r={row}', 11 if mobile else 15, MUTED, anchor='end')
                for col in range(1, n+1):
                    xx = left+(col-1)*cell
                    is_start, blocked = (row, col) == (x, start), (row, col) == block
                    colour = BLUE if is_start else '#ffdfd2' if blocked else '#dceee0' if (row, col) in seen else '#fff'
                    body += f'<rect x="{xx}" y="{top}" width="{cell}" height="{cell}" fill="{colour}" stroke="#93acb9"/>'
                    mark = 'B' if is_start else '×' if blocked else 'o' if (row, col) in seen else '-'
                    body += text(xx+cell/2, top+cell*.65, mark, 22 if mobile else 28, '#fff' if is_start else '#9b321e' if blocked else INK, True, 'middle')
            for col in range(1, n+1):
                body += text(left+(col-.5)*cell, y+2*cell+20, col, 13 if mobile else 16, MUTED, anchor='middle')
            y += 2*cell+40
            body += text(width/2, y, 'B = start     o = reachable     × = block', 11 if mobile else 14, MUTED, anchor='middle')
            y += 23
        gap = 14
        card_width = width-2*margin if mobile else (width-2*margin-gap*(len(notes)-1))/len(notes)
        rendered = []
        for label, lines in notes:
            label_lines = wrap(label, 32 if mobile else max(18, int((card_width-25)/8.5)))
            lines = [part for line in lines for part in wrap(line, max(15, int((card_width-25)/8.2)), break_long_words=False)]
            height = 26+len(label_lines)*21+len(lines)*23
            rendered.append((label_lines, lines, height))
        max_height = max(card[2] for card in rendered)
        for i, (labels, lines, height) in enumerate(rendered):
            xx = margin if mobile else margin+i*(card_width+gap)
            top = y
            h = height if mobile else max_height
            body += f'<rect x="{xx}" y="{top}" width="{card_width}" height="{h}" rx="5" fill="#f0f5f8" stroke="#c0d2dc"/>'
            for j, line in enumerate(labels):
                body += text(xx+12, top+24+j*21, line, 14, BLUE, True)
            for j, line in enumerate(lines):
                body += text(xx+12, top+26+len(labels)*21+j*23, line, 16)
            if mobile:
                y += height+gap
        if not mobile:
            y += max_height+gap
        for line in wrap(footer, 36 if mobile else 92):
            body += text(margin, y+21, line, 14 if mobile else 15, MUTED)
            y += 22
        height = int(y+22)
        svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}"><title>{escape(title)}</title><desc>{escape(footer)}</desc><rect width="{width}" height="{height}" fill="white"/>{body}</svg>'
        (ROOT/(name+('-mobile' if mobile else '')+'.svg')).write_text(svg)


make('bishop-print', 'An instruction becomes output', [('EDITOR', ['print("BISHOP")']), ('SHELL', ['BISHOP', 'The quotes stay in the code.'])], 'print() displays a result. It does not read a new input.')
make('bishop-input', 'One count line, then one line per case', [('FIRST LINE', ['T = number of cases', 'Example: 3']), ('EACH CASE LINE', ['N X Y', 'columns, row, column']), ('READ ONE CASE', ['input().split()', 'Convert its three items.'])], 'Read T once. Read a fresh N X Y line inside each loop turn.')
make('bishop-coordinates', 'Read (row, column)', [('START: (2, 2)', ['Row 2 is at the top.', 'Column 2 is second from the left.']), ('BOARD LABELS', ['Rows: 1 and 2', 'Columns: 1 through N'])], 'Board coordinates start at 1. The input-list indices start at 0.', (5, 2, 2, None))
make('bishop-step', 'One diagonal step changes both numbers', [('FROM (2, 3), LEFT', ['New row: 3 - 2 = 1', 'New column: 3 - 1 = 2', 'Destination: (1, 2)']), ('FROM (2, 3), RIGHT', ['New row: 3 - 2 = 1', 'New column: 3 + 1 = 4', 'Destination: (1, 4)'])], 'On a two-row board each move reaches an adjacent diagonal square.')
make('bishop-edges', 'Keep the next column inside the board', [('LEFT EXISTS WHEN', ['Y > 1', 'At column 1 there is no column 0.']), ('RIGHT EXISTS WHEN', ['Y < N', 'At column N there is no column N + 1.'])], 'The destination must also be unblocked. You cannot block the start.')
make('bishop-start', 'Zero moves still leaves one square', [('ONE COLUMN', ['The bishop cannot move.', 'Block the only other square.']), ('REACHABLE COUNT', ['1', 'The starting square counts.'])], 'A zero-move route is allowed, so the answer is never zero.', (1, 1, 1, (2, 1)))
make('bishop-zigzag', 'Count squares rather than steps', [('LEFT ROUTE FROM (2, 4)', ['(2, 4) -> (1, 3)', '-> (2, 2) -> (1, 1)']), ('TWO DIFFERENT COUNTS', ['3 moves', '4 reachable squares', 'Include the starting square.'])], 'There is one reachable zigzag square in each visited column.', (4, 2, 4, None))
make('bishop-counts', 'Count each side, including the start', [('LEFT: COLUMNS 1 TO 3', ['1, 2, 3', 'left = Y = 3']), ('RIGHT: COLUMNS 3 TO 6', ['3, 4, 5, 6', 'right = N - Y + 1 = 4'])], 'Subtraction counts gaps. Add 1 to include both endpoint squares.', (6, 1, 3, None))
make('bishop-block', 'Block one direction; keep the other', [('BLOCK RIGHT AT (2, 4)', ['Keeps columns 1, 2, 3.', '3 squares remain.']), ('BLOCK LEFT AT (2, 2)', ['Keeps columns 3, 4, 5, 6.', '4 squares remain.'])], 'The smaller result is 3. A block on the other zigzag does not stop this route.', (6, 1, 3, (2, 4)))
make('bishop-choose', 'Choose the smaller reachable count', [('CALCULATE', ['left = Y', 'right = N - Y + 1']), ('CHOOSE', ['Left smaller or equal: keep left.', 'Otherwise: keep right.']), ('DISPLAY', ['print(answer)', 'min(left, right) is another way to choose.'])], 'Changing X changes the row pattern; these column counts stay the same.')
make('bishop-big', 'Large boards, two small calculations', [('THE INPUT CAN SAY', ['N = 10^18', 'Use Python int to keep every digit.']), ('FOR EACH CASE', ['Calculate Y.', 'Calculate N - Y + 1.', 'Choose the smaller count.'])], 'Do not draw or visit every column. The calculation uses a fixed number of arithmetic steps.')
make('bishop-files', 'An answer file contains results', [('INPUT: THREE CASES', ['3', '5 2 2', '1 1 1', '6 1 3']), ('ANSWER: THREE LINES', ['2', '1', '3']), ('SAVE THE SAMPLE AS', ['out_sample_01.txt', 'No prompts, labels or Python instructions.'])], 'Each input case produces one count on its own output line.')
