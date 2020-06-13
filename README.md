
autorespond
===========

**Terminal Command Auto-Response**

<p/>
<img src="https://nodei.co/npm/autorespond.png?downloads=true&stars=true" alt=""/>

<p/>
<img src="https://david-dm.org/rse/autorespond.png" alt=""/>

Abstract
--------

`autorespond`(1) is a small utility for executing a command in an
interactive terminal session and automatically sending a response input
to the command in case of an interaction timeout.

It is intended to be used in training scenarios where some interactive
commands (like a shell) have to be executed in a scripted session but
they should be automatically terminated (like sending `exit\n`) in case
the trainee does not manually interact with it. This allows the same
scripting sessions to be executed in batch and interactively.

Installation
------------

```
$ npm install -g autorespond
```

Usage
-----

The [Unix manual page](https://github.com/rse/autorespond/blob/master/autorespond.md) contains
detailed usage information.

Examples
--------

```
# interrupt after 10 seconds after the last user interaction
$ autorespond -T 10 -r '\k{ctrl+c}\n' tail -f logfile

# terminate after 30 seconds in case of no user interaction at all
$ autorespond -t 30 -r 'exit\n' bash
```

License
-------

Copyright &copy; 2020 Dr. Ralf S. Engelschall (http://engelschall.com/)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

