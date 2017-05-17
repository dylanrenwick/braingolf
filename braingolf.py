from sys import argv;
from functools import reduce;
from collections import deque;
import os.path;
import operator;
import itertools;
import random;
import math;

class sdeque(deque):
  def __getitem__(self, index):
    if isinstance(index, slice):
      return type(self)(itertools.islice(self, index.start, index.stop, index.step))
    return deque.__getitem__(self, index)

stacks = [];
currstack = 0;
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
master = False;
loopstart = 0;
printcount = "";
multichar = "";

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

def getstack():
  global stacks;
  return stacks[currstack];

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

def get_primes(n):
  prms = [2];
  num = 3;
  while len(prms) < n:
    if all(num%i!=0 for i in range(2,int(math.sqrt(num))+1)):
      prms.append(num);
    num += 2;
  return prms;

def get_primes_limit(n):
  prms = [2];
  for num in range(3,n,2):
    if all(num%i!=0 for i in range(2,int(math.sqrt(num))+1)):
      prms.append(num);
  return prms;

def parse(code):
  print('Parsing %s' % code);
  firststack = sdeque();
  if len(argv) > 3:
    firststack += argv[3:];
  if len(firststack) > 0:
    print('Input: %s' % [int(i) for i in firststack if i]);
  x = 0;
  global stacks;
  stacks.append(firststack);
  global currstack;
  global end;
  global preserve;
  global convert;
  global reverse;
  global string;
  global escape;
  global multiprint;
  global skip;
  global ifd;
  global silent;
  global flip;
  global loop;
  global greedy;
  global master;
  global loopstart;
  global printcount;
  global multichar;
  while x < len(code):
    stack = getstack();
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
          stacks[currstack] = stack[:len(stack)-count] if count < len(stack) else sdeque();
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
      stacks[0 if master else currstack].append(ord(c));
      convert = False;
    elif c == ':' and not ifd:
      skip = True;
    elif c == '"':
      string = True;
    elif c == '_':
      if not greedy:
        val = getstackval(stack, preserve, reverse);
        if not silent:
          print(val, end='');
        preserve = False;
        silent = False;
      else:
        for i in stack:
          if not silent:
            print(getstackval(stack, preserve, reverse), end='');
        preserve = False;
        silent = False;
    elif c == '=':
      if not greedy:
        print([int(i) for i in stack]);
      else:
        ind = 0;
        for st in stacks:
          print("%s: %s" % (ind, [int(i) for i in st]));
          ind += 1;
        greedy = False;
    elif c == '@':
      if not greedy:
        multiprint = True;
      else:
        stri = "";
        for i in stack:
          stri += chr(i if i < 1114112 else 0);
        if not preserve:
          stacks[currstack] = sdeque([]);
        preserve = False;
        print(stri, end='');
        greedy = False;
        master = False;
    elif c == '#':
      convert = True;
    elif c == '~':
      reverse = True;
    elif c == '$':
      silent = True;
    elif c == '£':
      master = True;
    elif c == ',':
      if not greedy:
        if len(stack) > 1:
          first = stack.pop();
          second = stack.pop();
          stacks[0 if master else currstack].append(first);
          stacks[0 if master else currstack].append(second);
      else:
        stacks[0 if master else currstack] = stack = sdeque(reversed(stack));
        greedy = False;
      master = False;
    elif c == '&':
      greedy = True;
    elif c == '.':
      stacks[0 if master else currstack].append(stack[-1]);
      master = False;
    elif c == '{':
      try:
        inp = input();
        if inp:
          for ch in inp:
            stacks[0 if master else currstack].append(ord(ch));
        else:
          stacks[0 if master else currstack].append(-1);
      except EOFError:
        stacks[0 if master else currstack].append(-1);
      master = False;
    elif c == 'l':
      stacks[0 if master else currstack].append(len(stack));
      master = False;
    elif c == 'd':
      val = getstackval(stack, preserve, reverse);
      preserve = False;
      reverse = False;
      for ch in str(val):
        stacks[0 if master else currstack].append(int(ch));
      master = False;
    elif c == 'r':
      stacks[0 if master else currstack].append(random.randrange(0, getstackval(stack, preserve, reverse)) if len(stack) > 0 else 0);
      preserve = False;
      reverse = False;
      master = False;
    elif c == 's':
      if len(stack):
        val = getstackval(stack, preserve, reverse);
        preserve = False;
        reverse = False;
        if not val:
          stacks[0 if master else currstack].append(0);
        else:
          stacks[0 if master else currstack].append(-1 if val < 0 else 1);
        master = False;
    elif c == 'V':
      stacks.append(sdeque());
      currstack = len(stacks) - 1;
    elif c == 'v':
      currstack = currstack + 1 if not reverse else currstack - 1;
      if currstack >= len(stacks):
        currstack = 0;
      if currstack < 0:
        currstack = len(stacks) - 1;
      reverse = False;
    elif c == 'c':
      if len(stacks) > 1 and currstack:
        for i in stack:
          stacks[0].append(i);
        stacks.remove(stack);
        currstack = 0;
    elif c == 'C':
      val = getstackval(stack, True, reverse);
      while val != 1:
        if val % 2:
          val = (3 * val) + 1;
        else:
          val /= 2;
        stacks[0 if master else currstack].append(val);
      reverse = False;
      master = False;
    elif c == 'M':
      if len(stacks) > 1:
        val = getstackval(stack, preserve, reverse);
        preserve = False;
        reverse = False;
        nextstack = currstack + 1 if currstack < len(stacks)-1 else 0;
        stacks[1 if master else nextstack].append(val);
        master = False;
    elif c == 'm':
      if len(stacks) > 1:
        val = getstackval(stack, preserve, reverse);
        preserve = False;
        reverse = False;
        nextstack = currstack - 1 if currstack > 0 else len(stacks) - 1;
        stacks[len(stacks) - 1 if master else nextstack].append(val);
        master = False;
    elif c == 'R':
      if currstack:
        currstack = 0;
    elif c == 'p':
      val = getstackval(stack, preserve, reverse);
      primes = prime_factors(val);
      for i in sorted(primes):
        stacks[0 if master else currstack].append(i);
      preserve = False;
      reverse = False;
      master = False;
    elif c == 'P':
      val = str(getstackval(stack, preserve, reverse));
      stacks[0 if master else currstack].append(1 if val == val[::-1] else 0);
      preserve = False;
      reverse = False;
      master = False;
    elif c == 't':
      val = getstackval(stack, preserve, reverse);
      primes = get_primes(val);
      for i in primes:
        stacks[0 if master else currstack].append(i);
      preserve = False;
      reverse = False;
      master = False;
    elif c == 'T':
      val = getstackval(stack, preserve, reverse);
      primes = get_primes_limit(val);
      for i in primes:
        stacks[0 if master else currstack].append(i);
      preserve = False;
      reverse = False;
      master = False;
    elif c == 'U':
      val = getstackval(stack, preserve, reverse);
      for i in range(1, val):
        stacks.insert(i, sdeque([i]));
      preserve = False;
      reverse = False;
    elif c == 'u':
      newstack = sdeque();
      for i in stack:
        if i not in newstack:
          newstack.append(i);
      stacks[currstack] = newstack;
    elif c == 'x':
      stacks[0 if master else currstack].append(min(stack));
      master = False;
    elif c == 'X':
      stacks[0 if master else currstack].append(max(stack));
      master = False;
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
        stacks[0 if master else currstack].append(operate(operator.add, int(vals[1]), int(vals[0])));
        preserve = False;
      else:
        stacks[0 if master else currstack] = sdeque([sum(stack)]);
        greedy = False;
      master = False;
    elif c == '/':
      if not greedy:
        vals = getstackvals(stack, preserve, reverse);
        stacks[0 if master else currstack].append(operate(operator.floordiv, int(vals[1]), int(vals[0])));
        preserve = False;
      else:
        stacks[0 if master else currstack] = sdeque([reduce(operator.floordiv, stack)]);
        greedy = False;
      master = False;
    elif c == '*':
      if not greedy:
        vals = getstackvals(stack, preserve, reverse);
        stacks[0 if master else currstack].append(operate(operator.mul, int(vals[1]), int(vals[0])));
        preserve = False;
      else:
        stacks[0 if master else currstack] = sdeque([reduce(operator.mul, stack)]);
        greedy = False;
      master = False;
    elif c == '-':
      if not greedy:
        vals = getstackvals(stack, preserve, reverse);
        stacks[0 if master else currstack].append(operate(operator.sub, int(vals[1]), int(vals[0])));
        preserve = False;
      else:
        stacks[0 if master else currstack] = sdeque([reduce(operator.sub, stack)]);
        greedy = False;
      master = False;
    elif c == '^':
      if not greedy:
        vals = getstackvals(stack, preserve, reverse);
        stacks[0 if master else currstack].append(operate(operator.pow, int(vals[1]), int(vals[0])));
        preserve = False;
      else:
        stacks[0 if master else currstack] = sdeque([reduce(operator.pow, stack)]);
        greedy = False;
      master = False;
    elif c == '%':
      if not greedy:
        vals = getstackvals(stack, preserve, reverse);
        stacks[0 if master else currstack].append(operate(operator.mod, int(vals[1]), int(vals[0])));
        preserve = False;
      else:
        stacks[0 if master else currstack] = sdeque([reduce(operator.mod, stack)]);
        greedy = False;
      master = False;
    elif isint(c):
      stacks[0 if master else currstack].append(int(c));
      master = False;
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
      stack = stack[:len(stack)-count];
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
