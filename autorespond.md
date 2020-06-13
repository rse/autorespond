
# autorespond(1) -- Terminal Command Auto-Responder

## SYNOPSIS

`autorespond`
\[`-h`|`--help`\]
\[`-V`|`--version`\]
\[`-t`|`--timeout-soft` *seconds*\]
\[`-T`|`--timeout-hard` *seconds*\]
\[`-r`|`--response` *input*\]
*command*
\[*argument* ...\]

## DESCRIPTION

`autorespond`(1) is a small utility for executing a command in an
interactive terminal session and automatically sending a response input
to the command in case of an interaction timeout.

It is intended to be used in training scenarios where some interactive
commands (like a shell) have to be executed in a scripted session but
they should be automatically terminated (like sending `exit\n`) in case
the trainee does not manually interact with it. This allows the same
scripting sessions to be executed in batch and interactively.

## OPTIONS

The following command-line options and arguments exist:

- \[`-h`|`--help`\]:
  Show usage information of `autorespond`(1).

- \[`-V`|`--version`\]:
  Show version information of `autorespond`(1).

- \[`-t`|`--timeout-soft` *seconds*\]:
  Time to wait in seconds before injecting the response on `stdin`, in
  case no interaction happened on `stdin` by the user.

- \[`-T`|`--timeout-hard` *seconds*\]:
  Time to wait in seconds before injecting the response on `stdin`,
  after last interaction happened on `stdin` by the user.

- \[`-r`|`--response` *input*\]:
  Response message to inject on `stdin` instead of the user.
  In the *input* data, the following constructs are expanded:

    - `\o{`*num*`}`: create character by octal character code like `\o{002}`.
    - `\d{`*num*`}`: create character by decimal character code like `\d{001}`.
    - `\x{`*num*`}`: create character by hexadecimal character code like `\x{7f}`.
    - `\k{`*keystroke*`}`: create character by logical keystroke. The 
      *keystroke* argument can be either `ctrl+`*X* where *X* is `a` to `z`
      or it can be the special keys `return`/`cr`, `linefeed`/`lf`,
      `backspace`/`bs` and `delete`/`del`.
    - `\r`, `\n`, `\t`, `\v`: create linefeed, newline, tab and vertical tab
      characters through short-hand escape sequences.

- *command*:
  The shell command to execute.

- \[*argument* ...\]:
  Zero or more arguments passed to the command.

## EXAMPLES

```
$ autorespond -T 10 -r '\k{ctrl+c}\n' tail -f logfile
$ autorespond -t 30 -r 'exit\n' bash
```

## HISTORY

The `autorespond`(1) utility was developed in June 2020 to
allow batch execution of an otherwise interactive training session.

## AUTHOR

Dr. Ralf S. Engelschall <rse@engelschall.com>
