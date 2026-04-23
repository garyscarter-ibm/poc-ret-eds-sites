import {
  buildStarRating,
  buildCtaButtons,
  classifyHeadings,
  findRatingDivs,
  findReviewDiv,
} from "../../scripts/block-utils.js";

export default function decorate(block) {
  const isMini = block.classList.contains("mini");
  // Shorter hero on about-us so content is visible above the fold
  if (window.location.pathname.startsWith("/about-us")) {
    block.classList.add("short");
  }

  const contentRow = block.children[1];
  if (!contentRow) return;

  const children = [...contentRow.children];

  // Find optional "Welcome To" paragraph (MINI-specific)
  const firstChild = children[0];
  if (firstChild) {
    const p = firstChild.querySelector("p");
    const h = firstChild.querySelector("h1, h2, h3, h4, h5, h6");
    if (p && !h && p.textContent.trim().length < 30) {
      p.classList.add("hero-dealership-welcome");
    }
  }

  // Classify headings
  const { subtitleDiv } = classifyHeadings(children, {
    titleClass: "hero-dealership-title",
    subtitleClass: "hero-dealership-subtitle",
  });

  // Build CTA buttons
  const result = buildCtaButtons(children, {
    containerClass: "hero-dealership-ctas",
    btnClass: "hero-dealership-btn",
    primaryClass: "hero-dealership-btn-primary",
    secondaryClass: "hero-dealership-btn-secondary",
    allSecondary: isMini,
  });
  if (result && subtitleDiv) subtitleDiv.after(result.container);

  // Build ratings
  const ratingDivs = findRatingDivs(children);
  const reviewDiv = findReviewDiv(children);

  if (ratingDivs.length > 0) {
    const ratingsContainer = document.createElement("div");
    ratingsContainer.className = "hero-dealership-ratings";
    const ratingsRow = document.createElement("div");
    ratingsRow.className = "hero-dealership-ratings-row";

    ratingDivs.forEach((d) => {
      const text = d.textContent.trim();
      const rating = buildStarRating(text, {
        labelClass: "hero-dealership-rating-label",
        starsRowClass: "hero-dealership-stars-row star-rating",
        scoreClass: "hero-dealership-rating-score",
        containerClass: "hero-dealership-rating",
      });
      if (rating) {
        ratingsRow.append(rating.container);
        d.remove();
      }
    });

    ratingsContainer.append(ratingsRow);

    if (reviewDiv) {
      const a = reviewDiv.querySelector("a");
      if (a) {
        a.className =
          "hero-dealership-reviews-link cta-chevron cta-chevron--white";
        a.href = "https://www.ibm.com/reports/analyst";
        ratingsContainer.append(a);
      }
      reviewDiv.remove();
    }

    contentRow.append(ratingsContainer);
  }

  // Redirect "View all reviews" link when not inside ratings
  if (reviewDiv) {
    const a = reviewDiv.querySelector("a");
    if (a) {
      a.href = "https://www.ibm.com/reports/analyst";
    }
  }

  // MINI: add decorative frame elements
  if (isMini) {
    const frame = document.createElement("div");
    frame.className = "hero-dealership-frame";
    frame.innerHTML =
      '<span class="frame-top"></span><span class="frame-right"></span><span class="frame-bottom"></span><span class="frame-left"></span>';
    block.append(frame);
  }
}
