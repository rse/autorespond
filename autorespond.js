#!/usr/bin/env node
/*!
**  AutoRespond -- Terminal Command Auto-Responder
**  Copyright (c) 2020 Dr. Ralf S. Engelschall <rse@engelschall.com>
**
**  Permission is hereby granted, free of charge, to any person obtaining
**  a copy of this software and associated documentation files (the
**  "Software"), to deal in the Software without restriction, including
**  without limitation the rights to use, copy, modify, merge, publish,
**  distribute, sublicense, and/or sell copies of the Software, and to
**  permit persons to whom the Software is furnished to do so, subject to
**  the following conditions:
**
**  The above copyright notice and this permission notice shall be included
**  in all copies or substantial portions of the Software.
**
**  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
**  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
**  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
**  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
**  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
**  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
**  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*  external requirements  */
const yargs = require("yargs")
const chalk = require("chalk")
const pty   = require("node-pty")

/*  internal requirements  */
const my    = require("./package.json")

/*  establish asynchronous context  */
;(async () => {
    /*  command-line option parsing  */
    const argv = yargs()
        /* eslint indent: off */
        .parserConfiguration({
            "duplicate-arguments-array": true,
            "set-placeholder-key":       true,
            "flatten-duplicate-arrays":  true,
            "camel-case-expansion":      true,
            "strip-aliased":             false,
            "dot-notation":              false,
            "halt-at-non-option":        true
        })
        .usage(
            "Usage: autorespond " +
            "[-h|--help] " +
            "[-V|--version] " +
            "[-t|--timeout-soft <seconds>] " +
            "[-T|--timeout-hard <seconds>] " +
            "[-r|--response <input>] " +
            "<command> " +
            "[<argument> ...]"
        )
        .option("h", {
            describe: "show program help information",
            alias:    "help", type: "boolean", default: false
        })
        .option("V", {
            describe: "show program version information",
            alias:    "version", type: "boolean", default: false
        })
        .option("t", {
            describe: "time to wait before injecting the response on stdin (in case no interaction happened on stdin)",
            alias:    "timeout-soft", type: "number", nargs: 1, default: 0
        })
        .option("T", {
            describe: "time to wait before injecting the response on stdin (after last interaction happened on stdin)",
            alias:    "timeout-hard", type: "number", nargs: 1, default: 0
        })
        .option("r", {
            describe: "response message to inject on stdin",
            alias:    "response", type: "string", nargs: 1, default: ""
        })
        .version(false)
        .strict(true)
        .showHelpOnFail(true)
        .demand(0)
        .parse(process.argv.slice(2))

    /*  short-circuit processing of "-V" command-line option  */
    if (argv.version) {
        process.stderr.write(`${my.name} ${my.version} <${my.homepage}>\n`)
        process.stderr.write(`${my.description}\n`)
        process.stderr.write(`Copyright (c) 2020 ${my.author.name} <${my.author.url}>\n`)
        process.stderr.write(`Licensed under ${my.license} <http://spdx.org/licenses/${my.license}.html>\n`)
        process.exit(0)
    }

    if (!process.stdin.isTTY)
        throw new Error("stdin has to be connected to a terminal")
    if (!process.stdout.isTTY)
        throw new Error("stdout has to be connected to a terminal")

    /*  sanity check command-line arguments  */
    if (argv._.length < 1)
        throw new Error("invalid number of arguments (missing command to execute)")
    const cmd   = argv._[0]
    const args  = argv._.slice(1)

    /*  helper function for expanding a message  */
    const expandMessage = (msg) => {
        /*  replace "\o{...}"  */
        msg = msg.replace(/\\o\{([0-7]+)\}/g, (_, num) => {
            return parseInt(num, 8)
        })

        /*  replace "\d{...}"  */
        msg = msg.replace(/\\d\{([0-9a-fA-F]+)\}/g, (_, num) => {
            return parseInt(num, 10)
        })

        /*  replace "\x{...}"  */
        msg = msg.replace(/\\x\{([0-9a-fA-F]+)\}/g, (_, num) => {
            return parseInt(num, 16)
        })

        /*  replace "\k{...}"  */
        msg = msg.replace(/\\k\{(.+?)\}/g, (_, keystroke) => {
            let m
            if ((m = keystroke.match(/^ctrl\+([a-z])$/)) !== null)
                return String.fromCharCode(1 + (m[1].charCodeAt(0) - "a".charCodeAt(0)))
            else if (keystroke === "return" || keystroke === "cr")
                return 0x0d
            else if (keystroke === "linefeed" || keystroke === "lf")
                return 0x0a
            else if (keystroke === "backspace" || keystroke === "bs")
                return 0x08
            else if (keystroke === "delete" || keystroke === "del")
                return 0x7f
            else
                throw new Error(`invalid keystroke "${keystroke}"`)
        })

        /*  replace usual escape sequence  */
        msg = msg.replace(/\\r/g, "\r")
        msg = msg.replace(/\\n/g, "\n")
        msg = msg.replace(/\\t/g, "\t")
        msg = msg.replace(/\\v/g, "\v")

        return msg
    }

    /*  initially determine terminate size  */
    let size = process.stdout.getWindowSize()

    /*  fork off child-process, connected to a pseudo-terminal  */
    const child = pty.spawn(cmd, args, {
        cols:              size[0],
        rows:              size[1],
        uid:               -1,
        gid:               -1,
        env:               process.env,
        name:              process.env.TERM,
        cwd:               process.cwd(),
        encoding:          "utf8",
        handleFlowControl: true
    })

    /*  handle terminal resizing  */
    process.stdout.on("resize", () => {
        size = process.stdout.getWindowSize()
        child.resize(size[0], size[1])
    })

    /*  response handler  */
    let sentResponse = false
    const sendResponse = () => {
        /*  send response  */
        if (!sentResponse) {
            const data = expandMessage(argv.response)
            child.write(data)
            sentResponse = true
        }
    }

    /*  initialize timers  */
    let timerSoft = argv.timeoutSoft > 0 ? setTimeout(sendResponse, argv.timeoutSoft * 1000) : null
    let timerHard = argv.timeoutHard > 0 ? setTimeout(sendResponse, argv.timeoutHard * 1000) : null

    /*  send/receive data to/from child-process  */
    process.stdin.setRawMode(true)
    process.stdin.on("data", (data) => {
        /*  clear soft timer  */
        if (timerSoft !== null) {
            clearTimeout(timerSoft)
            timerSoft = null
        }

        /*  reset hard timer  */
        if (timerHard !== null) {
            clearTimeout(timerHard)
            timerHard = setTimeout(sendResponse, argv.timeoutHard * 1000)
        }

        /*  send data from stdin to child  */
        child.write(data)
    })
    process.stdin.on("end", () => {
        /*  close connection to child  */
        child.destroy()
    })
    child.on("data", (data) => {
        /*  receive data from child for stdout  */
        process.stdout.write(data)
    })

    /*  handle termination of child process  */
    process.on("SIGINT", () => {
        child.kill("SIGINT")
    })
    process.on("SIGTERM", () => {
        child.kill("SIGTERM")
    })
    child.on("exit", (code, signal) => {
        if (timerSoft !== null)
            clearTimeout(timerSoft)
        if (timerHard !== null)
            clearTimeout(timerHard)
        process.exit(signal > 0 ? 128 + signal : code)
    })
})().catch((err) => {
    /*  handle fatal error  */
    process.stderr.write(`autorespond: ${chalk.bold.red("ERROR:")} ${err}\n`)
    process.exit(1)
})

