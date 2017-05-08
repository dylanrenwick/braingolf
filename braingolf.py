from sys import argv;
from functools import reduce;
from collections import deque;
import os.path;
import operator;
import itertools;

class sdeque(deque):
  def __getitem__(self, index):
    if isinstance(index, slice):
      return type(self)(itertools.islice(self, index.start, index.stop, index.step))
    return deque.__getitem__(self, index)

def isint(s):
  try:
    int(s)
    return True
  except ValueError:
    return False

def operate(operator, first, second):
  return operator(first, second);

def getstackval(stack, preserve, rev):
  if preserve:
    return stack[0] if rev else stack[-1];
  else:
    return stack.popleft() if rev else stack.pop();

def getstackvals(stack, preserve, rev):
  if len(stack) > 1:
    if preserve:
      left = stack[0] if rev else stack[-1];
      right = stack[1] if rev else stack[-2];
    else:
      left = stack.popleft() if rev else stack.pop();
      right = stack.popleft() if rev else stack.pop();
  else:
    if preserve:
      left = right = stack[0];
    else:
      left = right = stack.pop();
  return (left, right);

def parse(code):
  print('Parsing %s' % code);
  stack = sdeque();
  if len(argv) > 3:
    stack += argv[3:];
  if len(stack) > 0:
    print('Input: %s' % [int(i) for i in stack if i]);
  end = False;
  preserve = False;
  convert = False;
  reverse = False;
  string = False;
  escape = False;
  multiprint = False;
  skip = False;
  ifd = False;
  silent = False;
  flip = True;
  loop = False;
  greedy = False;
  loopstart = 0;
  printcount = "";
  multichar = "";
  x = 0;
  while x < len(code):
    c = code[x];
    x += 1;

    for y in range(0,len(stack)):
      if stack[y] is not int:
        stack[y] = int(stack[y]);

    if skip:
      if c == '|' or c == ':':
        skip = False;
        ifd = False;
      continue;

    if loop:
      if c == ']':
        if stack[0] > 0:
          stack[0] -= 1;
          x = loopstart;
        else:
          loop = False;
          stack.popleft();
        continue;

    if multiprint:
      if isint(c):
        printcount += c;
        continue;
      else:
        count = int(printcount) if printcount else 1;
        if not silent:
          print(''.join([chr(i if i < 1114112 else 0) for i in stack[len(stack)-count:]]), end='');
        if not preserve:
          stack = stack[:len(stack)-count];
        multiprint = False;
        preserve = False;
        silent = False;
        printcount = "";

    if string:
      if c == '"' and not escape:
        string = False;
        stack += [ord(i) for i in multichar];
        multichar = "";
      elif c == '\\':
        if not escape:
          escape = True;
      else:
        multichar += c;
    elif convert:
      stack.append(ord(c));
      convert = False;
    elif c == ':' and not ifd:
      skip = True;
    elif c == '"':
      string = True;
    elif c == '_':
      if not greedy:
        if not silent:
          print(getstackval(stack, preserve, reverse), end='');
        preserve = False;
        silent = False;
      else:
        for i in stack:
          if not silent:
            print(getstackval(stack, preserve, reverse), end='');
    elif c == '=':
      print([int(i) for i in stack]);
    elif c == '@':
      if not greedy:
        multiprint = True;
      else:
        stri = "";
        for i in stack:
          stri += chr(i if i < 1114112 else 0);
          if not preserve:
            stack = sdeque([]);
          preserve = False;
        print(stri);
        greedy = False;
    elif c == '#':
      convert = True;
    elif c == '~':
      reverse = True;
    elif c == '$':
      silent = True;
    elif c == ',':
      if not greedy:
        if len(stack) > 1:
          first = stack.pop();
          second = stack.pop();
          stack.append(first);
          stack.append(second);
      else:
        stack = sdeque(reversed(stack));
        greedy = False;
    elif c == '&':
      greedy = True;
    elif c == '.':
      stack.append(stack[-1]);
    elif c == '{':
      try:
        inp = input();
        if inp:
          for ch in inp:
            stack.append(ord(ch));
        else:
          stack.append(-1);
      except EOFError:
        stack.append(-1);
    elif c == 'l':
      stack.append(len(stack));
    elif c == 'd':
      val = getstackval(stack, preserve, reverse);
      preserve = False;
      reverse = False;
      for ch in str(val):
        stack.append(int(ch));
    elif c == 's':
      if len(stack):
        val = getstackval(stack, preserve, reverse);
        preserve = False;
        reverse = False;
        if val:
          stack.append(1);
        else:
          stack.append(-1 if val < 0 else 0);
    elif c == '?':
      val = getstackval(stack, preserve, reverse);
      if int(val) <= 0:
        skip = True;
        ifd = True;
      preserve = False;
      reverse = False;
    elif c == '[':
      loop = True;
      loopstart = x;
    elif c == '+':
      if not greedy:
        vals = getstackvals(stack, preserve, reverse);
        stack.append(operate(operator.add, int(vals[1]), int(vals[0])));
        preserve = False;
      else:
        stack = sdeque([sum(stack)]);
        greedy = False;
    elif c == '/':
      if not greedy:
        vals = getstackvals(stack, preserve, reverse);
        stack.append(operate(operator.floordiv, int(vals[1]), int(vals[0])));
        preserve = False;
      else:
        stack = sdeque([reduce(operator.floordiv, stack)]);
        greedy = False;
    elif c == '*':
      if not greedy:
        vals = getstackvals(stack, preserve, reverse);
        stack.append(operate(operator.mul, int(vals[1]), int(vals[0])));
        preserve = False;
      else:
        stack = sdeque([reduce(operator.mul, stack)]);
        greedy = False;
    elif c == '-':
      if not greedy:
        vals = getstackvals(stack, preserve, reverse);
        stack.append(operate(operator.sub, int(vals[1]), int(vals[0])));
        preserve = False;
      else:
        stack = sdeque([reduce(operator.sub, stack)]);
        greedy = False;
    elif c == '^':
      if not greedy:
        vals = getstackvals(stack, preserve, reverse);
        stack.append(operate(operator.pow, int(vals[1]), int(vals[0])));
        preserve = False;
      else:
        stack = sdeque([reduce(operator.pow, stack)]);
        greedy = False;
    elif c == '%':
      if not greedy:
        vals = getstackvals(stack, preserve, reverse);
        stack.append(operate(operator.mod, int(vals[1]), int(vals[0])));
        preserve = False;
      else:
        stack = sdeque([reduce(operator.mod, stack)]);
        greedy = False;
    elif isint(c):
      stack.append(int(c));
    elif c == '!':
      preserve = True;
    elif c == '<':
      stack.rotate(-1);
    elif c == '>':
      stack.rotate(1);
    elif c == ';':
      end = True;

  if multiprint:
    count = int(printcount) if printcount else 1;
    if not silent:
      print(''.join([chr(i) for i in stack[len(stack)-count:]]));
    if not preserve:
      stack = stack[:-count];
    multiprint = False;
    preserve = False;
    silent = False;
  if not end:
    print(stack.pop() if len(stack) > 0 else '');

if len(argv) < 3:
  print('Invalid args!');
  print('Correct usage: %s <flag> <source> [source args]\n    <flag> : Either -f or -c. -f indicates that <source> is a file to be read from, while -c indicates that <source> is braingolf code to be run.' % argv[0]);
  exit();

mode = argv[1];
source = argv[2];

if mode == '-f':
  print('I should run the code in this file: %s' % source);
  filename = source;
  if os.path.isfile(filename):
    with open(source) as f:
      source = f.read();
    parse(source);
  else:
    print('File %s not found!' % filename);
    exit();

elif mode == '-c':
  print('I should run this code: %s' % source);
  parse(source);
else:
  print('Invalid flag!');
  exit();
