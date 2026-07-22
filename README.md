# Saehoon Eo — personal academic website

A lightweight, self-contained static website. No build step, no frameworks —
just HTML, CSS, and a little JavaScript. Your publications are generated from a
**BibTeX** file, and Talks / Teaching / Activities from small data files, so you
can update everything without touching HTML.

---

## 1. Publish it to the web (browser only, ~5 minutes)

Your GitHub username is **Saehoon-Eo**, so your site will live at
**https://saehoon-eo.github.io**.

1. Go to <https://github.com/new>.
2. **Repository name:** type exactly `Saehoon-Eo.github.io`
   (this exact name is what makes it your main site).
3. Set it to **Public**, then click **Create repository**.
4. On the new empty repo page, click **“uploading an existing file”**.
5. Drag **all the contents of this folder** into the upload box
   (the `.html` files, the `assets` folder, the `data` folder,
   `publications.bib`, `.nojekyll`, etc. — everything).
   *Tip: also drag the hidden `.nojekyll` file; if your file browser hides it,
   that’s fine — the site still works without it, it just loads slightly faster.*
6. Click **Commit changes**.
7. Go to the repo’s **Settings → Pages**. Under **Build and deployment**,
   set **Source = “Deploy from a branch”**, **Branch = `main`**, **folder = `/ (root)`**,
   and **Save**.
8. Wait 1–2 minutes, then open **https://saehoon-eo.github.io**. Done. 🎉

*(Optional later: a custom domain like `saehooneo.com` can be added under the
same Settings → Pages screen.)*

---

## 2. How to update your site

You edit a file, commit the change on GitHub (pencil icon → edit → **Commit**),
and the site updates automatically in a minute or two.

### Add / edit a publication  → `publications.bib`
Open `publications.bib` and copy one of the existing blocks to the top, then
edit it. Example:

```bibtex
@article{eo2026newpaper,
  title   = {My brand-new paper title},
  author  = {Eo, Saehoon and Coauthor, First},
  year    = {2026},
  status  = {Preprint},
  arxiv   = {2601.01234}
}
```

Rules of thumb:
- A block **with** a `journal = {...}` field appears under **Publications**;
  a block **without** one appears under **Preprints**.
- Separate authors with `" and "`, written `Last, First`. Your name (**Eo**)
  is automatically shown in **bold**.
- Papers appear in the same order they’re listed in the file.
- The **paper’s title is the link**. It points to arXiv if you provide an
  `arxiv = {ID}` field; otherwise to the journal `url = {publisher link}`
  (or a `doi = {10.xxxx/...}`). So to link a title to arXiv, add an `arxiv`
  line; to link it to the journal instead, remove the `arxiv` line and keep
  the `url` line.

### Add / edit a talk  → `data/talks.json`
Two groups: `"Invited Talks"` and `"Presentations & Group Seminars"`.
Copy an existing item and edit the text:

```json
{ "title": "My talk title", "sub": "Seminar name · Institution", "meta": "Mar 5, 2027" }
```

### Add / edit a course  → `data/teaching.json`
```json
{ "title": "Math 220: Course Name", "sub": "Teaching Assistant · Stanford University", "meta": "Spring 2027" }
```

### Add / edit a conference or program  → `data/activities.json`
```json
{
  "title": "Workshop name",
  "sub": { "venue": "Host institution", "place": "City, Country" },
  "meta": "Jun 1–5, 2027",
  "url": "https://link-to-the-event"
}
```
(The `"url"` line is optional — leave it out if there’s no link.)

> **Careful with commas and quotes** in the `.json` files: every item is wrapped
> in `{ }`, items are separated by commas, and there is **no comma after the last
> item**. If a list ever shows an error box on the page, it’s almost always a
> missing comma or quote here.

### Add your photo
1. Put a portrait image at `assets/img/profile.jpg` (recommended ~600×750 px, 4:5).
2. In `index.html`, delete the `<div class="placeholder">…</div>` line and
   uncomment the `<img …>` line just above it.

### Add Google Scholar / arXiv / ORCID links
In `index.html`, find the commented block under `<ul class="contacts">` and
uncomment/fill in the links you want.

### Change your CV
Replace `assets/pdf/cv.pdf` with your latest CV (keep the same filename).

### Change the accent color / fonts
Open `assets/css/style.css` and edit the values at the very top (`:root { … }`).

---

## 3. What’s in this folder

```
index.html          About page (bio, photo, education, links)
publications.html   Publications page  (reads publications.bib)
talks.html          Talks page         (reads data/talks.json)
teaching.html       Teaching page      (reads data/teaching.json)
activities.html     Activities page    (reads data/activities.json)
publications.bib    ← your papers (BibTeX)
data/               ← talks / teaching / activities data files
assets/css/         stylesheet
assets/js/          site.js (renders the pages) + vendored MathJax
assets/pdf/cv.pdf   your CV
assets/img/         put profile.jpg here
favicon.svg         little "SE" browser-tab icon
.nojekyll           tells GitHub Pages to serve files as-is
```

## 4. Preview locally before publishing (optional)
If you have Python installed, open a terminal in this folder and run:
```
python3 -m http.server 8000
```
then visit <http://localhost:8000>. (Just double-clicking the HTML files won’t
load the publications list, because browsers block reading local data files —
a tiny local server like the one above fixes that.)

---

Math in titles: anything you write between `$…$` (e.g. `$L^2$`) renders
automatically via the bundled MathJax.
