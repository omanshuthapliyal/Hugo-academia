---
# Project page template. Create a new one with:
#   hugo new projects/<short-name>.md
# Every field is optional except title/status/start_date/description.
# Anything left blank simply doesn't render on the page or the card.

title: "{{ replace .File.ContentBaseName "-" " " | title }}"
status: "active"            # "active" or "completed"
start_date: {{ now.Format "2006-01-02" }}
# end_date: 2026-12-31      # set when completed; drives list ordering
description: ""             # 1-2 sentences, plain language. Card summary + page lead.
organization: ""            # e.g. "Strategic Data Solutions Lab, Hitachi America Ltd."

# Right-hand "Project facts" panel. Both render as filter chips on /projects/.
tags: []                    # topics, e.g. ["world-models", "data-centers"]
stack: []                   # tools, e.g. ["PyTorch", "Gymnasium"]

# Card thumbnail on /projects/ (16:9, ~1280x720, in static/images/projects/).
image: ""
image_alt: ""

# Hero at the top of the page, first match wins:
#   hero_video (mp4) -> hero_image (e.g. a GIF) -> image.
# hero_still = still frame shown to visitors who turn off motion.
# Remove company branding from any screen capture before publishing.
# hero_image: ""
# hero_still: ""
hero_alt: ""
image_caption: ""

# Link buttons under the title. paper/patent accept a URL or a site
# path like "papers/pub17" / "patents/patent-07".
# paper: ""
# patent: ""
# code: ""
# demo: ""
# slides: ""
# links:
#   - label: "Dataset"
#     url: ""

# "Related outputs" list at the bottom (site paths: papers/..., patents/...,
# blog/...).
related: []

# "External resources" list at the bottom: lab pages, articles, project
# sites. Not shown as buttons under the title.
# resources:
#   - label: "Lab page: ..."
#     url: ""
---

## Problem

<!-- 2-4 sentences: the problem and why it matters. Plain language, no em dashes. -->

## Approach

<!-- 2-4 sentences: what you built, at a research-marketing level. -->

## Outcome

<!-- 3-5 bullets, each opening with a short bold claim. Only verified results. -->
- **Outcome one.** One sentence of detail.
