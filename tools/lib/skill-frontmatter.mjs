// The repository's intentionally small YAML format: unique, top-level fields
// with single-line strings. This is not a general YAML parser. Quote descriptions
// containing YAML punctuation; double-quoted values use JSON-compatible escapes.
export function frontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!m) throw new Error('YAML frontmatter missing or unterminated');
  const fields = Object.create(null);
  for (const [index, line] of m[1].split(/\r?\n/).entries()) {
    if (!line.trim() || /^\s*#/.test(line)) continue;
    const fail = (reason) => { throw new Error(`frontmatter line ${index + 2}: ${reason}`); };
    const kv = line.match(/^([a-z_-]+):[ \t]*(.*)$/i);
    if (!kv) fail('expected a top-level field with a single-line string');
    const [, key, raw] = kv;
    if (Object.hasOwn(fields, key)) fail('duplicate field');
    const scalar = raw.trim();
    let value;
    if (scalar.startsWith('"')) {
      try { value = JSON.parse(scalar); }
      catch { fail('invalid double-quoted string; use JSON-compatible escapes'); }
    } else if (scalar.startsWith("'")) {
      if (!/^'(?:[^']|'')*'$/.test(scalar)) fail('invalid single-quoted string');
      value = scalar.slice(1, -1).replace(/''/g, "'");
    } else {
      if (!scalar || /:\s|:$|\s#/.test(scalar)
          || /^[\[\]{}#&*!|>@`%?,]/.test(scalar) || /^[-?:](?:\s|$)/.test(scalar)
          || /^(?:null|true|false|~|[-+]?\d[\d.eE+-]*)$/i.test(scalar)) {
        fail('quote this value as a single-line string');
      }
      value = scalar;
    }
    if (typeof value !== 'string') fail('value must be a string');
    fields[key] = value;
  }
  return { fields, body: text.slice(m[0].length) };
}
