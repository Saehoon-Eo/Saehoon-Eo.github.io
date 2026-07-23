/* ==========================================================================
   Saehoon Eo — site.js
   No frameworks, no build step. Three jobs:
     1) Highlight the active nav tab.
     2) Parse publications.bib and render the publication list.
     3) Render Talks / Teaching / Activities from small JSON data files.
   ========================================================================== */

/* The author's own name — used to bold it in author lists.
   Match is by "Lastname" (case-insensitive). */
var MY_LASTNAME = "Eo";

/* ----------------------------------------------------------------------
   1. Active nav tab
   ---------------------------------------------------------------------- */
(function highlightNav() {
  var page = document.body.getAttribute("data-page");
  if (!page) return;
  var link = document.querySelector('.nav ul a[data-nav="' + page + '"]');
  if (link) link.classList.add("active");
})();

/* ----------------------------------------------------------------------
   Helpers
   ---------------------------------------------------------------------- */
function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* Strip a few common LaTeX-isms so titles/authors read cleanly in HTML.
   (Math between $...$ is left intact for MathJax.) */
function delatex(s) {
  if (s == null) return "";
  s = String(s);
  // remove protective braces that are not part of math
  s = s.replace(/[{}]/g, "");
  // common accents / dashes
  s = s.replace(/\\'/g, "").replace(/\\"/g, "").replace(/\\`/g, "")
       .replace(/\\~/g, "").replace(/\\\^/g, "").replace(/\\=/g, "");
  s = s.replace(/---/g, "—").replace(/--/g, "–");
  s = s.replace(/~/g, " ");
  return s.trim();
}

function showError(el, msg) {
  el.innerHTML = '<div class="js-error">' + esc(msg) + "</div>";
}

/* ----------------------------------------------------------------------
   2. BibTeX parsing
   ---------------------------------------------------------------------- */
function parseBibtex(text) {
  var entries = [];
  var i = 0, n = text.length;
  while (i < n) {
    // find next @
    var at = text.indexOf("@", i);
    if (at === -1) break;
    // read entry type
    var braceOpen = text.indexOf("{", at);
    if (braceOpen === -1) break;
    var type = text.slice(at + 1, braceOpen).trim().toLowerCase();
    if (type === "comment" || type === "string" || type === "preamble") {
      i = braceOpen + 1;
      continue;
    }
    // find matching closing brace (balanced)
    var depth = 0, j = braceOpen, end = -1;
    for (; j < n; j++) {
      var c = text[j];
      if (c === "{") depth++;
      else if (c === "}") { depth--; if (depth === 0) { end = j; break; } }
    }
    if (end === -1) break;
    var body = text.slice(braceOpen + 1, end);
    entries.push(parseEntryBody(type, body));
    i = end + 1;
  }
  return entries;
}

function parseEntryBody(type, body) {
  // first comma separates the citation key from the fields
  var firstComma = body.indexOf(",");
  var key = (firstComma === -1 ? body : body.slice(0, firstComma)).trim();
  var rest = firstComma === -1 ? "" : body.slice(firstComma + 1);
  var fields = { _type: type, _key: key };

  var i = 0, n = rest.length;
  while (i < n) {
    // field name
    var eq = rest.indexOf("=", i);
    if (eq === -1) break;
    var name = rest.slice(i, eq).trim().toLowerCase().replace(/^,+/, "").trim();
    var k = eq + 1;
    // skip whitespace
    while (k < n && /\s/.test(rest[k])) k++;
    var value = "", ch = rest[k];
    if (ch === "{") {
      var depth = 0, start = k;
      for (; k < n; k++) {
        if (rest[k] === "{") depth++;
        else if (rest[k] === "}") { depth--; if (depth === 0) { k++; break; } }
      }
      value = rest.slice(start + 1, k - 1);
    } else if (ch === '"') {
      var s2 = k + 1; k = s2;
      while (k < n && rest[k] !== '"') k++;
      value = rest.slice(s2, k); k++;
    } else {
      var s3 = k;
      while (k < n && rest[k] !== ",") k++;
      value = rest.slice(s3, k).trim();
    }
    if (name) fields[name] = value.replace(/\s+/g, " ").trim();
    // advance to next comma
    var comma = rest.indexOf(",", k);
    if (comma === -1) break;
    i = comma + 1;
  }
  return fields;
}

/* Format one author "Last, First Middle" (or "First Last") -> "F. M. Last". */
function formatAuthor(a) {
  a = a.trim();
  var last, firsts;
  if (a.indexOf(",") !== -1) {
    var parts = a.split(",");
    last = parts[0].trim();
    firsts = parts.slice(1).join(" ").trim();
  } else {
    var toks = a.split(/\s+/);
    last = toks.pop();
    firsts = toks.join(" ");
  }
  var initials = firsts.split(/\s+/).filter(Boolean)
    .map(function (w) { return w[0].toUpperCase() + "."; }).join(" ");
  var display = (initials ? initials + " " : "") + last;
  return { display: delatex(display), last: delatex(last) };
}

function formatAuthors(raw) {
  if (!raw) return "";
  var list = raw.split(/\s+and\s+/i).map(formatAuthor);
  return list.map(function (au) {
    var d = esc(au.display);
    if (au.last.toLowerCase() === MY_LASTNAME.toLowerCase()) {
      return '<span class="me">' + d + "</span>";
    }
    return d;
  }).join(", ");
}

/* Build the venue / status string. */
function venueHtml(f) {
  if (f.journal) {
    var v = "<em>" + esc(delatex(f.journal));
    if (f.volume) v += " " + esc(f.volume);
    if (f.number) v += "(" + esc(f.number) + ")";
    if (f.pages) v += ", " + esc(f.pages.replace(/--/g, "–"));
    if (f.year) v += " (" + esc(f.year) + ")";
    v += ".</em>";
    return v;
  }
  if (f.booktitle) {
    return "<em>" + esc(delatex(f.booktitle)) + (f.year ? " (" + esc(f.year) + ")" : "") + ".</em>";
  }
  // preprint / in prep
  var status = f.status || "Preprint";
  var out = '<span class="pub-status">' + esc(delatex(status));
  if (f.year && !/prep/i.test(status)) out += ", " + esc(f.year);
  if (f.arxiv) out += " · arXiv:" + esc(f.arxiv.replace(/^arxiv:/i, ""));
  out += ".</span>";
  return out;
}

/* The link the paper TITLE points to.
   Preference order: arXiv (free/open access) first, then journal, then DOI.
   To point a specific paper at its journal instead, delete that entry's
   `arxiv` line in publications.bib (or swap the order below). */
function primaryUrl(f) {
  if (f.arxiv) return 'https://arxiv.org/abs/' + f.arxiv.replace(/^arxiv:/i, '');
  if (f.url)   return f.url;
  if (f.doi)   return 'https://doi.org/' + f.doi.replace(/^doi:/i, '');
  return null;
}

function isPublished(f) {
  if (f.category) return /pub/i.test(f.category);
  return !!(f.journal || f.booktitle);
}

function renderPub(f) {
  var title = esc(delatex(f.title || "(untitled)"));
  var url = primaryUrl(f);
  var titleHtml = url
    ? '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + title + "</a>"
    : title;
  return '<li class="pub">' +
    '<span class="pub-title">' + titleHtml + "</span>" +
    '<span class="pub-authors">' + formatAuthors(f.author) + ". </span>" +
    '<span class="pub-venue">' + venueHtml(f) + "</span>" +
  "</li>";
}

function loadPublications() {
  var host = document.getElementById("publications");
  if (!host) return;
  fetch("publications.bib", { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
    .then(function (text) {
      var entries = parseBibtex(text);
      if (!entries.length) throw new Error("No entries found in publications.bib");
      var pre = entries.filter(function (e) { return !isPublished(e); });
      var pub = entries.filter(isPublished);
      var html = "";
      if (pre.length) {
        html += '<section class="block"><h2>Preprints</h2><ul class="pub-list">' +
                pre.map(renderPub).join("") + "</ul></section>";
      }
      if (pub.length) {
        html += '<section class="block"><h2>Publications</h2><ul class="pub-list">' +
                pub.map(renderPub).join("") + "</ul></section>";
      }
      host.innerHTML = html;
      typesetMath(host);
    })
    .catch(function (err) {
      showError(host, "Could not load publications.bib — " + err.message +
        ". If you just edited the file, check for a missing comma or brace.");
    });
}

/* ----------------------------------------------------------------------
   3. Generic JSON-driven sections (Talks / Teaching / Activities)
   Each item: { title, sub, meta, url }  (all optional except title)
   ---------------------------------------------------------------------- */
function renderEntries(items) {
  return items.map(function (it) {
    var title = it.url
      ? '<a href="' + esc(it.url) + '" target="_blank" rel="noopener">' + esc(it.title) + "</a>"
      : esc(it.title);
    var sub = it.sub ? '<div class="sub">' + subHtml(it.sub) + "</div>" : "";
    var meta = it.meta ? '<div class="meta">' + esc(it.meta) + "</div>" : "";
    return '<div class="entry"><div class="main"><div class="title">' + title +
           "</div>" + sub + "</div>" + meta + "</div>";
  }).join("");
}
function subHtml(sub) {
  // allow a { place: "..." } object or a plain string
  if (typeof sub === "object" && sub) {
    var out = [];
    if (sub.venue) out.push(esc(sub.venue));
    if (sub.place) out.push('<span class="place">' + esc(sub.place) + "</span>");
    if (sub.note) out.push(esc(sub.note));
    return out.join(" &middot; ");
  }
  return esc(sub);
}

function loadDataSection(hostId, file, opts) {
  var host = document.getElementById(hostId);
  if (!host) return;
  opts = opts || {};
  fetch(file, { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
    .then(function (data) {
      var html = "";
      if (opts.grouped) {
        // data is an array of { heading, items:[...] }
        data.forEach(function (g) {
          if (!g.items || !g.items.length) return;
          html += '<section class="block"><h2>' + esc(g.heading) + "</h2>" +
                  renderEntries(g.items) + "</section>";
        });
      } else {
        html += renderEntries(data);
      }
      host.innerHTML = html;
      typesetMath(host);
    })
    .catch(function (err) {
      showError(host, "Could not load " + file + " — " + err.message +
        ". Check the file for a missing comma, bracket, or quotation mark.");
    });
}

/* ----------------------------------------------------------------------
   MathJax (optional). Renders $...$ if the library is present.
   ---------------------------------------------------------------------- */
function typesetMath(el) {
  if (window.MathJax && window.MathJax.typesetPromise) {
    window.MathJax.typesetPromise([el]).catch(function () {});
  }
}

/* Kick everything off. */
document.addEventListener("DOMContentLoaded", function () {
  loadPublications();
  loadDataSection("talks", "data/talks.json", { grouped: true });
  loadDataSection("teaching", "data/teaching.json", { grouped: false });
  loadDataSection("activities", "data/activities.json", { grouped: false });
});
