export function addSeconds(date: Date, seconds: number): Date {
    const newDate = new Date(date);
    newDate.setSeconds(newDate.getSeconds() + seconds);
    return newDate;
}

type DateTarget = "year" | "month" | "day" | "hour" | "minute" | "second";

const RULES: Record<string, { target: DateTarget, size: number }> = {
    "Y": {
        target: "year",
        size: 4
    },
    "M": {
        target: "month",
        size: 2
    },
    "D": {
        target: "day",
        size: 2
    },
    "h": {
        target: "hour",
        size: 2
    },
    "m": {
        target: "minute",
        size: 2
    },
    "s": {
        target: "second",
        size: 2
    }
}

/**
 * 
 * @param txt Raw date text
 * @param pattern Pattern to recognize date
 * 
 * Allowed patterns:
 *   - %Y - year
 *   - %M - month
 *   - %D - day
 *   - %h - hour
 *   - %m - minute
 *   - %s - seconds
 */
export function parseDate(txt: string, pattern: string): Date {
    let txtIdx = 0;
    let readPattern = false;

    const result: Record<DateTarget, number> = {
        year: null,
        month: null,
        day: null,
        hour: null,
        minute: null,
        second: null
    };

    for (const char of pattern) {
        if (readPattern) {
            readPattern = false;

            const rule = RULES[char];
            if (rule == null) {
                throw new Error(`Invalid pattern: ${char}`);
            } else if (txtIdx + rule.size > txt.length) {
                throw new Error("Not enough characters");
            } else if (result[rule.target] != null) {
                throw new Error(`Repeated pattern: ${char}`);
            }
            const raw = txt.slice(txtIdx, txtIdx + rule.size);
            txtIdx += rule.size;
            const value = parseInt(raw, 10);
            result[rule.target] = value;
            continue;
        }
        if (char === "%") {
            readPattern = true;
            continue;
        }
        if (char !== txt[txtIdx]) {
            throw new Error(`Invalid char: ${txt[txtIdx]}. Excepted: ${char}`);
        }
        txtIdx += 1;
    }

    return new Date(result.year || 1970, (result.month - 1) || 0, result.day || 1, result.hour || 0, result.minute || 0, result.second || 0);
}