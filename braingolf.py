from __future__ import print_function
from decimal import Decimal
import sys
from sys import argv
from functools import reduce
from collections import deque
import os.path
import operator
import itertools
import random
import math
import re

class sdeque(deque):
  def __getitem__(self, index):
    if isinstance(index, slice):
      return type(self)(itertools.islice(self, index.start, index.stop, index.step))
    return deque.__getitem__(self, index)

stacks = []
currstack = 0
end = False
preserve = False
convert = False
reverse = False
string = False
escape = False
multiprint = False
skip = False
ifd = False
silent = False
flip = True
loop = False
fancyloop = False
greedy = False
loopstart = 0
flstart = 0
fliterator = sdeque()
printcount = ""
multichar = ""
x = 0

def isint(s):
  try:
    int(s)
    return True
  except ValueError:
    return False

def operate(operator, first, second):
  return operator(first, second)

def getstackval(stack, preserve, rev):
  if len(stack) == 0: return 0
  if preserve:
    return stack[0] if rev else stack[-1]
  else:
    return stack.popleft() if rev else stack.pop()

def getstackvals(stack, preserve, rev):
  if len(stack) < 1: return (0, 0)
  if len(stack) > 1:
    if preserve:
      left = stack[0] if rev else stack[-1]
      right = stack[1] if rev else stack[-2]
    else:
      left = stack.popleft() if rev else stack.pop()
      right = stack.popleft() if rev else stack.pop()
  else:
    if preserve:
      left = right = stack[0]
    else:
      left = right = stack.pop()
  return (left, right)

def getstack():
  global stacks
  return stacks[currstack]

def prime_factors(n):
  i = 2
  factors = []
  while i * i <= n:
    if n % i:
      i += 1
    else:
      n //= i
      factors.append(i)
  if n > 1:
    factors.append(n)
  return factors

def parse_args(args):
  res = []
  res.append(sdeque())
  for x in args:
    if isint(x):
      res[0].append(x)
    elif re.match('^\[.*\]$', x):
      arrInput = eval(x)
      res.append(sdeque())
      for i in arrInput:
        if isint(i):
          res[-1].append(int(i))
        elif len(i) == 1:
          res[-1].append(ord(i))
        else:
          for c in i:
            res[-1].append(ord(c))
    else:
      for c in x:
        res[0].append(ord(c))
  return res

def parse_char(code, stacks):
  global x
  if x < 0 or x >= len(code):
    return

  global currstack
  global end
  global preserve
  global convert
  global reverse
  global string
  global escape
  global multiprint
  global skip
  global ifd
  global silent
  global flip
  global loop
  global fancyloop
  global greedy
  global loopstart
  global flstart
  global fliterator
  global printcount
  global multichar

  stack = getstack()
  c = code[x]

  for y in range(0,len(stack)):
    if stack[y] is not int:
      stack[y] = int(stack[y])

  if skip:
    if c == '|' or c == ':':
      skip = False
      ifd = False
    return

  if fancyloop:
    if c == '}':
      fliterator.pop()
      if len(fliterator) > 0:
        while stack[-1] != fliterator [-1]:
          stack.rotate(1)
        x = flstart
      else:
        fancyloop = False
        stack.rotate(1)
      return

  if loop:
    if c == ']':
      if stack[0] > 0:
        stack[0] -= 1
        x = loopstart
      else:
        loop = False
        stack.popleft()
      return

  if multiprint:
    if isint(c):
      printcount += c
      return
    else:
      count = int(printcount) if printcount else 1
      if not silent:
        print(''.join([chr(i if i < 1114112 else 0) for i in stack[len(stack)-count:]]), end='')
      if not preserve:
        stacks[currstack] = stack[:len(stack)-count] if count < len(stack) else sdeque()
      multiprint = False
      preserve = False
      silent = False
      printcount = ""

  if string:
    if c == '"' and not escape:
      string = False
      stack += [ord(i) for i in multichar]
      multichar = ""
    elif c == '\\':
      if not escape:
        escape = True
    else:
      multichar += c
  elif convert:
    stack.append(ord(c))
    convert = False
  elif c == ':' and not ifd:
    skip = True
  elif c == '"':
    string = True
  elif c == '_':
    if not greedy:
      val = getstackval(stack, preserve, reverse)
      if not silent:
        print(val, end='')
      preserve = False
      silent = False
    else:
      for i in range(0, len(stack)):
        val = getstackval(stack, preserve, reverse)
        if not silent:
          print(val, end='')
      preserve = False
      silent = False
      greedy = False
  elif c == '=':
    if not greedy:
      print([int(i) for i in stack])
    else:
      ind = 0
      for st in stacks:
        print("%s: %s" % (ind, [i for i in st]))
        ind += 1
      greedy = False
  elif c == '@':
    if not greedy:
      multiprint = True
    else:
      stri = ""
      for i in stack:
        stri += chr(i if i < 1114112 else 0)
      if not preserve:
        stacks[currstack] = sdeque([])
      preserve = False
      print(stri, end='')
      greedy = False
  elif c == '#':
    convert = True
  elif c == '~':
    reverse = True
  elif c == '$':
    silent = True
  elif c == ',':
    if not greedy:
      if len(stack) > 1:
        first = stack.pop()
        second = stack.pop()
        stack.append(first)
        stack.append(second)
    else:
      stacks[currstack] = stack = sdeque(reversed(stack))
      greedy = False
  elif c == '&':
    greedy = True
  elif c == '.':
    stack.append(stack[-1])
  elif c == 'i':
    try:
      inp = input()
      if inp:
        for ch in inp:
          stack.append(ord(ch))
      else:
        stack.append(-1)
    except EOFError:
      stack.append(-1)
  elif c == 'l':
    stack.append(len(stack))
  elif c == 'd':
    val = getstackval(stack, preserve, reverse)
    preserve = False
    reverse = False
    for ch in str(val):
      stack.append(int(ch))
  elif c == 'r':
    stack.append(random.randrange(0, getstackval(stack, preserve, reverse)) if len(stack) > 0 else 0)
    preserve = False
    reverse = False
  elif c == 's':
    if len(stack):
      val = getstackval(stack, preserve, reverse)
      preserve = False
      reverse = False
      if not val:
        stack.append(0)
      else:
        stack.append(-1 if val < 0 else 1)
  elif c == 't':
    val = getstackval(stack, preserve, reverse)
    preserve = False
    reverse = False
    sci = '%.2E' % Decimal(val)
    stacks[currstack] += [ord(i) for i in sci]
  elif c == 'V':
    stacks.append(sdeque())
    currstack = len(stacks) - 1
  elif c == 'v':
    currstack = currstack + 1 if not reverse else currstack - 1
    if currstack >= len(stacks):
      currstack = 0
    if currstack < 0:
      currstack = len(stacks) - 1
  elif c == 'c':
    if len(stacks) > 1 and currstack:
      for i in stack:
        stacks[0].append(i)
      stacks.remove(stack)
      currstack = 0
  elif c == 'M':
    if len(stacks) > 1:
      val = getstackval(stack, preserve, reverse)
      preserve = False
      reverse = False
      nextstack = currstack + 1 if currstack < len(stacks)-1 else 0
      if val != None: stacks[nextstack].append(val)
  elif c == 'm':
    if len(stacks) > 1:
      val = getstackval(stack, preserve, reverse)
      preserve = False
      reverse = False
      nextstack = currstack - 1 if currstack > 0 else len(stacks) - 1
      if val != None: stacks[nextstack].append(val)
  elif c == 'R':
    if currstack:
      currstack = 0
  elif c == 'S':
    val = getstackval(stack, preserve, reverse)
    stack.append(math.sin(val))
  elif c == 'C':
    val = getstackval(stack, preserve, reverse)
    stack.append(math.cos(val))
  elif c == 'T':
    val = getstackval(stack, preserve, reverse)
    stack.append(math.tan(val))
  elif c == 'p':
    val = getstackval(stack, preserve, reverse)
    primes = prime_factors(val)
    for i in sorted(primes):
      stack.append(i)
  elif c == 'P':
    newstack = sdeque()
    for i in stack:
      if i >= 32 and i <= 126:
        newstack.append(i)
    stacks[currstack] = newstack
  elif c == 'u':
    newstack = sdeque()
    for i in stack:
      if i not in newstack:
        newstack.append(i)
    stacks[currstack] = newstack
  elif c == 'U':
    newstack = sdeque()
    val = getstackval(stack, preserve, reverse)
    preserve = False
    reverse = False
    for i in range(0, val):
      newstack.append(i+1)
    stacks[currstack] = newstack
  elif c == 'x':
    stack.append(min(stack))
  elif c == 'X':
    stack.append(max(stack))
  elif c == 'e':
    vals = getstackvals(stack, preserve, reverse)
    if int(vals[0]) != int(vals[1]):
      skip = True
      ifd = True
    preserve = False
    reverse = False
  elif c == 'E':
    if len(stacks) > 1:
      if stacks[currstack] != stacks[currstack+1]:
        skip = True
        ifd = True
      preserve = False
      reverse = False
  elif c == 'J':
    if greedy:
      newstack = sdeque()
      for i in stacks[currstack]:
        if chr(i) in "aeiouAEIOU":
          newstack.append(1)
        else:
          newstack.append(0)
      stacks[currstack] = newstack
    else:
      val = getstackval(stack, preserve, reverse)
      stack.append(1 if chr(val) in "aeiouAEIOU" else 0)
      preserve = False
      reverse = False
      greedy = False
  elif c == 'a':
    newstack = sdeque()
    for i in range(0, 26):
      newstack.append(ord(a) + i)
    stacks.append(newstack)
  elif c == 'A':
    x += 1
    iterator = sdeque(reversed(stack))
    for i in iterator:
      while stack[-1] != i:
        stack.rotate(1)
      before = len(stack)
      parse_char(code, stacks)
      diff = len(stack) - before
      stack.rotate(diff)
    stack.rotate(1)
  elif c == 'H':
    strng = ''.join([str(i) for i in stack])
    stacks[currstack] = sdeque([1 if strng == strng[::-1] else 0])
  elif c == 'n':
    newstack = sdeque()
    for i in stacks[currstack]:
      if i:
        newstack.append(0)
      else:
        newstack.append(1)
    stacks[currstack] = newstack
  elif c == 'N':
    newstack = sdeque()
    for i in stacks[currstack]:
      if i:
        newstack.append(1)
      else:
        newstack.append(0)
    stacks[currstack] = newstack
  elif c == '?':
    val = getstackval(stack, preserve, reverse)
    if int(val) <= 0:
      skip = True
      ifd = True
    preserve = False
    reverse = False
  elif c == '[':
    loop = True
    loopstart = x
  elif c == '{':
    fancyloop = True
    fliterator = sdeque(list(stack))
    flstart = x
  elif c == '+':
    if not greedy:
      vals = getstackvals(stack, preserve, reverse)
      stack.append(operate(operator.add, int(vals[1]), int(vals[0])))
      preserve = False
    else:
      if preserve:
        stack.append(sum(stack))
      else:
        stacks[currstack] = sdeque([sum(stack)])
      greedy = False
      preserve = False
  elif c == '/':
    if not greedy:
      vals = getstackvals(stack, preserve, reverse)
      stack.append(operate(operator.floordiv, int(vals[1]), int(vals[0])))
      preserve = False
    else:
      stack = sdeque([reduce(operator.floordiv, stack)])
      greedy = False
  elif c == '*':
    if not greedy:
      vals = getstackvals(stack, preserve, reverse)
      stack.append(operate(operator.mul, int(vals[1]), int(vals[0])))
      preserve = False
    else:
      stack = sdeque([reduce(operator.mul, stack)])
      greedy = False
  elif c == '-':
    if not greedy:
      vals = getstackvals(stack, preserve, reverse)
      stack.append(operate(operator.sub, int(vals[1]), int(vals[0])))
      preserve = False
    else:
      stack = sdeque([reduce(operator.sub, stack)])
      greedy = False
  elif c == '^':
    if not greedy:
      vals = getstackvals(stack, preserve, reverse)
      stack.append(operate(operator.pow, int(vals[1]), int(vals[0])))
      preserve = False
    else:
      stack = sdeque([reduce(operator.pow, stack)])
      greedy = False
  elif c == '%':
    if not greedy:
      vals = getstackvals(stack, preserve, reverse)
      stack.append(operate(operator.mod, int(vals[1]), int(vals[0])))
      preserve = False
    else:
      stack = sdeque([reduce(operator.mod, stack)])
      greedy = False
  elif isint(c):
    stack.append(int(c))
  elif c == '!':
    preserve = True
  elif c == '<':
    stack.rotate(-1)
  elif c == '>':
    stack.rotate(1)
  elif c == ';':
    end = True

def parse(code):
  #print('Parsing %s' % code)
  global string
  global end
  global multiprint
  global stacks
  global x
  if len(argv) > 3:
    stacks += parse_args(argv[3:])
  else:
    stacks.append(sdeque())
  while x < len(code):
    parse_char(code, stacks)
    x += 1

  if multiprint:
    count = int(printcount) if printcount else 1
    if not silent:
      print(''.join([chr(i) for i in stack[len(stack)-count:]]))
    if not preserve:
      stack = stack[:len(stack)-count]
    multiprint = False
    preserve = False
    silent = False
  if not end:
    print(stacks[currstack].pop() if len(stacks[currstack]) > 0 else '')

if len(argv) < 3:
  eprint('Invalid args!')
  eprint('Correct usage: %s <flag> <source> [source args]\n    <flag> : Either -f or -c. -f indicates that <source> is a file to be read from, while -c indicates that <source> is braingolf code to be run.' % argv[0])
  exit()

mode = argv[1]
source = argv[2]

if mode == '-f':
  #print('I should run the code in this file: %s' % source)
  filename = source
  if os.path.isfile(filename):
    with open(source) as f:
      source = f.read()
    parse(source)
  else:
    #print('File %s not found!' % filename)
    exit()

elif mode == '-c':
  #print('I should run this code: %s' % source)
  parse(source)
else:
  eprint('Invalid flag!')
  exit()
