/**
 * Citation generators. Each takes an enriched thesis and returns a string.
 */

function authors(t) {
  return t.author;
}
function year(t) {
  return new Date(t.publicationDate).getFullYear();
}
function inst(t) {
  return t.institutionName;
}
function dept(t) {
  return t.departmentName;
}

export function citeAPA(t) {
  return `${authors(t)} (${year(t)}). ${t.title}. ${inst(t)}, ${dept(t)}.`;
}
export function citeMLA(t) {
  return `${authors(t)}. "${t.title}." ${inst(t)}, ${year(t)}.`;
}
export function citeChicago(t) {
  return `${authors(t)}. "${t.title}." ${inst(t)}, ${year(t)}.`;
}
export function citeHarvard(t) {
  return `${authors(t)} ${year(t)}, '${t.title}', ${inst(t)}, ${dept(t)}.`;
}
export function citeBibTeX(t) {
  const key = `${t.author.split(" ").slice(-1)[0]}${year(t)}`.toLowerCase();
  return `@phdthesis{${key},
  title = {${t.title}},
  author = {${t.author}},
  year = {${year(t)}},
  school = {${inst(t)}},
  department = {${dept(t)}},
  note = {${t.keywords.join(", ")}}
}`;
}

export const CITATION_STYLES = [
  { id: "apa", label: "APA", generate: citeAPA },
  { id: "mla", label: "MLA", generate: citeMLA },
  { id: "chicago", label: "Chicago", generate: citeChicago },
  { id: "harvard", label: "Harvard", generate: citeHarvard },
  { id: "bibtex", label: "BibTeX", generate: citeBibTeX },
];

/** Convert a Google Drive /view URL to an embeddable /preview URL. */
export function drivePreviewUrl(url) {
  if (!url) return null;
  const m = url.match(/\/file\/d\/([^/]+)/);
  if (m) return `https://drive.google.com/file/d/${m[1]}/preview`;
  if (url.includes("/preview")) return url;
  return null;
}
