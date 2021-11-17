import { Grammar, r, randomGenerate } from "./utils/gen-grammar";

export let grammar1: Grammar = {
    rules: {
        F: [
            {
                part: r`${"F"}[+${"F"}]${"F"}[-${"F"}]${"F"}`,
                weight: (t) => 1 / (t + 1),
            },
            { part: r`F`, weight: (t) => (t ? 0.5 : 0) },
        ],
    },
    starting: "F",
};

export let grammar2: Grammar = {
    rules: {
        X: [
            {
                part: r`${"F"}[+${"X"}]${"F"}[-${"X"}]+${"X"}`,
                weight: (t) => 1 / (t + 1),
            },
            { part: r``, weight: (t) => (t ? 0.3 : 0) },
        ],
        F: [
            { part: r`${"F"}${"F"}`, weight: (t) => 1 / (t + 1) },
            { part: r`F`, weight: (t) => (t ? 0.3 : 0) },
        ],
    },
    starting: "X",
};

export let grammar3: Grammar = {
    rules: {
        F: [
            {
                part: r`${"F"}[+${"F"}]${"F"}[-${"F"}][${"F"}]`,
                weight: (t) => (t < 2 ? 1 : 0),
            },
            { part: r`F`, weight: (t) => (t < 2 ? 0 : 1) },
        ],
    },
    starting: "F",
};

export let grammar4: Grammar = {
    rules: {
        X: [
            {
                part: r`${"F"}[+${"X"}][-${"X"}]${"F"}${"X"}`,
                weight: (t) => (t < 3 ? 1 : 0),
            },
            { part: r``, weight: (t) => (t < 3 ? 0 : 1) },
        ],
        F: [
            { part: r`${"F"}${"F"}`, weight: (t) => (t < 3 ? 1 : 0) },
            { part: r`F`, weight: (t) => (t < 3 ? 0 : 1) },
        ],
    },
    starting: "X",
};

export let grammar5: Grammar = {
    rules: {
        X: [
            {
                part: r`${"F"}-[[${"X"}]+${"X"}]+${"F"}[+${"F"}${"X"}]-${"X"}`,
                weight: (t) => (t < 2 ? 1 : 0),
            },
            { part: r``, weight: (t) => (t < 2 ? 0 : 1) },
        ],
        F: [
            { part: r`${"F"}${"F"}`, weight: (t) => (t < 3 ? 1 : 0) },
            { part: r`F`, weight: (t) => (t < 3 ? 0 : 1) },
        ],
    },
    starting: "X",
};

export let grammar6: Grammar = {
    rules: {
        F: [
            {
                // F[+F]F[-F]F
                // 5
                part: r`${"F"}[+${"F"}]${"F"}[-F]${"F"}`,
                weight: (t) => +(t < 3),
            },
            { part: r`F`, weight: (t) => +(t >= 3) },
        ],
    },
    starting: "F",
};

export let grammar7: Grammar = {
    rules: {
        F: [
            {
                // FF-[-F+F+F]+[+F-F-F]
                // 4
                part: r`${"F"}${"F"}-[-${"F"}+${"F"}+${"F"}]+[+${"F"}-${"F"}-${"F"}]`,
                weight: (t) => +(t < 2),
            },
            { part: r`F`, weight: (t) => +(t >= 2) },
        ],
    },
    starting: "F",
};

export let grammar8: Grammar = {
    rules: {
        F: [
            {
                // F[&+F]F[-/F][-/F][&F]
                // 3
                part: r`${"F"}[&+${"F"}]${"F"}[-/${"F"}][-/${"F"}][&${"F"}]`,
                weight: (t) => +(t < 3),
            },
            { part: r`F`, weight: (t) => +(t >= 3) },
        ],
    },
    starting: "F",
};

export let grammar9: Grammar = {
    rules: {
        F: [
            {
                // F[-&\F][\++&F]||F[--&/F][+&F]
                // 3
                part: r`${"F"}[-&\${"F"}][\++&${"F"}]||F[--&/${"F"}][+&${"F"}]`,
                weight: (t) => +(t < 3),
            },
            { part: r`F`, weight: (t) => +(t >= 3) },
        ],
    },
    starting: "F",
};

export default (grammar: Grammar) => randomGenerate(grammar).join("");

// export default randomGenerate(grammar5).join("");
