# Royal Grace Exportindo

English export company website with a cream, forest-green and gold design. The static HTML, CSS, and JavaScript files are ready for GitHub Pages.

- Home, About Us, Products, Export Services and Contact pages.
- Six standalone product pages with specifications, applications, galleries, videos and PDF spec sheets.
- Catalog search and category filters, export guides and a browser-based quotation form. The form creates a draft summary for download, copying, email or WhatsApp. The buyer chooses how to share it.
- Original company profile, reference photographs, supplied videos and the two existing photo presentations.

## Open the website

Extract the ZIP and open `royal-grace-exportindo/index.html`. For the full experience, serve the extracted folder locally with an HTTP server, for example `python -m http.server 8000`, and open `http://localhost:8000`. This mirrors GitHub Pages and enables features that the browser may limit when opening local files directly.

For manual deployment, use [UPLOAD-GUIDE.md](UPLOAD-GUIDE.md). The published site uses the HTML files already in this folder. It does not require a package installation or build step.

## Edit the site

| File | Purpose |
| --- | --- |
| `render-pages.mjs` | Templates for the public pages, navigation and footer. |
| `catalog-data.js` | Company details, product text, specifications, visual references and videos. |
| `app.js` | Search, filters, gallery controls, buyer guides and RFQ behavior. |
| `style.css` | Layout, colors, typography and responsive rules. |
| `site-config.js` | Optional final URL for page canonical and social metadata. |
| `assets/editorial/` | Crops from the attached design references, illustrative landscape backgrounds and a map. |
| `assets/media/` | Existing photos, videos, posters and visual description tracks. |
| `assets/specs/` | Downloadable product spec sheets. |

After editing page templates or product data, run `node render-pages.mjs` from this folder. When product specifications or packing change, update the corresponding PDF in `assets/specs/` as well.

## Product information and imagery

Specification figures come from the supplied company profile. Activated carbon and sulfur laboratory values apply to the tested samples. Confirm the actual batch specification, packing and required documents with the export team. The visual references provide styling and editorial illustrations. They do not establish product grade, origins, certification or the appearance of a shipment.

The home landscape and activated carbon plantation backgrounds are generated editorial images. The world map uses Natural Earth data distributed with QGIS. The map highlights Indonesia and marks Jakarta. See [MEDIA-SOURCES.json](MEDIA-SOURCES.json) for the supplied footage and photo presentations. The English visual tracks describe the images on screen. Supplied audio is retained where present.
