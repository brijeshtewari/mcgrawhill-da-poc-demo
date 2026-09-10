/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-adventure-detail.js
  var import_adventure_detail_exports = {};
  __export(import_adventure_detail_exports, {
    default: () => import_adventure_detail_default
  });

  // tools/importer/parsers/breadcrumbs.js
  function parse(element, { document: document2 }) {
    const cells = [[""]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "breadcrumbs", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel.js
  function parse2(element, { document: document2 }) {
    const cells = [];
    const items = element.querySelectorAll(".cmp-carousel__item");
    const slides = items.length ? Array.from(items) : [element];
    slides.forEach((item) => {
      const img = item.querySelector(".cmp-teaser__image img, .cmp-image img, img");
      const title = item.querySelector(".cmp-teaser__title, h1, h2, h3");
      const description = item.querySelector(".cmp-teaser__description, p");
      const cta = item.querySelector(".cmp-teaser__action-link, a.button, a");
      const contentCell = [];
      if (title) contentCell.push(title);
      if (description) contentCell.push(description);
      if (cta) contentCell.push(cta);
      if (img || contentCell.length) {
        cells.push([img || "", contentCell.length ? contentCell : ""]);
      }
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs.js
  function parse3(element, { document: document2 }) {
    const cells = [];
    const tabLabels = Array.from(
      element.querySelectorAll(".cmp-tabs__tablist .cmp-tabs__tab, .cmp-tabs__tab")
    );
    const tabPanels = Array.from(element.querySelectorAll(".cmp-tabs__tabpanel"));
    tabLabels.forEach((labelEl, i) => {
      const label = labelEl.textContent.trim();
      const panel = tabPanels[i];
      let content = "";
      if (panel) {
        content = panel.querySelector(".cmp-contentfragment__elements, .cmp-contentfragment, .contentfragment") || panel;
      }
      if (label || content) {
        cells.push([label || "", content || ""]);
      }
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "tabs", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/wknd-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#destination_publishing_iframe_wkndsite_0",
        // Adobe ID syncing iframe
        "#toggleNav",
        // mobile nav toggle button
        "#mobileNav"
        // mobile navigation overlay
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header.cmp-experiencefragment--header",
        // site header experience fragment
        "footer.cmp-experiencefragment--footer",
        // site footer experience fragment
        "iframe",
        // any remaining embeds
        "meta",
        // stray inline <meta> tags left inside cmp-image blocks (e.g. lines 183, 204)
        "noscript",
        "link"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("data-cmp-data-layer");
        el.removeAttribute("data-cmp-hook-image");
        el.removeAttribute("onclick");
      });
    }
  }

  // tools/importer/transformers/wknd-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function sectionSelector(section) {
    return Array.isArray(section.selector) ? section.selector[0] : section.selector;
  }
  function transform2(hookName, element, payload) {
    const sections = payload.template && payload.template.sections || [];
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = element.querySelector(sectionSelector(section));
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || element.querySelector(sectionSelector(section));
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-adventure-detail.js
  var parsers = {
    breadcrumbs: parse,
    carousel: parse2,
    tabs: parse3
  };
  var PAGE_TEMPLATE = {
    name: "adventure-detail",
    description: "Detail page with breadcrumbs, an image carousel, and a tabbed information panel",
    urls: [
      "https://wknd.site/ca/en/adventures/bali-surf-camp.html"
    ],
    blocks: [
      {
        name: "breadcrumbs",
        instances: [".breadcrumb.cmp-breadcrumb--fixed", ".cmp-breadcrumb"]
      },
      {
        name: "carousel",
        instances: [".carousel.panelcontainer.cmp-carousel--mini", ".carousel.panelcontainer", ".cmp-carousel"]
      },
      {
        name: "tabs",
        instances: [".tabs.panelcontainer", ".cmp-tabs"]
      }
    ],
    sections: [
      { id: "logical-1", name: "breadcrumbs", selector: [".breadcrumb.cmp-breadcrumb--fixed", ".cmp-breadcrumb"], style: null, blocks: ["breadcrumbs"], defaultContent: [] },
      { id: "logical-2", name: "carousel", selector: [".carousel.panelcontainer.cmp-carousel--mini", ".carousel.panelcontainer"], style: null, blocks: ["carousel"], defaultContent: [] },
      { id: "logical-3", name: "adventure-detail-body", selector: [".cmp-layout-container--fixed", "main.container.responsivegrid.cmp-layout-container--fixed"], style: null, blocks: ["tabs"], defaultContent: [".title.cmp-title--underline", ".contentfragment.cmp-contentfragment--elements"] }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    const seen = /* @__PURE__ */ new Set();
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          if (seen.has(element)) return;
          seen.add(element);
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_adventure_detail_default = {
    transform: (payload) => {
      const {
        document: document2,
        url,
        html,
        params
      } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_adventure_detail_exports);
})();
