export default async function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const wrapper = document.createElement("div");
  wrapper.className = "brochure-blockquote-layout";

  // Detect which row has the image vs quote text
  let imageRow = null;
  let quoteRow = null;
  rows.forEach((row) => {
    if (!imageRow && row.querySelector("img")) {
      imageRow = row;
    } else if (!quoteRow) {
      quoteRow = row;
    }
  });

  const imageCol = document.createElement("div");
  imageCol.className = "brochure-blockquote-image animate-child";
  const img = imageRow?.querySelector("img");
  if (img) {
    img.loading = "lazy";
    const picture = img.closest("picture") || img;
    imageCol.append(picture);
  }

  const quoteCol = document.createElement("div");
  quoteCol.className = "brochure-blockquote-text animate-child";
  if (quoteRow) {
    const content = quoteRow.querySelector(":scope > div") || quoteRow;
    const bq = document.createElement("blockquote");
    bq.append(...[...content.childNodes].map((n) => n.cloneNode(true)));
    quoteCol.append(bq);
  }

  wrapper.append(imageCol, quoteCol);
  block.textContent = "";
  block.append(wrapper);
}
