function processSimas(html: string): string {
    return html.replace(/<\?simas\b([\s\S]*?)\?>/g, (_, code: string) => {
        let output = "";

        // const echocRegex = /\bechoc\s+(["'])(.*?)\1\s*;?/gs;
        const echocRegex = /\bechoc\s+(["'])([\s\S]*?)\1\s*;?/g;

        for (const match of code.matchAll(echocRegex)) {
            output += match[2];
        }

        return output;
    });
}

module.exports = {processSimas};
